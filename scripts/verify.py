import subprocess
import time
import sys
from playwright.sync_api import sync_playwright

PORT = 8123
BASE = f"http://localhost:{PORT}"

proc = subprocess.Popen(
    ["python3", "-m", "http.server", str(PORT)],
    cwd="/root/launch-aesthetics",
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)
time.sleep(1)

errors = []
console_errors = []

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        page = browser.new_page(viewport={"width": 1400, "height": 1000})
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        page.goto(BASE, wait_until="networkidle")
        page.screenshot(path="/root/launch-aesthetics/scripts/desktop_full.png", full_page=True)

        # Nav smooth scroll
        page.click("text=Devices")
        page.wait_for_timeout(600)
        devices_visible = page.is_visible("#devices")
        if not devices_visible:
            errors.append("Devices section not visible after nav click")

        # Browse devices button from hero
        page.goto(BASE, wait_until="networkidle")
        page.click("text=Browse devices")
        page.wait_for_timeout(600)

        # Category card modal
        page.click(".device-card >> nth=0")
        page.wait_for_timeout(300)
        modal_visible = page.is_visible("#category-modal:not([hidden])")
        if not modal_visible:
            errors.append("Category modal did not open on card click")
        modal_title = page.text_content("#modal-title")
        if "Skin Tightening" not in (modal_title or ""):
            errors.append(f"Modal title mismatch: {modal_title}")
        page.screenshot(path="/root/launch-aesthetics/scripts/modal_open.png")
        page.click("#modal-close")
        page.wait_for_timeout(300)
        if page.is_visible("#category-modal:not([hidden])"):
            errors.append("Modal did not close")

        # Form validation - empty submit
        page.click("text=Send inquiry")
        page.wait_for_timeout(300)
        status_text = page.text_content("#form-status")
        if "fix the highlighted" not in (status_text or ""):
            errors.append(f"Empty form did not show validation error: {status_text}")

        # Fill form correctly and submit (demo mode, no real formspree id)
        page.fill("#name", "Test User")
        page.fill("#email", "test@example.com")
        page.fill("#message", "Interested in the HALO and BBL.")
        page.click("text=Send inquiry")
        page.wait_for_timeout(900)
        status_text2 = page.text_content("#form-status")
        if "Thanks" not in (status_text2 or ""):
            errors.append(f"Valid form submit did not show success message: {status_text2}")

        # Mobile viewport + hamburger menu
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(BASE, wait_until="networkidle")
        page.screenshot(path="/root/launch-aesthetics/scripts/mobile_full.png", full_page=True)
        page.click("#nav-toggle")
        page.wait_for_timeout(300)
        nav_open = page.eval_on_selector("#main-nav", "el => el.classList.contains('open')")
        if not nav_open:
            errors.append("Mobile nav did not open on hamburger click")
        page.screenshot(path="/root/launch-aesthetics/scripts/mobile_nav_open.png")

        browser.close()
finally:
    proc.terminate()

if console_errors:
    print("CONSOLE ERRORS:")
    for c in console_errors:
        print(" -", c)

if errors:
    print("FAILURES:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
else:
    print("ALL CHECKS PASSED")
