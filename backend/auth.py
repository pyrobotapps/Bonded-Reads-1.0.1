import hashlib
import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
import os

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password Hashing
def hash_password(password: str) -> str:
    password = hashlib.sha256(password.encode()).hexdigest()
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    return hashed.decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = hashlib.sha256(plain_password.encode()).hexdigest()
    return bcrypt.checkpw(
        plain_password.encode(),
        hashed_password.encode()
    )

# JWT CREATION
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# JWT VERIFICATION

def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
        
        return payload
    
    except JWTError:
        return None