from fastapi import APIRouter

# Import individual routers
from app.api.post__product import router as product_router
from app.api.add_reviews import router as review_router
from app.api.add_cart import router as cart_router
from app.api.add_users import router as user_router
from app.api.add_whishlist import router as whishlist_router
from app.api.update__product import router as product_update_router
from app.api.update_review import router as review_update_router
from app.api.update_users import router as user_update_router
from app.api.update_cart import router as cart_update_router
from app.api.update_whishlist import router as whishlist_update_router
from app.api.delete_product import router as product_delete_router
from app.api.delete_reviews import router as review_delete_router
from app.api.delete_cart import router as cart_delete_router
from app.api.delete_users import router as user_delete_router
from app.api.delete_whishlist import router as whishlist_delete_router
from app.api.get_product_list import router as product_list_router
from app.api.get_specifiic_product import router as specific_product_router
from app.api.get_users import router as get_users_router
from app.api.get_reviews import router as get_reviews_router
from app.api.get_cart import router as get_cart_router
from app.api.get_whishlist import router as get_whishlist_router
from app.api.auth import router as auth_router
from app.api.search_product import router as product_search_router

class APIRouterRegistry:
    """
    Central registry for all API routers.
    """

    def __init__(self):
        self.router = APIRouter()
        self.include_all()

    def include_all(self):
        # Include the product router
        self.router.include_router(product_router, tags=["Products"])
        
        # Include the review router
        self.router.include_router(review_router, tags=["Reviews"])

        # Include the cart router
        self.router.include_router(cart_router, tags=["Cart"])

        # Include the user router
        self.router.include_router(user_router, tags=["Users"])

        # Include the whishlist router
        self.router.include_router(whishlist_router, tags=["Whishlist"])

        # Include the update product router
        self.router.include_router(product_update_router, tags=["Products"])

        # Include the update review router
        self.router.include_router(review_update_router, tags=["Reviews"])

        # Include the update user router
        self.router.include_router(user_update_router, tags=["Users"])

        # Include the update cart router
        self.router.include_router(cart_update_router, tags=["Cart"])

        # Include the update whishlist router
        self.router.include_router(whishlist_update_router, tags=["Whishlist"])

        # Include the delete product router
        self.router.include_router(product_delete_router, tags=["Products"])

        # Include the delete review router
        self.router.include_router(review_delete_router, tags=["Reviews"])

        # Include the delete cart router
        self.router.include_router(cart_delete_router, tags=["Cart"])

        # Include the delete user router
        self.router.include_router(user_delete_router, tags=["Users"])

        # Include the delete whishlist router
        self.router.include_router(whishlist_delete_router, tags=["Whishlist"])

        # Include the get product list router
        self.router.include_router(product_list_router, tags=["Products"])

        # Include the get product_search_router
        self.router.include_router(product_search_router, tags=["Products"])

        # Include the get users router
        self.router.include_router(get_users_router, tags=["Users"])

        # Include the get reviews router
        self.router.include_router(get_reviews_router, tags=["Reviews"])

        # Include the get cart router
        self.router.include_router(get_cart_router, tags=["Cart"])

        # Include the get whishlist router
        self.router.include_router(get_whishlist_router, tags=["Whishlist"])

        # Include the auth router
        self.router.include_router(auth_router, tags=["Auth"])

        # Include the  get specific product_router 
        self.router.include_router(specific_product_router, tags=["Products"])


api_router_registry = APIRouterRegistry()
