from pydantic import BaseModel

class UserDeleteResponse(BaseModel):
    success: bool
    message: str
