import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER", "localhost\\SQLEXPRESS")
DB_NAME = os.getenv("DB_NAME", "CAMPUSLINK")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

connection_string = (
    f"mssql+pyodbc://@{DB_SERVER}/{DB_NAME}"
    f"?driver={DB_DRIVER.replace(' ', '+')}"
    "&trusted_connection=yes"
)

engine = create_engine(connection_string)


def get_engine():
    return engine