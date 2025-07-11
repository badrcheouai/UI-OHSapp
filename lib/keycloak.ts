import Keycloak from "keycloak-js";

// Vite HMR guard
if (typeof import.meta !== 'undefined' && (import.meta as any).hot) (import.meta as any).hot.decline();

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "oshapp",
  clientId: "oshapp-frontend",
});

let wasInit = false;

/**
 * Call once, returns true when user is authenticated
 * Ensures singleton init, sessionStorage for tokens, and code/state stripping
 */
export async function initKC() {
  if (wasInit) return keycloak.authenticated ?? false;
  wasInit = true;
  await keycloak.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    token: sessionStorage.kc_t ?? undefined,
    refreshToken: sessionStorage.kc_r ?? undefined,
  });
  if (keycloak.authenticated) {
    sessionStorage.kc_t = keycloak.token!;
    sessionStorage.kc_r = keycloak.refreshToken!;
    const u = new URL(location.href);
    const hadCode = u.searchParams.has('code');
    const hadState = u.searchParams.has('state');
    if (hadCode) u.searchParams.delete('code');
    if (hadState) u.searchParams.delete('state');
    if (hadCode || hadState) {
      history.replaceState({}, '', u.pathname + u.search);
    }
  }
  return keycloak.authenticated ?? false;
}

// Guarded refresh interval
setInterval(async () => {
  if (!keycloak.authenticated) return;
  try {
    await keycloak.updateToken(30);
    sessionStorage.kc_t = keycloak.token!;
    sessionStorage.kc_r = keycloak.refreshToken!;
  } catch {
    keycloak.login();
  }
}, 60_000);

export default keycloak;
