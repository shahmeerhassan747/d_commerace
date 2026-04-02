from pydantic import BaseModel
from typing import Optional

class WhishlistResponse(BaseModel):
    id: int
    product_name: Optional[str] = None
    product_price: Optional[float] = None
    product_discount: Optional[int] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
