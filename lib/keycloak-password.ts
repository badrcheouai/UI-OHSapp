// Utility to change a user's password in Keycloak via admin REST API
export async function changeUserPassword({
  keycloakBaseUrl = "http://localhost:8080",
  adminUsername = "admin",
  adminPassword = "admin",
  realm = "oshapp",
  userId,      // UUID
  username,    // Keycloak username
  newPassword,
  currentPassword,
}: {
  keycloakBaseUrl?: string;
  adminUsername?: string;
  adminPassword?: string;
  realm?: string;
  userId: string;
  username: string;
  newPassword: string;
  currentPassword?: string;
}) {
  // 1. Verify current password by logging in as the user (username)
  if (currentPassword) {
    const verifyRes = await fetch(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "oshapp-frontend",
        username,
        password: currentPassword,
        grant_type: "password",
      }),
    });
    if (!verifyRes.ok) {
      throw new Error("Le mot de passe actuel est incorrect.");
    }
  }
  const tokenRes = await fetch(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "admin-cli",
      username: adminUsername,
      password: adminPassword,
      grant_type: "password",
    }),
  });
  if (!tokenRes.ok) throw new Error("Failed to get admin token");
  const { access_token: adminToken } = await tokenRes.json();

  // 3. Call reset-password endpoint
  const res = await fetch(
    `${keycloakBaseUrl}/admin/realms/${realm}/users/${userId}/reset-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        type: "password",
        value: newPassword,
        temporary: false,
      }),
    }
  );
  if (!res.ok) throw new Error("Password change failed");
  return true;
}
