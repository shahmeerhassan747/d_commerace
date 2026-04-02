from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    discount: Optional[int] = 0
    sold: Optional[float] = 0.0
    custom: Optional[str] = None
    key_features: Optional[str] = None
    image: Optional[str] = None


class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True
