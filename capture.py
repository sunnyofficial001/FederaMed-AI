import asyncio
from playwright.async_api import async_playwright
import os

BASE_URL = "http://localhost:5173"

# Correct routes matching src/main.tsx router configuration
ROUTES = [
    {"path": "/",            "name": "executive",      "wait_for": ".metric-card, .glassmorphism, .card"},
    {"path": "/federated",   "name": "fl_command",     "wait_for": ".page-title, .card, .recharts-wrapper"},
    {"path": "/analytics",   "name": "analytics",      "wait_for": ".recharts-wrapper, .page-title"},
    {"path": "/explain",     "name": "explainability", "wait_for": ".recharts-wrapper, .waterfall-chart, .page-title"},
    {"path": "/monitoring",  "name": "monitoring",     "wait_for": ".recharts-wrapper, .page-title"},
    {"path": "/governance",  "name": "governance",     "wait_for": ".recharts-wrapper, .page-title"},
    {"path": "/predict",     "name": "predict",        "wait_for": ".page-title, form, input[type='range']"},
    {"path": "/architecture","name": "architecture",   "wait_for": ".page-title, .card"},
]

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
        )
        page = await context.new_page()
        os.makedirs("assets/screenshots", exist_ok=True)

        for route in ROUTES:
            url = f"{BASE_URL}{route['path']}"
            name = route["name"]
            print(f"\n→ Navigating to {url} ...")

            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)

                # Wait for key content elements to appear in DOM
                try:
                    await page.wait_for_selector(route["wait_for"], timeout=12000)
                    print(f"  ✓ Content element found for {name}")
                except Exception:
                    print(f"  ⚠ Timed out waiting for selector on {name}, proceeding anyway")

                # Extra wait for animations, charts, and React Query data to fully render
                await page.wait_for_timeout(6000)

                # Scroll to top for clean screenshot
                await page.evaluate("window.scrollTo(0, 0)")
                await page.wait_for_timeout(500)

                path = f"assets/screenshots/{name}.png"
                await page.screenshot(path=path, full_page=False)
                size = os.path.getsize(path)
                print(f"  ✓ Saved {path} ({size/1024:.1f} KB)")

            except Exception as e:
                print(f"  ✗ Error on {name}: {e}")

        await browser.close()
        print("\n✅ All screenshots captured!")

if __name__ == "__main__":
    asyncio.run(capture())

