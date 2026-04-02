from pydantic import BaseModel
from typing import Optional

class SpecificProductResponse(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    discount: Optional[int] = 0
    sold: Optional[float] = 0.0
    custom: Optional[str] = None
    key_features: Optional[str] = None
    rating: Optional[float] = None
    review_count: int
    image: Optional[str] = None

    class Config:
        from_attributes = True
