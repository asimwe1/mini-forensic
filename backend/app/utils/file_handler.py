import os
import boto3
import magic
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuration
UPLOAD_FOLDER = '../../../uploads'
ALLOWED_MIME_TYPES = {'text/plain', 'application/pdf', 'image/jpeg', 'image/png', 'image/gif'}
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def allowed_file(filename: str) -> bool:
    mime_type = magic.from_buffer(file_content[:2048], mime=True)
    return mime_type in ALLOWED_MIME_TYPES

def validate_file(file: UploadFile) -> None:
    # Check file size
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > MAX_FILE_SIZE:
        raise FileValidationError(detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB")
    
    # Check file extension
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        raise FileValidationError(detail="File type not allowed")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    return JSONResponse(content={"message": "File successfully uploaded"}, status_code=200)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, debug=True)