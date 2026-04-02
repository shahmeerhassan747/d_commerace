from pydantic import BaseModel
from typing import Optional

class CartBase(BaseModel):
    product_id: int
    user_id: int
    total_amount: float

class CartCreate(CartBase):
    pass

class CartResponse(CartBase):
    id: int

    class Config:
        from_attributes = True
