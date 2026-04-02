from pydantic import BaseModel
from typing import Optional, List

class ProductSearchResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    discount: int
    sold: float
    custom: Optional[str] = None
    key_features: Optional[str] = None
    category: Optional[str] = None
    image_base64: Optional[str] = None

    class Config:
        from_attributes = True

class SearchResults(BaseModel):
    items: List[ProductSearchResponse]
    total: int
