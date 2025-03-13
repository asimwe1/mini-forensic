from fastapi import APIRouter

router = APIRouter()

@router.get("/api")
def example_route():
    return {"message": "This is an example route"}