from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def test_connection():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not set.")
        return

    print("Attempting to connect to the database...")

    engine = create_engine(
        DATABASE_URL,
        echo=True,
        future=True,
    )

    try:
        with engine.connect() as connection:
            version = connection.execute(text("SELECT version();")).scalar()
            print("Connection successful! Database version:")
            print(f"  {version}")
            print("\nReady to create ORM models.")
    except Exception as e:
        print("Connection failed!")
        print(f"Error: {e}")
    finally:
        engine.dispose()


if __name__ == "__main__":
    test_connection()
