'use strict';

const protectedContent = document.getElementById('protected-content');
const authGuard = document.getElementById('auth-guard');
const welcomeName = document.getElementById('welcome-name');
const accountInitials = document.getElementById('account-initials');
const profileEmail = document.getElementById('profile-email');
const profileRole = document.getElementById('profile-role');
const profileCreated = document.getElementById('profile-created');
const profileName = document.getElementById('profile-name');
const profileForm = document.getElementById('profile-form');
const profileSubmit = document.getElementById('profile-submit');
const profileStatus = document.getElementById('profile-status');
const adminLink = document.getElementById('admin-link');
const signOutButtons = [document.getElementById('sign-out'), document.getElementById('sign-out-secondary')];

let supabaseClient;
let currentUser;
let currentProfile;

function initialsFor(name) {
  return String(name || 'Member')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

function renderProfile() {
  const displayName = currentProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'member';
  welcomeName.textContent = displayName;
  accountInitials.textContent = initialsFor(displayName);
  profileEmail.textContent = currentProfile?.email || currentUser.email || '—';
  profileRole.textContent = currentProfile?.role === 'admin' ? 'Administrator' : 'User';
  profileRole.classList.toggle('is-admin', currentProfile?.role === 'admin');
  profileCreated.textContent = formatDate(currentProfile?.created_at || currentUser.created_at);
  profileName.value = displayName;
  adminLink.hidden = currentProfile?.role !== 'admin';
}

function setProfileStatus(message = '', type = '') {
  profileStatus.textContent = message;
  profileStatus.className = `auth-status${type ? ` is-${type}` : ''}`;
}

function showGuardError(title, message) {
  authGuard.innerHTML = '<div class="guard-error"><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i><h1></h1><p></p><a href="login.html">Return to login</a></div>';
  authGuard.querySelector('h1').textContent = title;
  authGuard.querySelector('p').textContent = message;
}

async function signOut() {
  signOutButtons.forEach((button) => { button.disabled = true; });
  try {
    await window.AAKAuth.signOut(supabaseClient);
  } catch (error) {
    setProfileStatus(error.message || 'Could not sign out.', 'error');
    signOutButtons.forEach((button) => { button.disabled = false; });
  }
}

signOutButtons.forEach((button) => button.addEventListener('click', signOut));

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nextName = profileName.value.trim();
  if (!nextName) return;

  profileSubmit.disabled = true;
  setProfileStatus('Saving…');
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ full_name: nextName })
    .eq('id', currentUser.id)
    .select('id, email, full_name, avatar_url, role, created_at, updated_at')
    .single();

  profileSubmit.disabled = false;
  if (error) {
    setProfileStatus(error.message || 'Could not save your profile.', 'error');
    return;
  }

  currentProfile = data;
  renderProfile();
  setProfileStatus('Profile updated successfully.', 'success');
});

(async function initializeDashboard() {
  try {
    supabaseClient = await window.AAKAuth.getClient();
    currentUser = await window.AAKAuth.getCurrentUser(supabaseClient);
    if (!currentUser) {
      window.AAKAuth.redirectToLogin('/dashboard.html');
      return;
    }

    currentProfile = await window.AAKAuth.getProfile(supabaseClient, currentUser.id);
    if (!currentProfile) throw new Error('Your profile record is missing. Apply the Supabase setup SQL and sign in again.');
    renderProfile();
    authGuard.hidden = true;
    protectedContent.hidden = false;
  } catch (error) {
    showGuardError('Account unavailable', error.message || 'Unable to load your account.');
  }
})();
