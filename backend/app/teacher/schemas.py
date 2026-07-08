from pydantic import BaseModel, ConfigDict, EmailStr


class TeacherRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class TeacherLogin(BaseModel):
    email: EmailStr
    password: str


class TeacherRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
