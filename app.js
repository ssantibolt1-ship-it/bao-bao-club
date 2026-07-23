// ── Supabase config ──────────────────────────────────────────────
const SUPABASE_URL = 'https://tjzjwyldkfcoqnrvzenu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqemp3eWxka2Zjb3FucnZ6ZW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTQ5MjMsImV4cCI6MjA5OTk3MDkyM30.2e31t2CYfVOWTe_NxWdz0Jw_3gCNBX-gyb-j2NB0pM4';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Elementos ────────────────────────────────────────────────────
const toastStack      = document.getElementById('toast-stack');
const authBtn         = document.getElementById('auth-btn');
const logoutBtn       = document.getElementById('logout-btn');
const authModal       = document.getElementById('auth-modal');
const authModalClose  = document.getElementById('auth-modal-close');
const requestsList    = document.getElementById('requests-list');
const requestForm     = document.getElementById('request-form');
const submitBtn       = document.getElementById('submit-btn');
const formStatus      = document.getElementById('form-status');
const themeToggle     = document.getElementById('theme-toggle');
const adminPanel      = document.getElementById('admin-panel');
const adminList       = document.getElementById('admin-requests-list');
const adminStatusEl   = document.getElementById('admin-status');
const adminRefreshBtn = document.getElementById('admin-refresh');
const descricaoEl     = document.getElementById('descricao');
const descricaoCount  = document.getElementById('descricao-count');

// Dropdown e User Header
const userMenuWrapper   = document.getElementById('user-menu-wrapper');
const userMenuBtn       = document.getElementById('user-menu-btn');
const userMenuEmail     = document.getElementById('user-menu-email');
const userDropdown      = document.getElementById('user-dropdown');
const dropdownUserEmail = document.getElementById('dropdown-user-email');
const dropdownMyOrders  = document.getElementById('dropdown-my-orders');
const dropdownNewRequest= document.getElementById('dropdown-new-request');
const dropdownAccountSettings = document.getElementById('dropdown-account-settings');
const heroCopy          = document.getElementById('hero-copy');

// Banner & Modals
const welcomeBadge      = document.getElementById('welcome-badge');
const welcomeTitle      = document.getElementById('welcome-title');
const welcomeSubtitle   = document.getElementById('welcome-subtitle');
const openRequestModalBtn = document.getElementById('open-request-modal-btn');
const pedidosHeaderNewBtn = document.getElementById('pedidos-header-new-btn');
const requestModal      = document.getElementById('request-modal');
const requestModalClose = document.getElementById('request-modal-close');
const termsModal        = document.getElementById('terms-modal');
const termsModalClose   = document.getElementById('terms-modal-close');
const footerTerms       = document.getElementById('footer-terms');

// Auth forms / elements
const loginForm      = document.getElementById('login-form');
const registerForm   = document.getElementById('register-form');
const forgotForm     = document.getElementById('forgot-form');
const loginBtn       = document.getElementById('login-btn');
const registerBtn    = document.getElementById('register-btn');
const forgotBtn      = document.getElementById('forgot-btn');
const forgotLink     = document.getElementById('forgot-link');
const backToLogin    = document.getElementById('back-to-login');
const loginNote      = document.getElementById('login-note');
const registerNote   = document.getElementById('register-note');
const forgotNote     = document.getElementById('forgot-note');
const authModalTitle = document.getElementById('auth-modal-title');

// ── Toasts ───────────────────────────────────────────────────────
function toast(message, type = 'default') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  toastStack.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ── Tema ─────────────────────────────────────────────────────────
const root = document.documentElement;
let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
function applyTheme(t) {
  theme = t;
  root.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? 'Claro' : 'Escuro';
}
applyTheme(theme);
themeToggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));

// ── Cache de Sessão Síncrono ───────────────────────────────────────
let cachedSession = null;

async function getSession() {
  if (cachedSession) return cachedSession;
  try {
    const { data } = await sb.auth.getSession();
    cachedSession = data.session || null;
  } catch (e) {
    cachedSession = null;
  }
  return cachedSession;
}

// ── Gestão de Vistas de Página (Encomendas vs A Minha Conta) ──────────
function showView(viewName) {
  const isOrders = viewName === 'orders';
  const pageOrders = document.getElementById('page-orders');
  const pageAccount = document.getElementById('page-account');
  const navBtnOrders = document.getElementById('nav-btn-orders');
  const navBtnAccount = document.getElementById('nav-btn-account');

  if (pageOrders)  pageOrders.classList.toggle('hidden', !isOrders);
  if (pageAccount) pageAccount.classList.toggle('hidden', isOrders);

  if (navBtnOrders) {
    navBtnOrders.classList.toggle('active', isOrders);
    navBtnOrders.setAttribute('aria-selected', isOrders ? 'true' : 'false');
  }
  if (navBtnAccount) {
    navBtnAccount.classList.toggle('active', !isOrders);
    navBtnAccount.setAttribute('aria-selected', !isOrders ? 'true' : 'false');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('nav-btn-orders')?.addEventListener('click', () => showView('orders'));
document.getElementById('nav-btn-account')?.addEventListener('click', () => showView('account'));
document.getElementById('account-back-btn')?.addEventListener('click', () => showView('orders'));

// ── Atalhos de navegação e Dropdown do Header ───────────────────────
document.getElementById('cta-request')?.addEventListener('click', (e) => {
  e.preventDefault();
  openRequestModal();
});
document.getElementById('footer-request-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  openRequestModal();
});
document.getElementById('footer-my-orders')?.addEventListener('click', (e) => {
  e.preventDefault();
  showView('orders');
});

document.getElementById('cta-account')?.addEventListener('click', () => {
  if (cachedSession) {
    showView('account');
  } else {
    openAuthModal('login');
  }
});

// Toggle do Dropdown do Utilizador
if (userMenuBtn) {
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = userDropdown.classList.contains('hidden');
    userDropdown.classList.toggle('hidden', !isHidden);
    userMenuWrapper.classList.toggle('open', isHidden);
    userMenuBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  });
}

if (dropdownMyOrders) {
  dropdownMyOrders.addEventListener('click', () => {
    userDropdown.classList.add('hidden');
    userMenuWrapper.classList.remove('open');
    showView('orders');
  });
}

if (dropdownAccountSettings) {
  dropdownAccountSettings.addEventListener('click', () => {
    userDropdown.classList.add('hidden');
    userMenuWrapper.classList.remove('open');
    showView('account');
  });
}

document.addEventListener('click', (e) => {
  if (userMenuWrapper && !userMenuWrapper.contains(e.target)) {
    userDropdown.classList.add('hidden');
    userMenuWrapper.classList.remove('open');
  }
});

// ── Contador de caracteres ────────────────────────────────────────
descricaoEl.addEventListener('input', () => {
  const len = descricaoEl.value.length;
  const max = 800;
  descricaoCount.textContent = `${len} / ${max}`;
  descricaoCount.classList.toggle('limit-near', len > max * 0.85 && len < max);
  descricaoCount.classList.toggle('limit-max', len >= max);
});

// ── Erros Supabase → Português ───────────────────────────────────
function translateError(msg) {
  if (!msg) return 'Ocorreu um erro inesperado. Tenta novamente.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid email or password'))
    return 'Email ou palavra-passe incorretos.';
  if (m.includes('email not confirmed'))
    return 'Confirma o teu email antes de iniciares sessão. Verifica a caixa de entrada.';
  if (m.includes('user already registered') || m.includes('already been registered') || m.includes('email address is already registered'))
    return 'Este email já está associado a uma conta. Tenta entrar.';
  if (m.includes('password should be at least') || m.includes('weak password') || m.includes('password is too short'))
    return 'A palavra-passe não cumpre os requisitos mínimos (mín. 8 caracteres).';
  if (m.includes('user not found') || m.includes('no user found'))
    return 'Não existe nenhuma conta com este email.';
  if (m.includes('rate limit') || m.includes('too many requests') || m.includes('email rate limit exceeded'))
    return 'Demasiadas tentativas. Espera alguns minutos e tenta novamente.';
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch'))
    return 'Não foi possível contactar o servidor. Verifica a ligação e tenta novamente.';
  if (m.includes('anonymous sign-ins are disabled'))
    return 'O registo anónimo está desativado.';
  if (m.includes('signup is disabled') || m.includes('signups not allowed'))
    return 'O registo de novas contas está temporariamente desativado.';
  if (m.includes('password has been leaked') || m.includes('compromised'))
    return 'Esta palavra-passe foi detetada numa fuga de dados conhecida. Escolhe outra.';
  return msg;
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearFieldErrors(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
}
function showNote(el, msg, isError = true) {
  el.classList.remove('hidden');
  el.classList.toggle('error', isError);
  el.textContent = msg;
}
function hideNote(el) { el.classList.add('hidden'); }

// ── Toggle de visibilidade da password ───────────────────────────
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const show = target.type === 'password';
    target.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Esconder palavra-passe' : 'Mostrar palavra-passe');
    const svg = btn.querySelector('.eye-icon');
    if (svg) svg.style.opacity = show ? '0.5' : '1';
  });
});

// ── Força da password ─────────────────────────────────────────────
const PW_RULES = [
  { key: 'len',   test: p => p.length >= 8 },
  { key: 'upper', test: p => /[A-Z]/.test(p) },
  { key: 'lower', test: p => /[a-z]/.test(p) },
  { key: 'num',   test: p => /[0-9]/.test(p) },
  { key: 'sym',   test: p => /[^A-Za-z0-9]/.test(p) },
];
const STRENGTH_LABELS = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
const STRENGTH_CLASSES = ['', 'pw-s1', 'pw-s2', 'pw-s3', 'pw-s4', 'pw-s5'];

function evalPassword(pw) {
  return PW_RULES.map(r => ({ ...r, ok: r.test(pw) }));
}

const regPwInput = document.getElementById('reg-password');
const pwStrengthEl = document.getElementById('pw-strength');
const pwStrengthLabel = document.getElementById('pw-strength-label');
const pwRulesEl = document.getElementById('pw-rules');

regPwInput.addEventListener('input', () => {
  const pw = regPwInput.value;
  const results = evalPassword(pw);
  const score = results.filter(r => r.ok).length;

  // update rule items
  results.forEach(r => {
    const li = pwRulesEl.querySelector(`[data-rule="${r.key}"]`);
    if (li) li.classList.toggle('rule-ok', r.ok);
  });

  // update bars
  const bars = pwStrengthEl.querySelectorAll('.pw-bars span');
  bars.forEach((bar, i) => {
    bar.className = '';
    if (pw.length > 0 && i < score) bar.classList.add(STRENGTH_CLASSES[score] || '');
  });

  pwStrengthLabel.textContent = pw.length > 0 ? (STRENGTH_LABELS[score] || '') : '';
});

function passwordIsValid(pw) {
  return evalPassword(pw).every(r => r.ok);
}

// ── Modal: abrir / fechar ─────────────────────────────────────────
let currentMode = 'login';

function setAuthMode(mode) {
  currentMode = mode;
  loginForm.classList.toggle('hidden', mode !== 'login');
  registerForm.classList.toggle('hidden', mode !== 'register');
  forgotForm.classList.toggle('hidden', mode !== 'forgot');

  const titles = { login: 'Entrar no Bao Bao Club', register: 'Criar conta', forgot: 'Recuperar palavra-passe' };
  authModalTitle.textContent = titles[mode] || 'Autenticação';

  document.querySelectorAll('.auth-tab').forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  // Mostrar tabs só nos modos login/register
  const tabs = document.querySelector('.auth-tabs');
  if (tabs) tabs.classList.toggle('hidden', mode === 'forgot');

  hideNote(loginNote); hideNote(registerNote); hideNote(forgotNote);
  clearFieldErrors('login-email-err','login-pw-err','reg-email-err','reg-pw-err','reg-confirm-err','forgot-email-err');
}

function openAuthModal(mode = 'login') {
  authModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setAuthMode(mode);
}
function closeAuthModal() {
  authModal.classList.add('hidden');
  document.body.style.overflow = '';
  loginForm.reset(); registerForm.reset(); forgotForm.reset();
  setAuthMode('login');
  // reset password strength UI
  const bars = document.querySelectorAll('.pw-bars span');
  bars.forEach(b => b.className = '');
  pwStrengthLabel.textContent = '';
  document.querySelectorAll('.pw-rules li').forEach(li => li.classList.remove('rule-ok'));
}

authBtn.addEventListener('click', () => openAuthModal('login'));
authModalClose.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });

// ── Modals: Novo Pedido e Termos ──────────────────────────────────
let isOpeningModal = false;

async function openRequestModal() {
  if (isOpeningModal || !requestModal) {
    alert('Cannot open: isOpeningModal=' + isOpeningModal + ', requestModal=' + !!requestModal);
    return;
  }
  isOpeningModal = true;
  
  const session = await getSession();
  if (!session) {
    openAuthModal('login');
    isOpeningModal = false;
    return;
  }
  
  alert('About to remove hidden class. Current classes: ' + requestModal.className);
  requestModal.classList.remove('hidden');
  alert('Hidden class removed. New classes: ' + requestModal.className);
  document.body.style.overflow = 'hidden';
  isOpeningModal = false;
}

function closeRequestModal() {
  if (requestModal) requestModal.classList.add('hidden');
  document.body.style.overflow = '';
  if (requestForm) requestForm.reset();
  if (formStatus) formStatus.textContent = '';
  if (descricaoCount) {
    descricaoCount.textContent = '0 / 800';
    descricaoCount.classList.remove('limit-near', 'limit-max');
  }
}

function openTermsModal() {
  if (termsModal) {
    termsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeTermsModal() {
  if (termsModal) termsModal.classList.add('hidden');
  document.body.style.overflow = '';
}

if (openRequestModalBtn) openRequestModalBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openRequestModal(); });
if (pedidosHeaderNewBtn) pedidosHeaderNewBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openRequestModal(); });
if (dropdownNewRequest) {
  dropdownNewRequest.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userDropdown) userDropdown.classList.add('hidden');
    if (userMenuWrapper) userMenuWrapper.classList.remove('open');
    openRequestModal();
  });
}

if (requestModalClose) requestModalClose.addEventListener('click', closeRequestModal);
if (requestModal) requestModal.addEventListener('click', (e) => { if (e.target === requestModal) closeRequestModal(); });

if (termsModalClose) termsModalClose.addEventListener('click', closeTermsModal);
if (termsModal) termsModal.addEventListener('click', (e) => { if (e.target === termsModal) closeTermsModal(); });
if (footerTerms) {
  footerTerms.addEventListener('click', (e) => {
    e.preventDefault();
    openTermsModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (authModal && !authModal.classList.contains('hidden')) closeAuthModal();
    if (requestModal && !requestModal.classList.contains('hidden')) closeRequestModal();
    if (termsModal && !termsModal.classList.contains('hidden')) closeTermsModal();
    if (userDropdown) {
      userDropdown.classList.add('hidden');
      if (userMenuWrapper) userMenuWrapper.classList.remove('open');
    }
  }
});

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
});
forgotLink.addEventListener('click', () => setAuthMode('forgot'));
backToLogin.addEventListener('click', () => setAuthMode('login'));

// ── Login ─────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFieldErrors('login-email-err', 'login-pw-err');
  hideNote(loginNote);

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !email.includes('@')) {
    showFieldError('login-email-err', 'Introduz um email válido.');
    return;
  }
  if (!password) {
    showFieldError('login-pw-err', 'Introduz a tua palavra-passe.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.querySelector('span').textContent = 'A entrar...';

  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      showNote(loginNote, translateError(error.message));
    }
    // sucesso: onAuthStateChange fecha o modal
  } catch (err) {
    showNote(loginNote, translateError('network'));
  }

  loginBtn.disabled = false;
  loginBtn.querySelector('span').textContent = 'Entrar';
});

// ── Registo ───────────────────────────────────────────────────────
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFieldErrors('reg-email-err', 'reg-pw-err', 'reg-confirm-err');
  hideNote(registerNote);

  const email    = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;

  let ok = true;
  if (!email || !email.includes('@')) {
    showFieldError('reg-email-err', 'Introduz um email válido.');
    ok = false;
  }
  if (!passwordIsValid(password)) {
    showFieldError('reg-pw-err', 'A palavra-passe não cumpre todos os requisitos.');
    ok = false;
  }
  if (password !== confirm) {
    showFieldError('reg-confirm-err', 'As palavras-passe não coincidem.');
    ok = false;
  }
  if (!ok) return;

  registerBtn.disabled = true;
  registerBtn.querySelector('span').textContent = 'A criar conta...';

  try {
    const { error } = await sb.auth.signUp({ email, password });
    if (error) {
      showNote(registerNote, translateError(error.message));
    } else {
      showNote(registerNote, 'Conta criada! Verifica o teu email para confirmares o registo.', false);
      registerForm.reset();
    }
  } catch (err) {
    showNote(registerNote, translateError('network'));
  }

  registerBtn.disabled = false;
  registerBtn.querySelector('span').textContent = 'Criar conta';
});

// ── Esqueci a password ────────────────────────────────────────────
forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFieldErrors('forgot-email-err');
  hideNote(forgotNote);

  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    showFieldError('forgot-email-err', 'Introduz um email válido.');
    return;
  }

  forgotBtn.disabled = true;
  forgotBtn.querySelector('span').textContent = 'A enviar...';

  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) {
      showNote(forgotNote, translateError(error.message));
    } else {
      showNote(forgotNote, 'Link enviado! Verifica o teu email (incluindo a pasta de spam).', false);
      forgotForm.reset();
    }
  } catch (err) {
    showNote(forgotNote, translateError('network'));
  }

  forgotBtn.disabled = false;
  forgotBtn.querySelector('span').textContent = 'Enviar link de recuperação';
});

logoutBtn.addEventListener('click', async () => {
  if (userDropdown) userDropdown.classList.add('hidden');
  if (userMenuWrapper) userMenuWrapper.classList.remove('open');
  await sb.auth.signOut();
  toast('Sessão terminada.');
});

// ── Sessão ────────────────────────────────────────────────────────
// getSession() already defined above with caching

async function renderSession() {
  const session = await getSession();
  const heroSection = document.getElementById('hero-section');
  const appContent  = document.getElementById('app-content');

  if (session?.user) {
    // UTILIZADOR AUTENTICADO: Esconder Hero e mostrar Aplicação
    if (heroSection) heroSection.classList.add('hidden');
    if (appContent)  appContent.classList.remove('hidden');

    authBtn.classList.add('hidden');
    if (userMenuWrapper) userMenuWrapper.classList.remove('hidden');

    const userMetadataName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
    const displayName = userMetadataName || (session.user.email || 'utilizador').split('@')[0];

    if (userMenuEmail) userMenuEmail.textContent = displayName;
    if (dropdownUserEmail) dropdownUserEmail.textContent = session.user.email || '';

    // Preencher campos das definições de conta se estiverem vazios
    const profileNameInput = document.getElementById('profile-name-input');
    const profileEmailInput = document.getElementById('profile-email-input');
    if (profileNameInput && !profileNameInput.value) profileNameInput.value = userMetadataName;
    if (profileEmailInput && !profileEmailInput.value) profileEmailInput.value = session.user.email || '';

    // Personalização da mensagem de Boas-Vindas
    const visitedKey = 'baobao_visited_' + session.user.id;
    const hasVisited = localStorage.getItem(visitedKey);

    if (!hasVisited) {
      if (welcomeBadge)    welcomeBadge.textContent = '🎉 Conta criada!';
      if (welcomeTitle)    welcomeTitle.textContent = `Olá, ${displayName}! Bem-vindo ao Bao Bao Club 👋`;
      if (welcomeSubtitle) welcomeSubtitle.textContent = 'A tua conta foi registada com sucesso. Clica em "Fazer pedido" para submeteres o teu primeiro pedido — é muito rápido!';
      localStorage.setItem(visitedKey, 'true');
    } else {
      if (welcomeBadge)    welcomeBadge.textContent = 'Área de cliente';
      if (welcomeTitle)    welcomeTitle.textContent = `Bem-vindo de volta, ${displayName}! 👋`;
      if (welcomeSubtitle) welcomeSubtitle.textContent = 'Acompanha aqui o estado das tuas encomendas em tempo real ou cria um novo pedido de compra.';
    }

    loadRequests(session.user.id);
    checkAdmin();
  } else {
    // VISITANTE / DESLOGADO: Mostrar Hero e esconder Aplicação
    if (heroSection) heroSection.classList.remove('hidden');
    if (appContent)  appContent.classList.add('hidden');

    authBtn.classList.remove('hidden');
    if (userMenuWrapper) userMenuWrapper.classList.add('hidden');
    if (userDropdown) userDropdown.classList.add('hidden');
    if (userMenuWrapper) userMenuWrapper.classList.remove('open');

    adminPanel.classList.add('hidden');

    // Voltar ao topo ao fazer logout
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ── Atualizações de Perfil e Conta ─────────────────────────────────
const profileNameForm = document.getElementById('profile-name-form');
const saveNameBtn     = document.getElementById('save-name-btn');
const saveNameNote    = document.getElementById('save-name-note');

if (profileNameForm) {
  profileNameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors('profile-name-err');
    hideNote(saveNameNote);

    const nameVal = document.getElementById('profile-name-input').value.trim();
    if (!nameVal) {
      showFieldError('profile-name-err', 'Introduz o teu nome.');
      return;
    }

    saveNameBtn.disabled = true;
    saveNameBtn.querySelector('span').textContent = 'A guardar...';

    try {
      const { error } = await sb.auth.updateUser({ data: { full_name: nameVal } });
      if (error) {
        showNote(saveNameNote, translateError(error.message));
      } else {
        showNote(saveNameNote, 'Nome de utilizador atualizado com sucesso!', false);
        toast('Nome de utilizador guardado.', 'success');
        renderSession();
      }
    } catch (err) {
      showNote(saveNameNote, translateError('network'));
    }

    saveNameBtn.disabled = false;
    saveNameBtn.querySelector('span').textContent = 'Guardar nome';
  });
}

const profileEmailForm = document.getElementById('profile-email-form');
const saveEmailBtn     = document.getElementById('save-email-btn');
const saveEmailNote    = document.getElementById('save-email-note');

if (profileEmailForm) {
  profileEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors('profile-email-err');
    hideNote(saveEmailNote);

    const emailVal = document.getElementById('profile-email-input').value.trim().toLowerCase();
    if (!emailVal || !emailVal.includes('@')) {
      showFieldError('profile-email-err', 'Introduz um email válido.');
      return;
    }

    saveEmailBtn.disabled = true;
    saveEmailBtn.querySelector('span').textContent = 'A atualizar...';

    try {
      const { error } = await sb.auth.updateUser({ email: emailVal });
      if (error) {
        showNote(saveEmailNote, translateError(error.message));
      } else {
        showNote(saveEmailNote, 'Pedido enviado! Verifica a caixa de entrada do novo email para confirmar a alteração.', false);
        toast('Verifica o teu novo email para confirmar.', 'success');
      }
    } catch (err) {
      showNote(saveEmailNote, translateError('network'));
    }

    saveEmailBtn.disabled = false;
    saveEmailBtn.querySelector('span').textContent = 'Atualizar email';
  });
}

const profilePwForm   = document.getElementById('profile-password-form');
const profileNewPw    = document.getElementById('profile-new-pw');
const profileConfirmPw= document.getElementById('profile-confirm-pw');
const savePwBtn       = document.getElementById('save-pw-btn');
const savePwNote      = document.getElementById('save-pw-note');
const profilePwStrength = document.getElementById('profile-pw-strength');
const profilePwStrengthLabel = document.getElementById('profile-pw-strength-label');
const profilePwRules  = document.getElementById('profile-pw-rules');

if (profileNewPw && profilePwStrength) {
  profileNewPw.addEventListener('input', () => {
    const pw = profileNewPw.value;
    const results = evalPassword(pw);
    const score = results.filter(r => r.ok).length;

    results.forEach(r => {
      const li = profilePwRules?.querySelector(`[data-rule="${r.key}"]`);
      if (li) li.classList.toggle('rule-ok', r.ok);
    });

    const bars = profilePwStrength.querySelectorAll('.pw-bars span');
    bars.forEach((bar, i) => {
      bar.className = '';
      if (pw.length > 0 && i < score) bar.classList.add(STRENGTH_CLASSES[score] || '');
    });

    if (profilePwStrengthLabel) {
      profilePwStrengthLabel.textContent = pw.length > 0 ? (STRENGTH_LABELS[score] || '') : '';
    }
  });
}

if (profilePwForm) {
  profilePwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors('profile-new-pw-err', 'profile-confirm-pw-err');
    hideNote(savePwNote);

    const newPw = profileNewPw.value;
    const confirmPw = profileConfirmPw.value;

    let ok = true;
    if (!passwordIsValid(newPw)) {
      showFieldError('profile-new-pw-err', 'A palavra-passe não cumpre todos os requisitos.');
      ok = false;
    }
    if (newPw !== confirmPw) {
      showFieldError('profile-confirm-pw-err', 'As palavras-passe não coincidem.');
      ok = false;
    }
    if (!ok) return;

    savePwBtn.disabled = true;
    savePwBtn.querySelector('span').textContent = 'A alterar...';

    try {
      const { error } = await sb.auth.updateUser({ password: newPw });
      if (error) {
        showNote(savePwNote, translateError(error.message));
      } else {
        showNote(savePwNote, 'Palavra-passe alterada com sucesso!', false);
        toast('Palavra-passe alterada com sucesso.', 'success');
        profilePwForm.reset();
        const bars = profilePwStrength.querySelectorAll('.pw-bars span');
        bars.forEach(b => b.className = '');
        if (profilePwStrengthLabel) profilePwStrengthLabel.textContent = '';
        if (profilePwRules) profilePwRules.querySelectorAll('li').forEach(li => li.classList.remove('rule-ok'));
      }
    } catch (err) {
      showNote(savePwNote, translateError('network'));
    }

    savePwBtn.disabled = false;
    savePwBtn.querySelector('span').textContent = 'Alterar palavra-passe';
  });
}

sb.auth.onAuthStateChange((_event, session) => {
  cachedSession = session; // Update cache when auth state changes
  renderSession();
  if (session) closeAuthModal();
});

// ── Pedidos ───────────────────────────────────────────────────────
const STATUS_LABEL = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_curso: 'Em curso',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

function renderRequestTags(item) {
  const tags = [];
  if (item.quantidade && item.quantidade > 1) tags.push(`<span class="request-tag">Qtd: ${escapeHtml(item.quantidade)}</span>`);
  if (item.tamanho) tags.push(`<span class="request-tag">Tam: ${escapeHtml(item.tamanho)}</span>`);
  if (item.urgencia === 'urgente') tags.push(`<span class="request-tag urgent">Urgente</span>`);
  return tags.length ? `<div class="request-tags">${tags.join('')}</div>` : '';
}

function renderRequestLink(item) {
  if (!item.link) return '';
  const safeHref = /^https?:\/\//i.test(item.link) ? item.link : '#';
  return `<a class="request-link" href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.link)}</a>`;
}

async function loadRequests(userId) {
  requestsList.innerHTML = `<div class="request-empty"><strong>A carregar...</strong></div>`;
  const { data, error } = await sb
    .from('pedidos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    requestsList.innerHTML = `<div class="request-empty"><strong>Erro ao carregar pedidos</strong><span>${escapeHtml(error.message)}</span></div>`;
    return;
  }
  if (!data?.length) {
    requestsList.innerHTML = `
      <div class="request-empty">
        <span class="request-empty-icon" aria-hidden="true">🧾</span>
        <strong>Ainda sem pedidos</strong>
        <span>Envia o primeiro pedido para começar.</span>
      </div>`;
    return;
  }

  requestsList.innerHTML = data.map(item => {
    const statusKey = item.status || 'pendente';
    const statusLabel = STATUS_LABEL[statusKey] || statusKey;
    const date = new Date(item.created_at).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `
      <article class="request-ticket">
        <div class="request-top">
          <span class="request-type">${escapeHtml(item.titulo || item.tipo || 'pedido')}</span>
          <span class="status-pill status-${statusKey}">${escapeHtml(statusLabel)}</span>
        </div>
        ${renderRequestTags(item)}
        <p class="request-desc">${escapeHtml(item.descricao || '')}</p>
        ${renderRequestLink(item)}
        <div class="request-divider"></div>
        <div class="request-bottom">
          <span class="request-budget">${escapeHtml(item.orcamento || 'Sem orçamento definido')}</span>
          <span class="request-date">${date}</span>
        </div>
      </article>`;
  }).join('');
}

function validateRequestForm() {
  const titulo    = document.getElementById('titulo');
  const orcamento = document.getElementById('orcamento');
  const descricao = document.getElementById('descricao');
  const quantidade = document.getElementById('quantidade');
  const link      = document.getElementById('link');

  const checks = [
    [titulo,    titulo.value.trim().length > 0,                                               'Indica um título para o pedido.'],
    [orcamento, orcamento.value.trim().length > 0,                                            'Indica um orçamento, mesmo que aproximado.'],
    [descricao, descricao.value.trim().length >= 10,                                          'Descreve o pedido com um pouco mais de detalhe (mín. 10 caracteres).'],
    [quantidade, Number(quantidade.value) >= 1 && Number(quantidade.value) <= 99,             'A quantidade tem de estar entre 1 e 99.'],
    [link,      link.value.trim() === '' || /^https?:\/\/.+/i.test(link.value.trim()),        'O link tem de começar por http:// ou https://.'],
  ];

  for (const [el, ok, message] of checks) {
    if (!ok) { el.focus(); return message; }
  }
  return null;
}

requestForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const session = await getSession();
  if (!session) {
    formStatus.textContent = 'Entra primeiro para enviares o pedido.';
    openAuthModal('login');
    return;
  }

  const validationError = validateRequestForm();
  if (validationError) {
    formStatus.textContent = validationError;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'A enviar...';
  formStatus.textContent = '';

  const payload = {
    user_id:   session.user.id,
    titulo:    document.getElementById('titulo').value.trim(),
    tipo:      document.getElementById('tipo').value,
    quantidade: Number(document.getElementById('quantidade').value) || 1,
    tamanho:   document.getElementById('tamanho').value.trim() || null,
    link:      document.getElementById('link').value.trim() || null,
    urgencia:  document.getElementById('urgencia').value,
    contacto:  document.getElementById('contacto').value.trim() || null,
    orcamento: document.getElementById('orcamento').value.trim(),
    descricao: document.getElementById('descricao').value.trim()
  };

  try {
    const { error } = await sb.from('pedidos').insert([payload]);
    if (error) {
      formStatus.textContent = translateError(error.message);
      toast('Não foi possível enviar o pedido.', 'error');
    } else {
      toast('Pedido enviado com sucesso.', 'success');
      closeRequestModal();
      loadRequests(session.user.id);
    }
  } catch (err) {
    formStatus.textContent = 'Erro de rede. Tenta novamente.';
    toast('Erro de rede ao enviar o pedido.', 'error');
  }

  submitBtn.disabled = false;
  submitBtn.querySelector('span').textContent = 'Enviar pedido';
});

// ── Utilidades ─────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s).replace(/[&<>"]+/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function escapeAttr(s) { return String(s).replace(/"/g, '&quot;'); }

// ── Admin ──────────────────────────────────────────────────────────
async function checkAdmin() {
  const session = await getSession();
  if (!session) { adminPanel.classList.add('hidden'); return; }

  const { data, error } = await sb
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error || !data) { adminPanel.classList.add('hidden'); return; }
  adminPanel.classList.remove('hidden');
  loadAdminRequests();
}

async function loadAdminRequests() {
  adminStatusEl.textContent = 'A carregar...';
  const { data, error } = await sb.rpc('admin_list_pedidos');

  if (error) {
    adminStatusEl.textContent = '';
    adminList.innerHTML = `<div class="request-empty"><strong>Erro ao carregar</strong><span>${escapeHtml(translateError(error.message))}</span></div>`;
    return;
  }
  adminStatusEl.textContent = '';
  if (!data?.length) {
    adminList.innerHTML = `
      <div class="request-empty">
        <span class="request-empty-icon" aria-hidden="true">📋</span>
        <strong>Sem pedidos</strong>
        <span>Ainda não há pedidos de clientes.</span>
      </div>`;
    return;
  }

  adminList.innerHTML = data.map(item => {
    const date = new Date(item.created_at).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const options = Object.entries(STATUS_LABEL)
      .map(([key, label]) => `<option value="${key}" ${item.status === key ? 'selected' : ''}>${label}</option>`)
      .join('');
    const contactLine = item.contacto ? `<div class="admin-request-user">Contacto: ${escapeHtml(item.contacto)}</div>` : '';
    return `
      <article class="admin-request" data-id="${item.id}">
        <div class="admin-request-head">
          <div>
            <span class="request-type">${escapeHtml(item.titulo || item.tipo || 'pedido')}</span>
            <div class="admin-request-user">${escapeHtml(item.user_email || 'email desconhecido')} · ${date}</div>
            ${contactLine}
          </div>
          <select class="status-select" data-id="${item.id}">${options}</select>
        </div>
        ${renderRequestTags(item)}
        <p class="request-desc">${escapeHtml(item.descricao || '')}</p>
        ${renderRequestLink(item)}
        <div class="request-divider"></div>
        <span class="request-budget">${escapeHtml(item.orcamento || 'Sem orçamento definido')}</span>
      </article>`;
  }).join('');

  adminList.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const id = sel.dataset.id;
      const newStatus = sel.value;
      sel.disabled = true;
      try {
        const { error: updError } = await sb.from('pedidos').update({ status: newStatus }).eq('id', id);
        if (updError) toast(translateError(updError.message), 'error');
        else toast('Estado atualizado.', 'success');
      } catch (err) {
        toast('Erro de rede ao atualizar estado.', 'error');
      }
      sel.disabled = false;
    });
  });
}

adminRefreshBtn.addEventListener('click', loadAdminRequests);

// ── Arranque ───────────────────────────────────────────────────────
(async () => {
  await initSession();
})();

async function initSession() {
  const session = await getSession();
  cachedSession = session; // Ensure cache is set
  renderSession();
}
