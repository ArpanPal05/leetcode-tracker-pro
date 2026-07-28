from app.database.base import Base
from app.database.engine import engine

# Import models so SQLAlchemy knows about them
from app.models.user import User


def create_tables():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()
    print("Tables created successfully.")