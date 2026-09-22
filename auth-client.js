'use strict';

(function createAuthHelpers() {
  let clientPromise;

  async function loadConfig() {
    const response = await fetch('/api/auth/config', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load authentication configuration.');

    const config = await response.json();
    if (!config.configured) {
      const error = new Error('Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to your environment.');
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }

    return config;
  }

  function getClient() {
    if (!clientPromise) {
      clientPromise = loadConfig().then((config) => {
        if (!window.supabase?.createClient) throw new Error('The Supabase client library could not be loaded.');

        return window.supabase.createClient(config.url, config.publishableKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        });
      });
    }

    return clientPromise;
  }

  async function getCurrentUser(client) {
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function getProfile(client, userId) {
    const { data, error } = await client
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  function redirectToLogin(destination = window.location.pathname) {
    const redirect = encodeURIComponent(destination);
    window.location.replace(`login.html?redirect=${redirect}`);
  }

  async function signOut(client) {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    window.location.replace('login.html');
  }

  window.AAKAuth = {
    getClient,
    getCurrentUser,
    getProfile,
    redirectToLogin,
    signOut,
  };
})();
