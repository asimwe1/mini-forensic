from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoint import router as endpoint
from services.memory_analysis import app_celery




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
# app.include_router(endpoint.routes)


@app.get("/task-status/{task_id}")
def read_task_status(task_id: str):
    task_result = app_celery.AsyncResult(task_id)
    return {"status": task_result.status, "result": task_result.result if task_result.ready() else None}



@app.get("/")
def read_root():
    return {"message": "Welcome to the Mini Forensic API"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)