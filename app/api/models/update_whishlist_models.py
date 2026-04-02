from pydantic import BaseModel
from typing import Optional

class WhishlistUpdate(BaseModel):
    product_id: Optional[int] = None
    user_id: Optional[int] = None

class WhishlistUpdateResponse(BaseModel):
    id: int
    product_id: int
    user_id: int

    class Config:
        from_attributes = True
