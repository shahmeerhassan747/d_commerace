from pydantic import BaseModel

class WhishlistDeleteResponse(BaseModel):
    success: bool
    message: str
