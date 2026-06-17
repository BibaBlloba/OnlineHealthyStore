from src.schemas.role import RoleCreate
from src.schemas.user import UserAdd
from src.services.auth import AuthService


async def seed_roles(db):
    for role_name in ('admin', 'customer'):
        role = await db.roles.get_one_or_none(name=role_name)

        if role:
            continue

        await db.roles.add(RoleCreate(name=role_name))

    await db.commit()


async def create_admin(db):
    admin = await db.users.get_one_or_none(email='admin@shop.ru')

    if admin:
        return

    role = await db.roles.get_one_or_none(name='admin')

    if not role:
        await seed_roles(db)
        role = await db.roles.get_one_or_none(name='admin')

    await db.users.add(
        UserAdd(
            email='admin@shop.ru',
            first_name='Admin',
            last_name='Admin',
            password_hash=AuthService().hash_password('admin123'),
            role_id=role.id,
        )
    )

    await db.commit()
