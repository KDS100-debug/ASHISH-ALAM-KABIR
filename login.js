'use strict';

const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const fullName = document.getElementById('full-name');
const nameField = document.getElementById('name-field');
const authTitle = document.getElementById('auth-title');
const authOverline = document.getElementById('auth-overline');
const authSubmit = document.getElementById('auth-submit');
const authStatus = document.getElementById('auth-status');
const authAlternate = document.getElementById('auth-alternate');
const authAlternateText = document.getElementById('auth-alternate-text');
const authFlowToggle = document.getElementById('auth-flow-toggle');
const authSetupNotice = document.getElementById('auth-setup-notice');
const modeButtons = [...document.querySelectorAll('[data-auth-mode]')];
const passwordToggle = document.querySelector('.password-toggle');

let authMode = 'user';
let authFlow = 'sign-in';
let supabaseClient;

function setStatus(message = '', type = '') {
  authStatus.textContent = message;
  authStatus.className = `auth-status${type ? ` is-${type}` : ''}`;
}

function updateAuthForm() {
  const isSignUp = authFlow === 'sign-up';
  const isAdmin = authMode === 'admin';

  nameField.hidden = !isSignUp;
  fullName.required = isSignUp;
  authPassword.autocomplete = isSignUp ? 'new-password' : 'current-password';
  authOverline.textContent = isSignUp ? 'Join the portfolio' : isAdmin ? 'Restricted access' : 'Welcome back';
  authTitle.textContent = isSignUp ? 'Create your account' : isAdmin ? 'Administrator sign in' : 'Sign in to your account';
  authSubmit.querySelector('span').textContent = isSignUp ? 'Create account' : isAdmin ? 'Continue as admin' : 'Sign in';
  authAlternate.hidden = isAdmin;
  authAlternateText.textContent = isSignUp ? 'Already registered?' : 'New here?';
  authFlowToggle.textContent = isSignUp ? 'Sign in instead' : 'Create an account';
  setStatus();
}

function setMode(mode) {
  authMode = mode;
  if (mode === 'admin') authFlow = 'sign-in';

  modeButtons.forEach((button) => {
    const active = button.dataset.authMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  updateAuthForm();
}

async function verifyAdmin(userId) {
  const profile = await window.AAKAuth.getProfile(supabaseClient, userId);
  return profile?.role === 'admin';
}

async function handleSignIn() {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: authEmail.value.trim(),
    password: authPassword.value,
  });

  if (error) throw error;

  if (authMode === 'admin') {
    const isAdmin = await verifyAdmin(data.user.id);
    if (!isAdmin) {
      await supabaseClient.auth.signOut({ scope: 'local' });
      throw new Error('This account does not have administrator access.');
    }
    window.location.assign('admin.html');
    return;
  }

  const redirect = new URLSearchParams(window.location.search).get('redirect');
  const safeRedirect = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : 'dashboard.html';
  window.location.assign(safeRedirect);
}

async function handleSignUp() {
  const { data, error } = await supabaseClient.auth.signUp({
    email: authEmail.value.trim(),
    password: authPassword.value,
    options: { data: { full_name: fullName.value.trim() } },
  });

  if (error) throw error;

  if (data.session) {
    window.location.assign('dashboard.html');
    return;
  }

  setStatus('Account created. Check your email to confirm your address before signing in.', 'success');
  authForm.reset();
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus();
  authSubmit.disabled = true;
  authSubmit.classList.add('is-loading');

  try {
    if (!supabaseClient) supabaseClient = await window.AAKAuth.getClient();
    if (authFlow === 'sign-up') await handleSignUp();
    else await handleSignIn();
  } catch (error) {
    const message = error?.code === 'SUPABASE_NOT_CONFIGURED'
      ? 'Authentication is not configured yet.'
      : error?.message || 'Authentication failed. Please try again.';
    setStatus(message, 'error');
    if (error?.code === 'SUPABASE_NOT_CONFIGURED') authSetupNotice.hidden = false;
  } finally {
    authSubmit.disabled = false;
    authSubmit.classList.remove('is-loading');
  }
});

modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.authMode)));
authFlowToggle.addEventListener('click', () => {
  authFlow = authFlow === 'sign-in' ? 'sign-up' : 'sign-in';
  updateAuthForm();
});

passwordToggle.addEventListener('click', () => {
  const showPassword = authPassword.type === 'password';
  authPassword.type = showPassword ? 'text' : 'password';
  passwordToggle.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
  passwordToggle.querySelector('i').className = showPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
});

(async function initializeLogin() {
  try {
    supabaseClient = await window.AAKAuth.getClient();
  } catch (error) {
    if (error?.code === 'SUPABASE_NOT_CONFIGURED') authSetupNotice.hidden = false;
  }
})();
