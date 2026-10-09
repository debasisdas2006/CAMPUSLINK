from sqlalchemy import create_engine, text
from passlib.context import CryptContext

DATABASE_URL = "mssql+pyodbc://@127.0.0.1:58550/campuslink?driver=ODBC+Driver+18+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

new_hash = pwd_context.hash("student123")

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    result = conn.execute(
        text("""
            UPDATE dbo.users
            SET password_hash = :password_hash,
                updated_at = SYSDATETIME()
            WHERE email = :email
        """),
        {
            "password_hash": new_hash,
            "email": "student@campuslink.com"
        }
    )

print("ROWS UPDATED:", result.rowcount)
print("PASSWORD HASH UPDATED")
print("HASH LENGTH:", len(new_hash))
