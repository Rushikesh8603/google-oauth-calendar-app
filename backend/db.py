import psycopg2

# Replace with your actual password
DATABASE_URL = "postgresql://postgres:8603@Rushi@localhost:5432/rushi"

def get_connection():
    return psycopg2.connect(DATABASE_URL)


