from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any

from app.database import get_db
from app.database.schema import Product, Review
from app.api.models.get_specifiic_product_models import SpecificProductResponse

router = APIRouter()

@router.get("/products/{product_id}", response_model=List[SpecificProductResponse])
def get_specific_product(
    product_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific product and its review counts grouped by rating.
    """
    results = (
        db.query(
            Product.name,
            Product.description,
            Product.price,
            Product.quantity,
            Product.discount,
            Product.sold,
            Product.custom,
            Product.key_features,
            Product.image,
            Review.rating,
            func.count(Review.id).label("review_count")
        )
        .outerjoin(Review, Review.product_id == Product.id)
        .filter(Product.id == product_id)
        .group_by(
            Product.name,
            Product.description,
            Product.price,
            Product.quantity,
            Product.discount,
            Product.sold,
            Product.custom,
            Product.key_features,
            Product.image,
            Review.rating
        )
        .all()
    )

    if not results:
        # Check if the product itself exists
        product_exists = db.query(Product.id).filter(Product.id == product_id).first()
        if not product_exists:
            raise HTTPException(status_code=404, detail="Product not found")

    products = []
    for row in results:
        products.append({
            "name": row.name,
            "description": row.description,
            "price": row.price,
            "quantity": row.quantity,
            "discount": row.discount,
            "sold": row.sold,
            "custom": row.custom,
            "key_features": row.key_features,
            "image": row.image,
            "rating": row.rating,
            "review_count": row.review_count
        })

    return products
