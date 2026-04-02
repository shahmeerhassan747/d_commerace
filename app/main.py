
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError 

from app.logging_config import setup_logging
from app.shared.middleware.cors import get_cors_middleware
from sqlalchemy.exc import IntegrityError

from app.router.routes import api_router_registry
from app.shared.exceptions.handlers import (
    generic_exception_handler,
    sqlalchemy_integrity_error_handler,
    validation_error_handler,
)
from app.shared.middleware.generic_response import generic_response_middleware


# Configure logging early (reads AppConfig if available)
setup_logging()

app = FastAPI(title="Privacy Pilot", version="0.0.1")
 
# Initialize DB engine on app startup and dispose on shutdown
from app.database.database import init_app as _init_db_app
_init_db_app(app)


# Enable CORS middleware
cors_config = get_cors_middleware()
app.add_middleware(cors_config["middleware_class"], **cors_config["options"])

# Register generic response middleware
app.middleware("http")(generic_response_middleware)


# Register global exception handlers
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(IntegrityError, sqlalchemy_integrity_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Root route: health and available routes
@app.get("/")
def root(request: Request):
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods)
            })
    return {
        "status": "ok",
        "message": "Backend is running",
        "available_routes": routes
    }

# Attach all API routers
app.include_router(api_router_registry.router)
  
