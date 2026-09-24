'use strict';

const protectedContent = document.getElementById('protected-content');
const authGuard = document.getElementById('auth-guard');
const adminName = document.getElementById('admin-name');
const adminEmail = document.getElementById('admin-email');
const adminInitials = document.getElementById('admin-initials');
const totalUsers = document.getElementById('total-users');
const standardUsers = document.getElementById('standard-users');
const adminUsers = document.getElementById('admin-users');
const usersTableBody = document.getElementById('users-table-body');
const adminEmpty = document.getElementById('admin-empty');
const adminStatus = document.getElementById('admin-status');
const userSearch = document.getElementById('user-search');
const signOutButton = document.getElementById('sign-out');

let supabaseClient;
let profiles = [];

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}

function initialsFor(name) {
  return String(name || 'Administrator').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
}

function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

function showGuardError(title, message) {
  authGuard.innerHTML = '<div class="guard-error"><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i><h1></h1><p></p><a href="login.html">Return to login</a></div>';
  authGuard.querySelector('h1').textContent = title;
  authGuard.querySelector('p').textContent = message;
}

function renderProfiles(searchTerm = '') {
  const query = searchTerm.trim().toLowerCase();
  const filtered = profiles.filter((profile) => `${profile.full_name || ''} ${profile.email || ''} ${profile.role || ''}`.toLowerCase().includes(query));

  usersTableBody.innerHTML = filtered.map((profile) => {
    const displayName = profile.full_name || profile.email?.split('@')[0] || 'User';
    const isAdmin = profile.role === 'admin';
    return `<tr>
      <td><div class="table-user"><span>${escapeHtml(initialsFor(displayName))}</span><div><strong>${escapeHtml(displayName)}</strong><small>${escapeHtml(profile.email || 'No email')}</small></div></div></td>
      <td><span class="role-badge${isAdmin ? ' is-admin' : ''}">${isAdmin ? 'Administrator' : 'User'}</span></td>
      <td>${escapeHtml(formatDate(profile.created_at))}</td>
      <td>${escapeHtml(formatDate(profile.updated_at))}</td>
    </tr>`;
  }).join('');

  adminEmpty.hidden = filtered.length > 0;
}

async function loadProfiles() {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  profiles = data || [];
  totalUsers.textContent = String(profiles.length);
  const admins = profiles.filter((profile) => profile.role === 'admin').length;
  adminUsers.textContent = String(admins);
  standardUsers.textContent = String(profiles.length - admins);
  renderProfiles();
}

userSearch.addEventListener('input', () => renderProfiles(userSearch.value));
signOutButton.addEventListener('click', async () => {
  signOutButton.disabled = true;
  try {
    await window.AAKAuth.signOut(supabaseClient);
  } catch (error) {
    adminStatus.textContent = error.message || 'Could not sign out.';
    adminStatus.className = 'auth-status is-error';
    signOutButton.disabled = false;
  }
});

(async function initializeAdmin() {
  try {
    supabaseClient = await window.AAKAuth.getClient();
    const user = await window.AAKAuth.getCurrentUser(supabaseClient);
    if (!user) {
      window.AAKAuth.redirectToLogin('/admin.html');
      return;
    }

    const profile = await window.AAKAuth.getProfile(supabaseClient, user.id);
    if (profile?.role !== 'admin') {
      window.location.replace('dashboard.html?error=admin-access-required');
      return;
    }

    const displayName = profile.full_name || 'Administrator';
    adminName.textContent = displayName;
    adminEmail.textContent = profile.email || user.email || '—';
    adminInitials.textContent = initialsFor(displayName);
    await loadProfiles();
    authGuard.hidden = true;
    protectedContent.hidden = false;
  } catch (error) {
    showGuardError('Admin access unavailable', error.message || 'Unable to verify administrator access.');
  }
})();
