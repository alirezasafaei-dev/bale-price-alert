import asyncio

from novax_price_alert.db.session import AsyncSessionLocal
from novax_price_alert.services.seed_data import seed_mvp_data


async def main() -> None:
    async with AsyncSessionLocal() as session:
        await seed_mvp_data(session)


if __name__ == "__main__":
    asyncio.run(main())
