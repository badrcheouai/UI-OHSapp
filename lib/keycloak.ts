import Keycloak from "keycloak-js"

const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "oshapp",
    clientId: "oshapp-frontend",
})

let initialized = false

export const initKeycloak = async () => {
    if (!initialized) {
        initialized = true
        return keycloak.init({ onLoad: "login-required" }) // 👈 RETURN this promise
    }
    return Promise.resolve(keycloak.authenticated)
}

export default keycloak
