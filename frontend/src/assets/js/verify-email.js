(function () {
  const form = document.querySelector('#verify-email-form');
  if (!form) return;
  const message = document.querySelector('#form-message');
  const emailInput = form.elements.email;
  const resend = document.querySelector('#resend-button');
  const rememberedEmail = sessionStorage.getItem('rustikcg_email');
  if (rememberedEmail) emailInput.value = rememberedEmail;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    RustikApi.clearMessage(message);
    if (!form.reportValidity()) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await RustikApi.request('/api/auth/verify-email', {
        method: 'POST',
        body: {
          email: emailInput.value.trim().toLowerCase(),
          token: form.elements.token.value.trim()
        }
      });
      RustikApi.showMessage(message, 'E-mail confirmado. Você já pode entrar.', 'success');
      form.hidden = true;
      resend.hidden = true;
      sessionStorage.removeItem('rustikcg_email');
    } catch (error) {
      RustikApi.showError(message, error);
    } finally {
      submit.disabled = false;
    }
  });

  resend.addEventListener('click', async () => {
    RustikApi.clearMessage(message);
    if (!emailInput.reportValidity()) return;
    resend.disabled = true;
    try {
      const response = await RustikApi.request('/api/auth/resend-token', {
        method: 'POST',
        body: { email: emailInput.value.trim().toLowerCase(), type: 'EMAIL_VERIFICATION' }
      });
      RustikApi.showMessage(message, response.message, 'info');
    } catch (error) {
      RustikApi.showError(message, error);
    } finally {
      window.setTimeout(() => { resend.disabled = false; }, 3000);
    }
  });
})();
