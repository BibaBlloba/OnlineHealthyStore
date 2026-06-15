from src.models.product_image import ProductImage
from src.repos.base import BaseRepository
from src.repos.mappers import ProductImageDataMapper


class ProductImagesRepository(BaseRepository):
    model = ProductImage
    mapper = ProductImageDataMapper
