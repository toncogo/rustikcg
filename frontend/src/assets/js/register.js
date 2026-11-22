(function () {
  const form = document.querySelector('#register-form');
  if (!form) return;
  const message = document.querySelector('#form-message');
  const submit = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    RustikApi.clearMessage(message);
    if (!form.reportValidity()) return;

    submit.disabled = true;
    try {
      const values = RustikApi.formObject(form);
      await RustikApi.request('/api/auth/register', { method: 'POST', body: values });
      sessionStorage.setItem('rustikcg_email', values.email.trim().toLowerCase());
      RustikApi.showMessage(message, 'Cadastro recebido. Confira seu e-mail para confirmar a conta.', 'success');
      window.location.assign('/verify-email.html');
    } catch (error) {
      RustikApi.showError(message, error);
    } finally {
      submit.disabled = false;
    }
  });
})();
