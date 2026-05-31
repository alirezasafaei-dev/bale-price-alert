import asyncio

from novax_price_alert.workers.runner import run_worker


def main() -> None:
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
