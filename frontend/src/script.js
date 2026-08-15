function toggleMenu() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) mobileNav.classList.toggle('active');
}

// =========================================================
// CALENDÁRIO DA HOMEPAGE
// =========================================================
const grid = document.getElementById('calendarGrid');
const monthTxt = document.getElementById('monthDisplay');
let current = new Date(2026, 2, 1);

// Adicione aqui os feriados nacionais (Formato: 'MÊS-DIA')
const feriadosNacionais = ['0-1', '3-21', '4-1', '8-7', '9-12', '10-2', '10-15', '11-25'];

function build() {
    if (!grid || !monthTxt) return;

    grid.innerHTML = '';
    const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

    monthTxt.innerHTML = `${months[current.getMonth()]} <span>${current.getFullYear()}</span>`;

    ['D','S','T','Q','Q','S','S'].forEach(label => {
        const el = document.createElement('div');
        el.className = 'day-label';
        el.innerText = label;
        grid.appendChild(el);
    });

    const firstDayIndex = new Date(current.getFullYear(), current.getMonth(), 1).getDay();
    const lastDayDate = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= lastDayDate; d++) {
        const cell = document.createElement('div');
        const dateObj = new Date(current.getFullYear(), current.getMonth(), d);
        const dayOfWeek = dateObj.getDay();
        const dateKey = `${current.getMonth()}-${d}`;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = feriadosNacionais.includes(dateKey);

        cell.className = `day-cell ${isWeekend || isHoliday ? 'available' : 'occupied'}`;
        cell.innerText = d;
        grid.appendChild(cell);
    }
}

function changeMonth(step) {
    current.setMonth(current.getMonth() + step);
    build();
}

build();

// =========================================================
// LOGIN — protótipo front-end
// =========================================================
const loginForm = document.getElementById('loginForm');
const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.getElementById('password');
const loginFeedback = document.getElementById('loginFeedback');

if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
        const showPassword = passwordInput.type === 'password';
        passwordInput.type = showPassword ? 'text' : 'password';
        passwordToggle.textContent = showPassword ? 'OCULTAR' : 'MOSTRAR';
        passwordToggle.setAttribute('aria-label', showPassword ? 'Ocultar senha' : 'Mostrar senha');
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        if (loginFeedback) loginFeedback.textContent = 'ACESSO AUTORIZADO — REDIRECIONANDO...';
        localStorage.setItem('rustikcgLoggedIn', 'true');
        window.location.href = 'perfil.html';
    });
}

// =========================================================
// PAINEL DO CLIENTE
// =========================================================
const sidebarButtons = document.querySelectorAll('[data-panel]');
const dashboardPanels = document.querySelectorAll('.dashboard-panel');

sidebarButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.dataset.panel;

        sidebarButtons.forEach(item => item.classList.remove('active'));
        dashboardPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
    });
});

const profileForm = document.getElementById('profileForm');
const editProfileButton = document.getElementById('editProfileButton');
const cancelEditButton = document.getElementById('cancelEditButton');
let profileSnapshot = [];

function setProfileEditing(isEditing) {
    if (!profileForm) return;

    const fields = Array.from(profileForm.querySelectorAll('input'));
    fields.forEach(input => {
        input.disabled = !isEditing;
    });
    profileForm.classList.toggle('editing', isEditing);

    if (editProfileButton) {
        editProfileButton.style.display = isEditing ? 'none' : '';
    }
}

if (editProfileButton && profileForm) {
    editProfileButton.addEventListener('click', () => {
        profileSnapshot = Array.from(profileForm.querySelectorAll('input')).map(input => input.value);
        setProfileEditing(true);
        const firstField = profileForm.querySelector('input');
        if (firstField) firstField.focus();
    });
}

if (cancelEditButton && profileForm) {
    cancelEditButton.addEventListener('click', () => {
        Array.from(profileForm.querySelectorAll('input')).forEach((input, index) => {
            if (profileSnapshot[index] !== undefined) input.value = profileSnapshot[index];
        });
        setProfileEditing(false);
    });
}

if (profileForm) {
    profileForm.addEventListener('submit', event => {
        event.preventDefault();
        setProfileEditing(false);
    });
}

const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('rustikcgLoggedIn');
    });
}
