from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Product
from app.api.models.post__product_models import ProductCreate, ProductResponse

router = APIRouter()

@router.post("/products", response_model=ProductResponse)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_data: ProductCreate
) -> Any:
    """
    Create a new product.
    """
    try:
        # Create new product instance
        db_product = Product(
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            quantity=product_data.quantity,
            discount=product_data.discount,
            sold=product_data.sold,
            custom=product_data.custom,
            key_features=product_data.key_features,
            image=product_data.image
        )

        # Add to database
        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        return db_product

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database integrity error. Please check your data."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the product: {str(e)}"
        )
