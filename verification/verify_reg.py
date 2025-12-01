
from playwright.sync_api import sync_playwright
import os

def verify_registration_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get absolute path
        cwd = os.getcwd()
        file_path = f'file://{cwd}/register/index.html'

        # Navigate to registration page
        page.goto(file_path)

        # Fill in the form
        page.fill('#first_name', 'Test')
        page.fill('#last_name', 'User')

        # We need to wait for datepicker or just set value
        page.evaluate("document.getElementById('birthday').value = '01/01/2000'")

        page.fill('#email', 'testuser@example.com')
        page.fill('#phone', '(11) 99999-9999')
        page.fill('#password', 'password123')

        # Take screenshot of the filled form
        page.screenshot(path='verification/registration_filled.png')

        browser.close()

if __name__ == '__main__':
    verify_registration_page()
