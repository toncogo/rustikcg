(function () {
    const api = window.RustikApi;
    const loginForm = document.getElementById('loginForm');
    const codeForm = document.getElementById('loginCodeForm');
    const feedback = document.getElementById('loginFeedback');
    const tabs = Array.from(document.querySelectorAll('.login-tab'));
    let email;

    function selectTab(selected) {
        for (const tab of tabs) {
            const active = tab === selected;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', (event) => {
            const destinations = {
                ArrowLeft: (index + tabs.length - 1) % tabs.length,
                ArrowRight: (index + 1) % tabs.length,
                Home: 0,
                End: tabs.length - 1
            };
            if (!Object.hasOwn(destinations, event.key)) return;
            event.preventDefault();
            const nextTab = tabs[destinations[event.key]];
            selectTab(nextTab);
            nextTab.focus();
        });
    });

    window.addEventListener('pageshow', async () => {
        try {
            await api.request('/api/users/me');
        } catch {
            return;
        }
        window.location.replace('perfil.html');
    });

    function handleSubmit(form, submit) {
        const button = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (button.disabled) return;

            button.disabled = true;
            api.clearMessage(feedback);
            try {
                await submit(api.formObject(form));
            } catch (error) {
                api.showError(feedback, error);
            } finally {
                button.disabled = false;
            }
        });
    }

    handleSubmit(loginForm, async (credentials) => {
        const response = await api.request('/api/auth/login', {
            method: 'POST',
            body: { email: credentials.email, password: credentials.password }
        });
        email = credentials.email;
        loginForm.reset();
        loginForm.hidden = true;
        codeForm.hidden = false;
        if (!codeForm.closest('[hidden]')) codeForm.elements.token.focus();
        api.showMessage(feedback, response.message);
    });

    handleSubmit(codeForm, async ({ token }) => {
        await api.request('/api/auth/verify-login', {
            method: 'POST',
            body: { email, token }
        });
        window.location.replace('perfil.html');
    });
})();
