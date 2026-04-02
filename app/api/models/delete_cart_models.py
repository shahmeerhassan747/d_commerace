from pydantic import BaseModel

class CartDeleteResponse(BaseModel):
    success: bool
    message: str
