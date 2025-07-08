export async function loginWithCredentials(username: string, password: string) {
    const body = new URLSearchParams()
    body.append("grant_type", "password")
    body.append("client_id", "oshapp-frontend")
    body.append("username", username)
    body.append("password", password)

    const response = await fetch("http://localhost:8080/realms/oshapp/protocol/openid-connect/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error_description || "Login failed")
    }

    return response.json() // contains access_token, refresh_token
}
