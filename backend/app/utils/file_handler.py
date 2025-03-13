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