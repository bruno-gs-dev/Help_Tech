from playwright.sync_api import sync_playwright, expect
import time
import os
import json

def verify_profile_loading():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        cwd = os.getcwd()
        # We need to serve the file properly or handle the relative paths.
        # file:// might be tricky with fetch() requests to /api/ if they are not absolute URLs.
        # The code in meu_perfil.html sets API_BASE_URL based on hostname.
        # If file://, hostname is empty.

        file_path = f"file://{cwd}/dashboard_logged/meu_perfil/meu_perfil.html"

        # Mock User Data
        # Simulating a user logged in via Supabase
        user_data = {
            "user": {
                "id": "c569ee08-3b90-4ce4-a3ae-3b4a0c06a8e7", # Example UUID
                "aud": "authenticated",
                "role": "authenticated",
                "email": "testuser@example.com",
                "phone": "",
                "app_metadata": {
                    "provider": "email",
                    "providers": ["email"]
                },
                "user_metadata": {},
                "identities": [],
                "created_at": "2023-10-27T10:00:00.000000Z",
                "updated_at": "2023-10-27T10:00:00.000000Z"
            },
            "profile": {
                # Sometimes profile is null initially or populated differently
                # Let's simulate a case where profile might be missing or minimal
                "id": "c569ee08-3b90-4ce4-a3ae-3b4a0c06a8e7",
                "username": "testuser",
                "full_name": "Test User",
                "metadata": {
                    "email": "testuser@example.com"
                }
            },
            "session": {
                "access_token": "mock_token",
                "refresh_token": "mock_refresh"
            }
        }

        # Inject localStorage
        page.add_init_script(f"""
            window.localStorage.setItem('user', JSON.stringify({json.dumps(user_data)}));

            // Mock Fetch because we can't hit real /api endpoints from file://
            const originalFetch = window.fetch;
            window.fetch = async (url, options) => {{
                console.log('Fetch intercepted:', url);

                if (url.includes('/api/capturar_informacoes')) {{
                     // Simulate Server Error or Not Found to match user report
                     // "Aparece que não encontrou o usuário"

                     // If we want to reproduce the FAILURE, let's assume the API returns 404
                     // or the frontend sends the wrong ID.

                     // Let's first see what the frontend sends.
                     if (options && options.body) {{
                         console.log('Request body:', options.body);
                     }}

                     return {{
                         ok: true,
                         json: async () => ({{
                             success: false,
                             message: "Usuário não encontrado."
                         }})
                     }};
                }}
                return originalFetch(url, options);
            }};
        """)

        page.goto(file_path)

        # Wait for potential notifications
        time.sleep(2)

        # Check for error notification
        # The user said "Aparece que não encontrou o usuário"
        notification = page.locator(".notification.bg-gradient-to-r.from-red-500")

        if notification.count() > 0:
            print("Error notification found:", notification.first.inner_text())
        else:
            print("No error notification found.")

        # Check if fields are empty
        name_field = page.locator("#display-name")
        print("Display Name:", name_field.inner_text())

        page.screenshot(path="/home/jules/verification/profile_loading_repro.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_profile_loading()
