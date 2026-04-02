from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.database import get_db
from app.database.schema import Product
from app.api.models.search_product_models import ProductSearchResponse

router = APIRouter()

@router.get("/products/search", response_model=List[ProductSearchResponse])
def search_products(
    name: Optional[str] = Query(None, description="Search by product name (case-insensitive)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))
    
    if category:
        query = query.filter(Product.category == category)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    return query.all()
