from playwright.sync_api import sync_playwright, expect
import time
import os
import json

def verify_profile_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        cwd = os.getcwd()
        file_path = f"file://{cwd}/dashboard_logged/meu_perfil/meu_perfil.html"

        # Test Case: User ID nested in session.user.id
        # This simulates the structure that likely caused the failure
        nested_user_data = {
            "session": {
                "user": {
                    "id": "nested-user-123",
                    "email": "nested@example.com"
                }
            },
            # No root 'user' object with ID, forcing reliance on candidates logic
            "user": {}
        }

        page.add_init_script(f"""
            window.localStorage.setItem('user', JSON.stringify({json.dumps(nested_user_data)}));

            // Mock Fetch to verify we receive the correct ID
            const originalFetch = window.fetch;
            window.fetch = async (url, options) => {{
                if (url.includes('/api/capturar_informacoes')) {{
                     const body = JSON.parse(options.body);
                     console.log('API Request ID:', body.userId);

                     if (body.userId === 'nested-user-123') {{
                         return {{
                             ok: true,
                             json: async () => ({{
                                 success: true,
                                 data: {{
                                     id: 'nested-user-123',
                                     name: 'Nested User Success',
                                     email: 'nested@example.com'
                                 }}
                             }})
                         }};
                     }} else {{
                         return {{
                             ok: true,
                             json: async () => ({{
                                 success: false,
                                 message: 'User not found'
                             }})
                         }};
                     }}
                }}
                return originalFetch(url, options);
            }};
        """)

        # Capture console logs to verify ID
        page.on("console", lambda msg: print(f"Console: {msg.text}") if "API Request ID" in msg.text else None)

        page.goto(file_path)
        time.sleep(1)

        # Verify Name Field
        name_field = page.locator("#display-name")
        expect(name_field).to_have_text("Nested User Success")

        # Verify No Error Notification
        error_notif = page.locator(".notification.bg-gradient-to-r.from-red-500")
        expect(error_notif).to_have_count(0)

        page.screenshot(path="/home/jules/verification/profile_fix_verified.png")
        print("Screenshot saved: profile_fix_verified.png")

        browser.close()

if __name__ == "__main__":
    verify_profile_fix()
