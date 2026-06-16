from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role_id: int


class UserAdd(UserBase):
    password_hash: str


class UserRequestAdd(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None


class UserRead(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
