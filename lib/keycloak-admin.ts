import keycloak from './keycloak'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

export interface KeycloakUser {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  enabled: boolean
  emailVerified: boolean
  realmRoles?: string[]
  groups?: string[]
  createdTimestamp?: number
  lastLoginTimestamp?: number
}

export interface KeycloakRole {
  id: string
  name: string
  description?: string
  composite?: boolean
  clientRole?: boolean
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  disabledUsers: number
  pendingVerification: number
  totalRoles: number
  recentLogins: number
}

class KeycloakAdminService {
  private async getAdminToken(): Promise<string> {
    // Try to get token from localStorage first (for classic login)
    const stored = localStorage.getItem("oshapp_tokens")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.access_token) {
          return parsed.access_token
        }
      } catch (e) {
        // If parsing fails, continue to Keycloak
      }
    }

    // Try to get token from Keycloak instance
    if (keycloak.token) {
      return keycloak.token
    }

    // Wait for token to be available (up to 5 seconds)
    const startTime = Date.now()
    const maxWaitTime = 5000 // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      // Check localStorage again
      const stored = localStorage.getItem("oshapp_tokens")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.access_token) {
            return parsed.access_token
          }
        } catch (e) {
          // Continue waiting
        }
      }

      // Check Keycloak instance
      if (keycloak.token) {
        return keycloak.token
      }

      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    throw new Error("No authentication token available after waiting")
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAdminToken()
    
    // Use the improved backend endpoint that has better authentication handling
    // For user operations, use the keycloak proxy endpoint which handles UUIDs correctly
    const baseUrl = endpoint.startsWith('/users') 
      ? `${API_BASE_URL}/api/v1/admin/keycloak${endpoint}`
      : `${API_BASE_URL}/api/v1/admin/keycloak${endpoint}`
    
    const response = await fetch(baseUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status} ${response.statusText}`, errorText)
      
      // If it's a 500 error, it might be a backend admin authentication issue
      if (response.status === 500) {
        console.warn("Backend admin authentication failed. This might be due to incorrect admin credentials in the backend configuration.")
        console.warn("Please check that the admin user exists in Keycloak with the correct password.")
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    const text = await response.text()
    return text ? JSON.parse(text) : null
  }

  async getUsers(search?: string, first?: number, max?: number): Promise<KeycloakUser[]> {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (first) params.append('first', first.toString())
      if (max) params.append('max', max.toString())
      return this.makeRequest(`/users?${params.toString()}`)
    } catch (error) {
      console.error("Error fetching users:", error)
      
      // Fallback: try direct Keycloak admin API
      try {
        console.log("Trying direct Keycloak admin API as fallback...")
        return await this.getUsersDirect(search, first, max)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        // Return empty array instead of throwing
        return []
      }
    }
  }

  // Direct Keycloak admin API call as fallback
  private async getUsersDirect(search?: string, first?: number, max?: number): Promise<KeycloakUser[]> {
    const token = await this.getAdminToken()
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (first) params.append('first', first.toString())
    if (max) params.append('max', max.toString())
    
    const response = await fetch(`http://localhost:8080/admin/realms/oshapp/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Direct Keycloak API error: ${response.status}`)
    }
    
    const users = await response.json()
    
    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user: any) => {
        try {
          const rolesResponse = await fetch(`http://localhost:8080/admin/realms/oshapp/users/${user.id}/role-mappings/realm`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          
          let realmRoles: string[] = []
          if (rolesResponse.ok) {
            const roles = await rolesResponse.json()
            realmRoles = roles.map((role: any) => role.name)
          }
          
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            enabled: user.enabled,
            emailVerified: user.emailVerified,
            realmRoles,
            createdTimestamp: user.createdTimestamp,
            lastLoginTimestamp: user.lastLoginTimestamp,
          }
        } catch (error) {
          console.error(`Error fetching roles for user ${user.id}:`, error)
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            enabled: user.enabled,
            emailVerified: user.emailVerified,
            realmRoles: [],
            createdTimestamp: user.createdTimestamp,
            lastLoginTimestamp: user.lastLoginTimestamp,
          }
        }
      })
    )
    
    return usersWithRoles
  }

  async getUserById(userId: string): Promise<KeycloakUser | null> {
    try {
      return this.makeRequest(`/users/${userId}`)
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }

  async createUser(userData: Partial<KeycloakUser>): Promise<void> {
    try {
      await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUser(userId: string, userData: Partial<KeycloakUser>): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/complete/${userId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  async resetPassword(userId: string, newPassword: string, temporary: boolean = true): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({
          type: 'password',
          value: newPassword,
          temporary,
        }),
      })
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  async resetUserPassword(userId: string): Promise<void> {
    try {
      // Send password reset email
      await this.makeRequest(`/users/${userId}/execute-actions-email`, {
        method: 'PUT',
        body: JSON.stringify({ 
          actions: ['UPDATE_PASSWORD'] 
        }),
      })
    } catch (error) {
      console.error("Error sending password reset email:", error)
      throw error
    }
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/send-verify-email`, {
        method: 'PUT',
      })
    } catch (error) {
      console.error("Error sending verification email:", error)
      throw error
    }
  }

  async executeActionsEmail(userId: string, actions: string[]): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/execute-actions-email`, {
        method: 'PUT',
        body: JSON.stringify({ actions }),
      })
    } catch (error) {
      console.error("Error executing actions email:", error)
      throw error
    }
  }

  async getRoles(): Promise<KeycloakRole[]> {
    try {
      return this.makeRequest('/roles')
    } catch (error) {
      console.error("Error fetching roles:", error)
      return []
    }
  }

  async getRealmRoles(): Promise<KeycloakRole[]> {
    try {
      return this.makeRequest('/roles')
    } catch (error) {
      console.error("Error fetching realm roles:", error)
      return []
    }
  }

  async getUserRoles(userId: string): Promise<KeycloakRole[]> {
    try {
      return this.makeRequest(`/users/${userId}/role-mappings/realm`)
    } catch (error) {
      console.error("Error fetching user roles:", error)
      return []
    }
  }

  async assignRolesToUser(userId: string, roles: KeycloakRole[]): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/role-mappings/realm`, {
        method: 'POST',
        body: JSON.stringify(roles),
      })
    } catch (error) {
      console.error("Error assigning roles to user:", error)
      throw error
    }
  }

  async removeRolesFromUser(userId: string, roles: KeycloakRole[]): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/role-mappings/realm`, {
        method: 'DELETE',
        body: JSON.stringify(roles),
      })
    } catch (error) {
      console.error("Error removing roles from user:", error)
      throw error
    }
  }

  async getStats(): Promise<AdminStats> {
    try {
      const stats = await this.makeRequest('/stats')
      return {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        disabledUsers: stats.disabledUsers || 0,
        pendingVerification: stats.pendingVerification || 0,
        totalRoles: stats.totalRoles || 0,
        recentLogins: stats.recentLogins || 0,
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Return default stats instead of throwing
      return {
        totalUsers: 0,
        activeUsers: 0,
        disabledUsers: 0,
        pendingVerification: 0,
        totalRoles: 0,
        recentLogins: 0,
      }
    }
  }

  async getGroups(): Promise<any[]> {
    try {
      return this.makeRequest('/groups')
    } catch (error) {
      console.error("Error fetching groups:", error)
      return []
    }
  }

  async getUserGroups(userId: string): Promise<any[]> {
    try {
      return this.makeRequest(`/users/${userId}/groups`)
    } catch (error) {
      console.error("Error fetching user groups:", error)
      return []
    }
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/groups/${groupId}`, {
        method: 'PUT',
      })
    } catch (error) {
      console.error("Error adding user to group:", error)
      throw error
    }
  }

  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/groups/${groupId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error("Error removing user from group:", error)
      throw error
    }
  }

  async getUserSessions(userId: string): Promise<any[]> {
    try {
      return this.makeRequest(`/users/${userId}/sessions`)
    } catch (error) {
      console.error("Error fetching user sessions:", error)
      return []
    }
  }

  async logoutUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/logout`, {
        method: 'POST',
      })
    } catch (error) {
      console.error("Error logging out user:", error)
      throw error
    }
  }

  async getClients(): Promise<any[]> {
    try {
      return this.makeRequest('/clients')
    } catch (error) {
      console.error("Error fetching clients:", error)
      return []
    }
  }

  async getClientRoles(clientId: string): Promise<KeycloakRole[]> {
    try {
      return this.makeRequest(`/clients/${clientId}/roles`)
    } catch (error) {
      console.error("Error fetching client roles:", error)
      return []
    }
  }

  async getUserClientRoles(userId: string, clientId: string): Promise<KeycloakRole[]> {
    try {
      return this.makeRequest(`/users/${userId}/role-mappings/clients/${clientId}`)
    } catch (error) {
      console.error("Error fetching user client roles:", error)
      return []
    }
  }

  async searchUsers(query: string): Promise<KeycloakUser[]> {
    try {
      return this.getUsers(query)
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  }

  async getUsersByRole(roleName: string): Promise<KeycloakUser[]> {
    try {
      return this.makeRequest(`/roles/${roleName}/users`)
    } catch (error) {
      console.error("Error fetching users by role:", error)
      return []
    }
  }

  async countUsers(): Promise<number> {
    try {
      const response = await this.makeRequest('/users/count')
      return response
    } catch (error) {
      console.error("Error counting users:", error)
      return 0
    }
  }
}

export const keycloakAdmin = new KeycloakAdminService() 