(function () {
    const api = window.RustikApi;
    const panelLinks = document.querySelectorAll('[data-panel-link]');
    const sidebarLogout = document.getElementById('logoutButton');
    let signingOut = false;

    async function logout(event) {
        event.preventDefault();
        if (signingOut) return;

        signingOut = true;
        const feedback = sidebarLogout.parentElement.querySelector('.logout-feedback');
        api.clearMessage(feedback);

        try {
            await api.request('/api/auth/logout', { method: 'POST' });
            window.location.replace('login.html');
        } catch (error) {
            api.showError(feedback, error);
        } finally {
            signingOut = false;
        }
    }

    async function loadSession() {
        try {
            await api.request('/api/users/me');
        } catch (error) {
            if (error.status === 401 && sidebarLogout) window.location.replace('login.html');
            return;
        }

        panelLinks.forEach((link) => {
            link.href = 'perfil.html';
        });
    }

    if (sidebarLogout) sidebarLogout.addEventListener('click', logout);
    loadSession();
})();
