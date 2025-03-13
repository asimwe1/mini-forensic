from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import endpoint  # Import your API routes

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your API routes
app.include_router(endpoint.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Mini Forensic API"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)