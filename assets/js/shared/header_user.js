// Header User Profile Manager
// Handles displaying either the user's profile image or an initial in the header

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderProfile();

    // Listen for storage changes (in case profile is updated in another tab or page)
    window.addEventListener('storage', (e) => {
        if (e.key === 'user') {
            updateHeaderProfile();
        }
    });

    // Custom event for same-page updates
    window.addEventListener('profile-updated', () => {
        updateHeaderProfile();
    });
});

function updateHeaderProfile() {
    try {
        const store = JSON.parse(localStorage.getItem('user')) || null;
        if (!store) return;

        const profile = store.profile || {};
        const user = store.user || {};
        const metadata = profile.metadata || (user.user_metadata || {});

        // Determine Image URL
        // Prioritize profile.image, then metadata keys
        const imageUrl = profile.image ||
                         metadata.profile_pic ||
                         metadata.image ||
                         metadata.avatar ||
                         metadata.picture ||
                         null;

        // Determine Initial
        // Use full_name, username, or email
        const nameSource = profile.full_name || profile.username || metadata.name || user.email || '?';
        const initial = nameSource.charAt(0).toUpperCase();

        // Get DOM Elements
        const imgEl = document.getElementById('header-profile-img');
        const initialEl = document.getElementById('header-profile-initial');

        if (!imgEl) return; // Header not found

        if (imageUrl) {
            // Show Image, Hide Initial
            imgEl.src = imageUrl;
            imgEl.classList.remove('hidden');
            if (initialEl) initialEl.classList.add('hidden');
        } else {
            // Hide Image, Show Initial
            imgEl.classList.add('hidden');

            if (initialEl) {
                initialEl.classList.remove('hidden');
                // Find the span inside or set text directly
                const span = initialEl.querySelector('span');
                if (span) span.textContent = initial;
                else initialEl.textContent = initial;
            } else {
                // If initial element doesn't exist yet, we might need to create it?
                // Ideally it should be in the HTML.
                // But if the HTML only has the img, we can try to insert it.
                // For now, we assume the HTML will be updated to include #header-profile-initial
                console.warn('Header profile initial element #header-profile-initial not found.');
            }
        }

    } catch (e) {
        console.warn('Error updating header profile:', e);
    }
}
