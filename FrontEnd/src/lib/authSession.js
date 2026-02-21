const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_ID_KEY = "userId";
const AUTH_EXPIRES_AT_KEY = "authExpiresAt";

const SESSION_TTL_MS = 5 * 60 * 60 * 1000;

const removeLegacyLocalAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
};

export const clearAuthSession = () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_ID_KEY);
  sessionStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  removeLegacyLocalAuth();
};

export const storeAuthSession = ({ token, userId }) => {
  if (!token || !userId) {
    clearAuthSession();
    return null;
  }

  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessionStorage.setItem(AUTH_TOKEN_KEY, String(token));
  sessionStorage.setItem(AUTH_USER_ID_KEY, String(userId));
  sessionStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));

  // Keep auth in one place so browser tab close ends the session.
  removeLegacyLocalAuth();

  return { token: String(token), userId: String(userId), expiresAt };
};

const migrateLegacyLocalAuthIfNeeded = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userId = localStorage.getItem(AUTH_USER_ID_KEY);
  if (!token || !userId) return false;
  storeAuthSession({ token, userId });
  return true;
};

export const getAuthSession = () => {
  let token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  let userId = sessionStorage.getItem(AUTH_USER_ID_KEY);
  let expiresAt = Number(sessionStorage.getItem(AUTH_EXPIRES_AT_KEY));

  if (!token || !userId || !Number.isFinite(expiresAt)) {
    const migrated = migrateLegacyLocalAuthIfNeeded();
    if (!migrated) {
      clearAuthSession();
      return null;
    }
    token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    userId = sessionStorage.getItem(AUTH_USER_ID_KEY);
    expiresAt = Number(sessionStorage.getItem(AUTH_EXPIRES_AT_KEY));
  }

  if (!token || !userId || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    clearAuthSession();
    return null;
  }

  return { token, userId, expiresAt };
};

export const getAuthToken = () => getAuthSession()?.token || "";
export const getUserId = () => getAuthSession()?.userId || "";

export const getAuthRemainingMs = () => {
  const session = getAuthSession();
  if (!session) return 0;
  return Math.max(0, session.expiresAt - Date.now());
};
