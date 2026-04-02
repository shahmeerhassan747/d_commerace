from pydantic import BaseModel
from typing import Optional

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    discount: Optional[int] = None
    sold: Optional[float] = None
    custom: Optional[str] = None
    key_features: Optional[str] = None
    image: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    discount: int
    sold: float
    custom: Optional[str] = None
    key_features: Optional[str] = None
    image: Optional[str] = None

    class Config:
        from_attributes = True
