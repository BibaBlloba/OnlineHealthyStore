from contextlib import asynccontextmanager
import sys
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.exc import DBAPIError, IntegrityError

sys.path.append(str(Path(__file__).parent.parent))

from src.api.auth import router as router_auth
from src.api.cart import router as router_cart
from src.api.category import router as router_categories
from src.api.orders import router as router_orders
from src.api.reviews import router as router_reviews
from src.api.products import router as router_products
from src.utils.admin_create import create_admin, seed_roles
from src.utils.db_errors import get_db_error_details
from src.utils.db_manager import DbManager
from src.database import async_session_maker


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with DbManager(session_factory=async_session_maker) as db:
        await seed_roles(db)
        await create_admin(db)
    yield


origins = [
    'http://localhost',
    'http://localhost:5173',
]

app = FastAPI(lifespan=lifespan)
app.include_router(router_auth)
app.include_router(router_cart)
app.include_router(router_categories)
app.include_router(router_orders)
app.include_router(router_reviews)
app.include_router(router_products)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.mount('/static', StaticFiles(directory='static'), name='static')


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_, exception: IntegrityError):
    status_code, detail = get_db_error_details(exception)
    return JSONResponse(status_code=status_code, content={'detail': detail})


@app.exception_handler(DBAPIError)
async def dbapi_error_handler(_, exception: DBAPIError):
    status_code, detail = get_db_error_details(exception)
    return JSONResponse(status_code=status_code, content={'detail': detail})


if __name__ == '__main__':
    uvicorn.run(
        'src.main:app',
        reload=True,
    )
