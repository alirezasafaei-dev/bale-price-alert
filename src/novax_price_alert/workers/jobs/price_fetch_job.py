import logging

from novax_price_alert.db.session import AsyncSessionLocal
from novax_price_alert.services.price_ingestion import PriceIngestionService

logger = logging.getLogger(__name__)


async def run_price_fetch_job() -> None:
    async with AsyncSessionLocal() as session:
        service = PriceIngestionService(session=session)
        ingested_count = await service.ingest_all_assets()

    logger.info(
        "price fetch job completed",
        extra={"ingested_count": ingested_count},
    )
