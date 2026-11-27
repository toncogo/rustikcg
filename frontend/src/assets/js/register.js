(function () {
  const form = document.querySelector('#register-form');
  if (!form) return;
  const message = document.querySelector('#form-message');
  const submit = form.querySelector('button[type="submit"]');
  const password = form.elements.password;
  const confirmation = document.querySelector('#register-password-confirmation');
  const strengthBar = document.querySelector('#register-strength-bar');
  const strengthLabel = document.querySelector('#register-password-strength');
  const birthDate = form.elements.birth_date;

  function updateConfirmation() {
    const mismatch = confirmation.value !== '' && confirmation.value !== password.value;
    confirmation.setCustomValidity(mismatch ? 'As senhas precisam ser iguais.' : '');
  }

  function updateStrength() {
    const value = password.value;
    const characterTypes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const typesUsed = characterTypes.filter((pattern) => pattern.test(value)).length;
    let level = '';
    let label = 'Força da senha';
    if (value.length >= 12 && typesUsed === 4) {
      level = 'strong';
      label = 'Senha forte';
    } else if (value.length >= 8 && typesUsed >= 2) {
      level = 'medium';
      label = 'Senha média';
    } else if (value) {
      level = 'weak';
      label = 'Senha fraca';
    }
    strengthBar.dataset.level = level;
    if (strengthLabel.textContent !== label) strengthLabel.textContent = label;
  }

  for (const toggle of form.querySelectorAll('.register-password-toggle')) {
    const input = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(show));
    });
  }

  birthDate.max = new Date().toISOString().slice(0, 10);
  password.addEventListener('input', () => {
    updateStrength();
    updateConfirmation();
  });
  password.addEventListener('change', updateStrength);
  confirmation.addEventListener('input', updateConfirmation);
  window.addEventListener('pageshow', updateStrength);
  updateStrength();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    RustikApi.clearMessage(message);
    updateConfirmation();
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
