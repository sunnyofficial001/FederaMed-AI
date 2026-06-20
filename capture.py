import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 1920x1080 full HD enterprise dashboard
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        # Ensure directory exists
        os.makedirs("assets/screenshots", exist_ok=True)

        routes = [
            {"path": "/",              "name": "executive"},
            {"path": "/fl-command",    "name": "fl_command"},
            {"path": "/analytics",     "name": "analytics"},
            {"path": "/explainability","name": "explainability"},
            {"path": "/monitoring",    "name": "monitoring"},
            {"path": "/governance",    "name": "governance"},
            {"path": "/predict",       "name": "predict"},
            {"path": "/architecture",  "name": "architecture"},
        ]

        for route in routes:
            url = f"http://localhost:5173{route['path']}"
            print(f"Navigating to {url}")
            await page.goto(url, wait_until="networkidle")
            # Wait for Framer Motion animations, Recharts renders, and React Query fetches
            await page.wait_for_timeout(4000)

            filepath = f"assets/screenshots/{route['name']}.png"
            await page.screenshot(path=filepath, full_page=False)
            print(f"Saved {filepath}")

        await browser.close()
        print("\nAll screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(main())
