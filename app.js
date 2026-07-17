// ── Supabase config ──────────────────────────────────────────────
const SUPABASE_URL  = 'https://pjikhifdcinapjwtjbip.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaWtoaWZkY2luYXBqd3RqYmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMDUzNTcsImV4cCI6MjA5OTg4MTM1N30.DZgV_oxpTZsZSat28edORgvTsEv0ai1RPAbkHKwucL4';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Elementos ────────────────────────────────────────────────────
const authScreen = document.getElementById('auth-screen');
const appScreen  = document.getElementById('app-screen');
const userName   = document.getElementById('user-name');

// ── Verificar sessão ao carregar ─────────────────────────────────
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) showApp(session.user);
})();

// ── Ouvir mudanças de auth ────────────────────────────────────────
sb.auth.onAuthStateChange((_event, session) => {
  if (session) showApp(session.user);
  else         showAuth();
});

// ── Mostrar app / auth ────────────────────────────────────────────
function showApp(user) {
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Membro';
  userName.textContent = name;
}
function showAuth() {
  appScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
}

// ── Tabs ──────────────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-signup').classList.toggle('hidden', tab !== 'signup');
}

// ── Login ─────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'A entrar...';

  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) {
    errEl.textContent = traduzirErro(error.message);
    errEl.classList.remove('hidden');
  }
  btn.disabled = false;
  btn.textContent = 'Entrar';
}

// ── Registo ───────────────────────────────────────────────────────
async function handleSignup(e) {
  e.preventDefault();
  const btn     = document.getElementById('signup-btn');
  const errEl   = document.getElementById('signup-error');
  const sucEl   = document.getElementById('signup-success');
  const name    = document.getElementById('signup-name').value.trim();
  const email   = document.getElementById('signup-email').value.trim();
  const pass    = document.getElementById('signup-password').value;

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'A criar conta...';

  const { error } = await sb.auth.signUp({
    email,
    password: pass,
    options: { data: { name } }
  });

  if (error) {
    errEl.textContent = traduzirErro(error.message);
    errEl.classList.remove('hidden');
  } else {
    sucEl.textContent = '✓ Conta criada! Verifica o teu email para confirmares.';
    sucEl.classList.remove('hidden');
  }
  btn.disabled = false;
  btn.textContent = 'Criar conta';
}

// ── Logout ────────────────────────────────────────────────────────
async function handleLogout() {
  await sb.auth.signOut();
}

// ── Traduzir erros Supabase → PT ─────────────────────────────────
function traduzirErro(msg) {
  if (msg.includes('Invalid login'))  return 'Email ou password incorretos.';
  if (msg.includes('already registered')) return 'Este email já tem uma conta.';
  if (msg.includes('at least 6'))     return 'A password tem de ter pelo menos 6 caracteres.';
  if (msg.includes('valid email'))    return 'Introduz um email válido.';
  return msg;
}
