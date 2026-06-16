import sys
from pathlib import Path

import uvicorn
from fastapi import FastAPI

sys.path.append(str(Path(__file__).parent.parent))

from src.api.auth import router as router_auth
from src.api.products import router as router_products

app = FastAPI()
app.include_router(router_auth)
app.include_router(router_products)

if __name__ == '__main__':
    uvicorn.run(
        'src.main:app',
        reload=True,
    )
