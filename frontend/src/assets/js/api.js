(function () {
  async function request(path, options) {
    const settings = options || {};
    const headers = new Headers(settings.headers || {});
    headers.set('Accept', 'application/json');
    let body = settings.body;
    if (body !== undefined && body !== null && typeof body !== 'string') {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(body);
    }

    const response = await fetch(path, {
      method: settings.method || 'GET',
      headers,
      body,
      credentials: 'same-origin'
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok) {
      const error = new Error(data.message || 'Não foi possível concluir a solicitação.');
      error.status = response.status;
      error.code = data.error;
      error.details = data.details;
      throw error;
    }
    return data;
  }

  function showMessage(element, message, kind) {
    if (!element) return;
    element.replaceChildren();
    element.dataset.kind = kind || 'info';
    element.hidden = false;

    if (message && typeof message === 'object' && message.fields) {
      const intro = document.createElement('p');
      intro.textContent = 'Revise estes campos:';
      const list = document.createElement('ul');
      Object.entries(message.fields).forEach(([field, description]) => {
        const item = document.createElement('li');
        item.textContent = field + ': ' + description;
        list.append(item);
      });
      element.append(intro, list);
      return;
    }
    element.textContent = String(message || '');
  }

  function showError(element, error) {
    const details = error && error.details && error.details.fields ? error.details : error.message;
    showMessage(element, details, 'error');
  }

  function clearMessage(element) {
    if (!element) return;
    element.replaceChildren();
    element.hidden = true;
    delete element.dataset.kind;
  }

  function formObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  window.RustikApi = { request, showMessage, showError, clearMessage, formObject };
})();
