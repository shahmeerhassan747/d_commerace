from pydantic import BaseModel

class ReviewDeleteResponse(BaseModel):
    success: bool
    message: str
