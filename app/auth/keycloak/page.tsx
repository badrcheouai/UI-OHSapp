"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import keycloak, { initKeycloak } from "@/lib/keycloak"

export default function KeycloakPage() {
    const router = useRouter()

    useEffect(() => {
        initKeycloak()
            .then(() => {
                if (!keycloak.authenticated) {
                    keycloak.login()
                    return
                }

                const roles = keycloak.tokenParsed?.realm_access?.roles || []

                if (roles.includes("ADMIN")) router.push("/dashboard")
                else if (roles.includes("RESP_RH")) router.push("/employees")
                else if (roles.includes("INFIRMIER_ST")) router.push("/safety")
                else if (roles.includes("MEDECIN_TRAVAIL")) router.push("/reports")
                else if (roles.includes("RESP_HSE")) router.push("/incidents")
                else if (roles.includes("SALARIE")) router.push("/profile")
                else router.push("/403")
            })
            .catch((err) => {
                console.error("Keycloak init error", err)
            })
    }, [router])

    return (
        <div className="flex justify-center items-center h-screen text-xl font-medium">
            Authentification via Keycloak...
        </div>
    )
}
