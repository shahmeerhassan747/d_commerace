from pydantic import BaseModel
from typing import Optional

class CartUpdate(BaseModel):
    product_id: Optional[int] = None
    user_id: Optional[int] = None
    total_amount: Optional[float] = None

class CartUpdateResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    total_amount: float

    class Config:
        from_attributes = True
