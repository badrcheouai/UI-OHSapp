"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

export default function DebugPage() {
  const { user, accessToken, loading } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [apiTest, setApiTest] = useState<any>(null)
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    if (accessToken) {
      try {
        // Decode the JWT token to see its contents
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        setTokenInfo(payload)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }, [accessToken])

  const testApiCall = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/v1/admin/keycloak/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      const result: any = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      }
      
      if (response.ok) {
        result.data = await response.json()
      } else {
        result.error = await response.text()
      }
      
      setApiTest(result)
    } catch (error) {
      setApiTest({ error: (error as Error).message })
    }
  }

  const runDiagnostics = async () => {
    const diag = {
      keycloakRunning: false,
      backendRunning: false,
      adminUserExists: false,
      adminRoleExists: false,
      backendConfig: null,
    }

    try {
      // Test Keycloak
      const keycloakResponse = await fetch('http://localhost:8080/realms/oshapp/.well-known/openid_configuration')
      diag.keycloakRunning = keycloakResponse.ok
    } catch (error) {
      console.error("Keycloak not accessible:", error)
    }

    try {
      // Test Backend
      const backendResponse = await fetch('http://localhost:8081/api/v1/admin/keycloak/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      diag.backendRunning = backendResponse.status !== 0
    } catch (error) {
      console.error("Backend not accessible:", error)
    }

    setDiagnostics(diag)
  }

  const testAdminAuth = async () => {
    try {
      const response = await fetch('/api/v1/admin/test-auth', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      const result = await response.json()
      setDebugInfo((prev: any) => ({
        ...prev,
        adminAuthTest: result
      }))
    } catch (error: any) {
      setDebugInfo((prev: any) => ({
        ...prev,
        adminAuthTest: { error: error.message }
      }))
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Information</h1>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>500 Error Diagnosis:</strong> The backend is failing to authenticate with Keycloak admin credentials. 
          This is likely due to a mismatch between the backend configuration and the actual Keycloak realm setup.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Current user details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Username:</strong> {user?.username || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Roles:</strong></p>
            <div className="flex gap-2">
              {user?.roles?.map((role: string) => (
                <Badge key={role} variant={role === 'ADMIN' ? 'default' : 'secondary'}>
                  {role}
                </Badge>
              )) || 'No roles'}
            </div>
            <p><strong>Has ADMIN role:</strong> {user?.roles?.includes('ADMIN') ? '✅ Yes' : '❌ No'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
          <CardDescription>JWT token details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Token exists:</strong> {accessToken ? 'Yes' : 'No'}</p>
            {tokenInfo && (
              <div>
                <p><strong>Token payload:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(tokenInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
          <CardDescription>Test the admin API endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testApiCall} className="mb-4">
            Test Admin API
          </Button>
          {apiTest && (
            <div>
              <p><strong>API Response:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Diagnostics</CardTitle>
          <CardDescription>Check system components</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} className="mb-4">
            Run Diagnostics
          </Button>
          {Object.keys(diagnostics).length > 0 && (
            <div className="space-y-2">
              <p><strong>Keycloak Running:</strong> {diagnostics.keycloakRunning ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Backend Running:</strong> {diagnostics.backendRunning ? '✅ Yes' : '❌ No'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Authentication Test</CardTitle>
          <CardDescription>Test the admin authentication endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testAdminAuth} className="mb-4">
            Test Admin Authentication
          </Button>
          {debugInfo.adminAuthTest && (
            <div>
              <p><strong>Admin Authentication Test Response:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.adminAuthTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solutions</CardTitle>
          <CardDescription>Steps to fix the 500 error</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Option 1: Fix Backend Configuration</h4>
              <p className="text-sm text-gray-600">
                The backend is configured to use admin/admin, but the Keycloak realm might have admin/password.
                Check the application.yaml file in the backend and update the admin password.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Option 2: Import Correct Realm</h4>
              <p className="text-sm text-gray-600">
                Import the correct realm configuration into Keycloak that matches the backend configuration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Option 3: Login as Admin</h4>
              <p className="text-sm text-gray-600">
                Make sure you're logged in as the admin user with the ADMIN role to access admin features.
              </p>
            </div>

            {!user?.roles?.includes('ADMIN') && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Admin Login Required:</strong> You need to login as admin to access admin features.
                  <br />
                  <strong>Credentials:</strong> admin / password (or admin / admin depending on realm configuration)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 