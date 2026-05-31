from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from novax_price_alert.core.settings import settings
from novax_price_alert.db import models  # noqa: F401

# Use the database_url directly from settings, which already includes sqlite+aiosqlite
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
)

# Create a configured "SessionLocal" factory.
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep objects from being expired after commit
)


# Dependency to get a database session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Provides a database session to the API endpoints.
    Ensures the session is closed after use.
    """
    async with AsyncSessionLocal() as session:
        yield session
