from fastapi import APIRouter, HTTPException

from src.api.dependencies import CurrentUserDep, DbDep
from src.schemas.review import ReviewCreate, ReviewRead, ReviewUpdate


router = APIRouter(prefix='/reviews', tags=['Reviews'])


async def _get_review_or_404(review_id: int, db: DbDep):
    review = await db.reviews.get_one_or_none(id=review_id)

    if not review:
        raise HTTPException(status_code=404, detail='Отзыв не найден')

    return review


def _ensure_review_owner_or_admin(review, current_user: CurrentUserDep):
    if current_user['role'] == 'admin':
        return

    if review.user_id != current_user['user_id']:
        raise HTTPException(status_code=403, detail='Недостаточно прав')


@router.get('/', response_model=list[ReviewRead])
async def get_reviews(db: DbDep):
    return await db.reviews.get_all()


@router.get('/{review_id}', response_model=ReviewRead)
async def get_review(review_id: int, db: DbDep):
    return await _get_review_or_404(review_id, db)


@router.post('/', response_model=ReviewRead)
async def create_review(
    data: ReviewCreate,
    db: DbDep,
    current_user: CurrentUserDep,
):
    product = await db.products.get_one_or_none(id=data.product_id)

    if not product:
        raise HTTPException(status_code=404, detail='Товар не найден')

    review = await db.reviews.add(
        ReviewCreate(
            rating=data.rating,
            comment=data.comment,
            product_id=data.product_id,
            user_id=current_user['user_id'],
        )
    )

    await db.commit()

    return review


@router.patch('/{review_id}', response_model=ReviewRead)
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: DbDep,
    current_user: CurrentUserDep,
):
    review = await _get_review_or_404(review_id, db)
    _ensure_review_owner_or_admin(review, current_user)

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail='Нет данных для обновления')

    product_id = update_data.get('product_id', review.product_id)

    if product_id is not None:
        product = await db.products.get_one_or_none(id=product_id)

        if not product:
            raise HTTPException(status_code=404, detail='Товар не найден')

    updated_review = await db.reviews.edit(
        data=data,
        id=review_id,
        exclude_unset=True,
    )

    await db.commit()

    return updated_review


@router.delete('/{review_id}')
async def delete_review(
    review_id: int,
    db: DbDep,
    current_user: CurrentUserDep,
):
    review = await _get_review_or_404(review_id, db)
    _ensure_review_owner_or_admin(review, current_user)

    deleted = await db.reviews.delete(id=review_id)

    if deleted == 0:
        raise HTTPException(status_code=404, detail='Отзыв не найден')

    await db.commit()

    return {'status': 'deleted'}