from sqlalchemy.exc import DBAPIError, IntegrityError
import re
import logging

logger = logging.getLogger(__name__)

def _get_sqlstate(exception: Exception) -> str | None:
    orig = getattr(exception, 'orig', None)

    if orig is None:
        return None

    return getattr(orig, 'sqlstate', None) or getattr(orig, 'pgcode', None)


def _get_constraint_name(exception: Exception) -> str | None:
    orig = getattr(exception, 'orig', None)

    if orig is None:
        return None

    diag = getattr(orig, 'diag', None)

    if diag is not None:
        constraint_name = getattr(diag, 'constraint_name', None)
        if constraint_name:
            return constraint_name

    constraint_name = getattr(orig, 'constraint_name', None)
    if constraint_name:
        return constraint_name

    for attribute_name in ('detail', 'message', 'msg'):
        attribute_value = getattr(orig, attribute_name, None)
        if not attribute_value:
            continue

        match = re.search(r'constraint "([^"]+)"', str(attribute_value))
        if match:
            return match.group(1)

    match = re.search(r'constraint "([^"]+)"', str(orig))
    if match:
        return match.group(1)

    return None


def get_db_error_details(exception: Exception) -> tuple[int, str]:
    sqlstate = _get_sqlstate(exception)
    constraint_name = _get_constraint_name(exception)
    message = str(getattr(exception, 'orig', exception))

    if sqlstate == '23505':
        return 409, 'Запись уже существует'

    if sqlstate == '23503':
        return 409, 'Связанная запись не найдена'

    if sqlstate == '23502':
        return 400, 'Не заполнено обязательное поле'

    if sqlstate == '23514':
        if constraint_name == 'chk_product_price':
            return 400, 'Цена товара должна быть больше 0'

        if constraint_name == 'chk_review_rating':
            return 400, 'Оценка отзыва должна быть от 1 до 5'

        return 400, 'Нарушено ограничение целостности'

    if sqlstate == '23P01':
        return 409, 'Нарушено ограничение пересечения'

    if sqlstate == 'P0001':
        return 400, message

    if isinstance(exception, (IntegrityError, DBAPIError)):
        logger.exception("IntegrityError")
        return 500, 'Ошибка работы с базой данных'

    return 500, 'Неожиданная ошибка базы данных'