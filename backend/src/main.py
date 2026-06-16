from contextlib import asynccontextmanager
import sys
from pathlib import Path

import uvicorn
from fastapi import FastAPI

sys.path.append(str(Path(__file__).parent.parent))

from src.api.auth import router as router_auth
from src.api.products import router as router_products
from src.utils.admin_create import create_admin
from src.utils.db_manager import DbManager
from src.database import async_session_maker


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with DbManager(session_factory=async_session_maker) as db:
        await create_admin(db)
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(router_auth)
app.include_router(router_products)


if __name__ == '__main__':
    uvicorn.run(
        'src.main:app',
        reload=True,
    )
