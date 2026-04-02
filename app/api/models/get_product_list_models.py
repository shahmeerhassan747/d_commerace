from pydantic import BaseModel
from typing import Optional, List

class ProductListResponse(BaseModel):
    id: int
    name: str
    price: float
    rating: Optional[float] = None
    review_count: int
    image: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedProductListResponse(BaseModel):
    total: int
    page: int
    limit: int
    products: List[ProductListResponse]
