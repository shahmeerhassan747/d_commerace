from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Product
from app.api.models.update__product_models import ProductUpdate, ProductResponse

router = APIRouter()

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing product.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update only the fields provided in the request
    update_data = product_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)

    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
