from fastapi import APIRouter, HTTPException

from src.api.dependencies import AdminOnly, DbDep
from src.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate


router = APIRouter(prefix='/categories', tags=['Categories'])


@router.get('/', response_model=list[CategoryRead])
async def get_categories(db: DbDep):
	return await db.categories.get_all()


@router.get('/{category_id}', response_model=CategoryRead)
async def get_category(category_id: int, db: DbDep):
	category = await db.categories.get_one_or_none(id=category_id)

	if not category:
		raise HTTPException(
			status_code=404,
			detail='Категория не найдена',
		)

	return category


@router.post('/', response_model=CategoryRead)
async def create_category(
	data: CategoryCreate,
	db: DbDep,
	_: dict = AdminOnly,
):
	category = await db.categories.add(data)
	await db.commit()
	return category


@router.patch('/{category_id}', response_model=CategoryRead)
async def update_category(
	category_id: int,
	data: CategoryUpdate,
	db: DbDep,
	_: dict = AdminOnly,
):
	category = await db.categories.get_one_or_none(id=category_id)

	if not category:
		raise HTTPException(
			status_code=404,
			detail='Категория не найдена',
		)

	updated_category = await db.categories.edit(
		data=data,
		id=category_id,
		exclude_unset=True,
	)

	await db.commit()
	return updated_category


@router.delete('/{category_id}')
async def delete_category(
	category_id: int,
	db: DbDep,
	_: dict = AdminOnly,
):
	deleted = await db.categories.delete(id=category_id)

	if deleted == 0:
		raise HTTPException(
			status_code=404,
			detail='Категория не найдена',
		)

	await db.commit()
	return {'status': 'deleted'}
