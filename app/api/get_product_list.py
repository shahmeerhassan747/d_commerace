from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any

from app.database import get_db
from app.database.schema import Product, Review
from app.api.models.get_product_list_models import PaginatedProductListResponse

router = APIRouter()

@router.get("/products/list", response_model=PaginatedProductListResponse)
def get_product_list(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a paginated list of products and their review counts grouped by rating.
    """
    offset = (page - 1) * limit

    # Get total count of products
    total_products = db.query(Product).count()

    # Get paginated results
    results = (
        db.query(
            Product.id,
            Product.name,
            Product.price,
            Product.image,
            Review.rating,
            func.count(Review.id).label("review_count")
        )
        .outerjoin(Review, Review.product_id == Product.id)
        .group_by(Product.id, Product.name, Product.price, Product.image, Review.rating)
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    products = []
    for row in results:
        products.append({
            "id": row.id,
            "name": row.name,
            "price": row.price,
            "image": row.image,
            "rating": row.rating,
            "review_count": row.review_count
        })

    return {
        "total": total_products,
        "page": page,
        "limit": limit,
        "products": products
    }
