from src.models.productImage import ProductImage
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import ProductImagesDataMapper


class ProductImagesRepository(BaseRepository):
    model = ProductImage
    mapper = ProductImagesDataMapper
