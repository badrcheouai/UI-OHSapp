"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestAdminPage() {
  const { user, accessToken, loading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)

  const testAdminAPI = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/v1/admin/keycloak/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      }
      
      if (response.ok) {
        result.data = await response.json()
      } else {
        result.error = await response.text()
      }
      
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error.message })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Check if you're logged in as admin</CardDescription>
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
          <CardTitle>Admin API Test</CardTitle>
          <CardDescription>Test the admin API endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testAdminAPI} className="mb-4">
            Test Admin API
          </Button>
          {testResult && (
            <div>
              <p><strong>API Response:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {!user?.roles?.includes('ADMIN') && (
        <Card>
          <CardHeader>
            <CardTitle>Login as Admin</CardTitle>
            <CardDescription>You need to login as admin to access admin features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Admin credentials:</strong></p>
              <p>Username: <code>admin</code></p>
              <p>Password: <code>admin</code></p>
              <p>Email: <code>admin@example.com</code></p>
              <Button onClick={() => window.location.href = '/login'} className="mt-2">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 