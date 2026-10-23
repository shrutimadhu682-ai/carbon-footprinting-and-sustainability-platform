import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database.connection import engine, Base, SessionLocal
from .api.calculations import router as calculations_router
from .api.datasets import router as datasets_router, ensure_demo_datasets_registered
from .api.dashboard import router as dashboard_router
from .api.ml import router as ml_router
from .api.recommendations import router as recommendations_router
from .api.reports import router as reports_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("carbon-platform")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo datasets
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        ensure_demo_datasets_registered(db)
        logger.info("Demo datasets verified and registered successfully.")
    except Exception as e:
        logger.error(f"Error seeding demo datasets: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown logic if any
    logger.info("Shutting down carbon platform backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Full-stack Carbon Footprinting, ESG Analytics, Machine Learning & Sustainability Recommendations Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(calculations_router, prefix=settings.API_V1_PREFIX)
app.include_router(datasets_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(ml_router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)

@app.get("/api/health", tags=["Health"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "database": "SQLite (Connected)",
        "features": [
            "Carbon Footprint Calculator",
            "10-Stage Data Processing Pipeline",
            "Scikit-learn Regression & Clustering",
            "Power BI Style ESG Dashboard",
            "Transparent Sustainability Recommendations",
            "Executive Reporting & Export"
        ]
    }

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please verify your request parameters."}
    )
