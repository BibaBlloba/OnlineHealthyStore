from src.schemas.user import UserAdd
from src.services.auth import AuthService


async def create_admin(db):
    admin = await db.users.get_one_or_none(email='admin@shop.ru')

    if admin:
        return

    await db.users.add(
        UserAdd(
            email='admin@shop.ru',
            first_name='Admin',
            last_name='Admin',
            password_hash=AuthService().hash_password('admin123'),
            role_id=1,
        )
    )

    await db.commit()
