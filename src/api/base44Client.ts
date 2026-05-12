// API Client - Replacement for Base44 SDK
// Maintains the same interface so all existing components work without changes

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiCall(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const error = new Error(err.message || 'API Error');
    error.status = res.status;
    error.data = err;
    throw error;
  }

  return res.json();
}

function buildQuery(params = {}) {
  const filtered = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value;
    }
  }
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : '';
}

function createEntity(name) {
  const endpoint = `${API_BASE}/${name}`;

  return {
    // list(sort, limit) - matches base44.entities.X.list('-created_date', 200)
    list(sort, limit) {
      return apiCall(`${endpoint}${buildQuery({ sort, limit })}`);
    },

    // filter(query, sort, limit) - matches base44.entities.X.filter({ field: value }, '-created_date', 50)
    filter(query = {}, sort, limit) {
      return apiCall(`${endpoint}${buildQuery({ ...query, sort, limit })}`);
    },

    // create(data) - matches base44.entities.X.create({ ... })
    create(data) {
      return apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // update(id, data) - matches base44.entities.X.update(id, { ... })
    update(id, data) {
      return apiCall(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // delete(id) - matches base44.entities.X.delete(id)
    delete(id) {
      return apiCall(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export const base44 = {
  entities: {
    Product: createEntity('products'),
    Order: createEntity('orders'),
    Favorite: createEntity('favorites'),
    Review: createEntity('reviews'),
    Notification: createEntity('notifications'),
  },

  auth: {
    // me() - returns current user info or throws if not authenticated
    me() {
      return apiCall(`${API_BASE}/auth/me`);
    },

    // login(email, password) - authenticates and stores token
    async login(email, password) {
      const result = await apiCall(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result; // Might return { requiresVerification: true }
    },

    // register(name, email, password) - creates account
    async register(name, email, password) {
      const result = await apiCall(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result; // Returns { requiresVerification: true }
    },

    // verify(email, code) - verifies account and stores token
    async verify(email, code) {
      const result = await apiCall(`${API_BASE}/auth/verify`, {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result;
    },

    // logout(redirectUrl) - clears token and redirects to login
    logout(redirectUrl) {
      localStorage.removeItem('auth_token');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/login';
      }
    },

    // redirectToLogin(returnUrl) - redirects to login page
    redirectToLogin(returnUrl) {
      if (returnUrl) {
        localStorage.setItem('auth_return_url', returnUrl);
      }
      window.location.href = '/login';
    },
  },

  functions: {
    // invoke(name, data) - matches base44.functions.invoke('createCheckout', { ... })
    invoke(name, data) {
      return apiCall(`${API_BASE}/checkout`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
