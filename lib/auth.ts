const KC_REALM      = "oshapp"
const KC_BASE       = "http://localhost:8080/realms/" + KC_REALM
const TOKEN_URL     = KC_BASE + "/protocol/openid-connect/token"
const LOGOUT_URL    = KC_BASE + "/protocol/openid-connect/logout"
const CLIENT_ID     = "oshapp-frontend"

type Tokens = {
    access_token:  string
    refresh_token: string
    expires_in:    number  // seconds
}

const STORE_KEY = "oshapp_tokens"

// ---------- localStorage helpers ----------
export function saveTokens(tok: Tokens) {
    localStorage.setItem(STORE_KEY, JSON.stringify(tok))
}
export function loadTokens(): Tokens | null {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as Tokens) : null
}
export function clearTokens() {
    localStorage.removeItem(STORE_KEY)
}

// ---------- credential login ----------
export async function loginWithCredentials(username: string, password: string) {
    const body = new URLSearchParams({
        grant_type: "password",
        client_id:  CLIENT_ID,
        username,
        password,
        scope: "openid profile email",   // Remove 'roles' from scope as it's not a standard scope
    })

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error_description ?? "Login failed")
    }

    const tok = (await res.json()) as Tokens
    saveTokens(tok)
    return tok
}

// ---------- refresh ----------
export async function refreshToken(cur: Tokens) {
    const body = new URLSearchParams({
        grant_type:    "refresh_token",
        client_id:     CLIENT_ID,
        refresh_token: cur.refresh_token,
    })

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    })

    if (!res.ok) throw new Error("Refresh failed")

    const tok = (await res.json()) as Tokens
    saveTokens(tok)
    return tok
}

// ---------- logout ----------
export function logout() {
    const t = loadTokens()
    clearTokens()

    // Remove OAuth code/state from URL if present
    if (typeof window !== 'undefined' && window.history.replaceState) {
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        window.history.replaceState({}, document.title, url.pathname + url.search)
    }

    // fire-and-forget back-channel logout (ignore CORS)
    if (t?.refresh_token) {
        fetch(LOGOUT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id:     CLIENT_ID,
                refresh_token: t.refresh_token,
            }),
            mode: "no-cors",
        }).catch(() => {})
    }
}
