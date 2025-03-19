import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from core.db import get_db
from core.auth import create_access_token, verify_password, get_password_hash
from models.user import User
from core.config import settings
import requests
import json

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])

# Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class OAuthCallbackParams(BaseModel):
    code: str
    state: Optional[str] = None

# Traditional login route
@router.post("/login", response_model=Token)
async def login(form_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate JWT token
    access_token = create_access_token(
        user_id=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
        }
    }

# User registration
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        created_at=datetime.utcnow(),
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User created successfully"}

# GitHub OAuth endpoints
@router.get("/github/login")
async def github_login():
    github_auth_url = "https://github.com/login/oauth/authorize"
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "user:email",
        "state": "github-state"  # Should be a random, unique value in production
    }
    
    authorize_url = f"{github_auth_url}?client_id={params['client_id']}&redirect_uri={params['redirect_uri']}&scope={params['scope']}&state={params['state']}"
    return {"authorize_url": authorize_url}

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code missing"
        )
    
    # Exchange code for access token
    token_url = "https://github.com/login/oauth/access_token"
    payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.GITHUB_REDIRECT_URI
    }
    
    headers = {"Accept": "application/json"}
    response = requests.post(token_url, data=payload, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve access token from GitHub"
        )
    
    token_data = response.json()
    access_token = token_data.get("access_token")
    
    # Get user info from GitHub
    user_url = "https://api.github.com/user"
    email_url = "https://api.github.com/user/emails"
    
    user_response = requests.get(
        user_url,
        headers={"Authorization": f"token {access_token}"}
    )
    
    email_response = requests.get(
        email_url,
        headers={"Authorization": f"token {access_token}"}
    )
    
    if user_response.status_code != 200 or email_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve user information from GitHub"
        )
    
    user_info = user_response.json()
    email_info = email_response.json()
    
    # Get primary email
    primary_email = None
    for email in email_info:
        if email.get("primary") and email.get("verified"):
            primary_email = email.get("email")
            break
    
    if not primary_email:
        primary_email = user_info.get("email")
    
    if not primary_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid email found"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == primary_email).first()
    
    if not user:
        # Create new user
        username = user_info.get("login")
        # Check if username exists
        if db.query(User).filter(User.username == username).first():
            username = f"{username}-{user_info.get('id')}"
        
        user = User(
            username=username,
            email=primary_email,
            full_name=user_info.get("name"),
            hashed_password=get_password_hash(f"github-{user_info.get('id')}"),  # Random password as user will authenticate via GitHub
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate JWT token
    token = create_access_token(
        user_id=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Redirect to frontend with token
    redirect_url = f"{settings.FRONTEND_URL}?token={token}"
    return {"redirect_url": redirect_url}

# Google OAuth endpoints
@router.get("/google/login")
async def google_login():
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": "google-state"  # Should be a random, unique value in production
    }
    
    authorize_url = f"{google_auth_url}?client_id={params['client_id']}&redirect_uri={params['redirect_uri']}&response_type={params['response_type']}&scope={params['scope']}&access_type={params['access_type']}&state={params['state']}"
    return {"authorize_url": authorize_url}

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code missing"
        )
    
    # Exchange code for access token
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    response = requests.post(token_url, data=payload)
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve access token from Google"
        )
    
    token_data = response.json()
    access_token = token_data.get("access_token")
    id_token = token_data.get("id_token")
    
    # Get user info from Google
    user_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    user_response = requests.get(
        user_url,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if user_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve user information from Google"
        )
    
    user_info = user_response.json()
    
    email = user_info.get("email")
    if not email or not user_info.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid email found or email not verified"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        sub = user_info.get("sub")  # Google's unique user ID
        username = email.split("@")[0]
        
        # Check if username exists
        if db.query(User).filter(User.username == username).first():
            username = f"{username}-{sub[-6:]}"  # Use last 6 chars of sub as suffix
        
        user = User(
            username=username,
            email=email,
            full_name=f"{user_info.get('given_name', '')} {user_info.get('family_name', '')}".strip(),
            hashed_password=get_password_hash(f"google-{sub}"),  # Random password as user will authenticate via Google
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate JWT token
    token = create_access_token(
        user_id=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Redirect to frontend with token
    redirect_url = f"{settings.FRONTEND_URL}?token={token}"
    return {"redirect_url": redirect_url} 