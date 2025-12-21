import os
from dotenv import load_dotenv

load_dotenv()  

BD_CONEXION = os.getenv(
    "BD_CONEXION",
    "Driver={ODBC Driver 17 for SQL Server};Server=NICKNET2024\\SQLEXPRESS;DATABASE=RENTA_DE_VEHICULOS;Trusted_Connection=yes;"
)