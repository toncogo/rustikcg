(function () {
    const api = window.RustikApi;
    const loginForm = document.getElementById('loginForm');
    const codeForm = document.getElementById('loginCodeForm');
    const feedback = document.getElementById('loginFeedback');
    let email;

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
        codeForm.elements.token.focus();
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
