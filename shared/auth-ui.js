// Shared Auth UI helper
// Exposes `AUTH_UI` global with methods: init(), getCurrentUser(), signOut(), syncProfile(profile)
(function () {
  const AUTH_UI = {
    init() {
      this.applyFromStore();
      window.addEventListener('storage', (e) => {
        // when localStorage changes in other tabs
        if (e.key === 'user' || e.key === 'supabase.session') this.applyFromStore();
      });
    },

    applyFromStore() {
      try {
        const s = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('supabase.session')) || null;
        const profile = s && (s.profile || (s.user ? { id: s.user.id, metadata: { email: s.user.email } } : null));
        if (!profile) return;

        const imgUrl = profile.image || (profile.metadata && (profile.metadata.profile_pic || profile.metadata.image || profile.metadata.avatar)) || null;
        const displayName = profile.full_name || profile.username || (s && s.user && s.user.email) || '';
        const displayEmail = (profile.metadata && profile.metadata.email) || (s && s.user && s.user.email) || '';

        // Header profile image on main site
        const headerImg = document.getElementById('header-profile-img');
        if (headerImg && imgUrl) headerImg.src = imgUrl;

        // Admin area header
        const adminImg = document.getElementById('admin-profile-img');
        const adminName = document.getElementById('admin-name');
        const adminEmail = document.getElementById('admin-email');
        if (adminImg && imgUrl) adminImg.src = imgUrl;
        if (adminName && displayName) adminName.textContent = displayName;
        if (adminEmail && displayEmail) adminEmail.textContent = displayEmail;

        // Any other elements that follow the same id conventions will be updated
      } catch (err) {
        // ignore errors silently
        console.warn('AUTH_UI applyFromStore error', err);
      }
    },

    getCurrentUser() {
      try {
        return JSON.parse(localStorage.getItem('user')) || null;
      } catch (e) { return null; }
    },

    signOut() {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('supabase.session');
      } catch (e) { }
      window.location.href = '/login/index.html';
    },

    syncProfile(profile) {
      try {
        const store = JSON.parse(localStorage.getItem('user')) || {};
        store.profile = Object.assign(store.profile || {}, profile || {});
        localStorage.setItem('user', JSON.stringify(store));
        this.applyFromStore();
      } catch (e) {
        console.warn('AUTH_UI syncProfile error', e);
      }
    }
  };

  window.AUTH_UI = AUTH_UI;
  window.initAuthUI = function () { AUTH_UI.init(); };
})();
