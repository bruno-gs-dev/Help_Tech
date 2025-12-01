function toggleFilters() {
    const sidebar = document.getElementById('filterSidebar');
    sidebar.classList.toggle('hidden');
    sidebar.classList.toggle('block');

    // Smooth scroll to filters if opening
    if (!sidebar.classList.contains('hidden')) {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update mobile cart count when main cart count updates
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === "characterData" || mutation.type === "childList") {
            const count = document.getElementById('cartCount').innerText;
            const mobileCount = document.getElementById('cartCountMobile');
            if(mobileCount) mobileCount.innerText = count;
        }
    });
});

const cartCountElement = document.getElementById('cartCount');
if (cartCountElement) {
    observer.observe(cartCountElement, {
        characterData: true,
        childList: true,
        subtree: true
    });
}
