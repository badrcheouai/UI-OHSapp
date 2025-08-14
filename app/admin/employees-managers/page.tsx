"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Shield, Search, RefreshCw } from "lucide-react"

type Employee = {
  id: number
  firstName: string
  lastName: string
  department?: string
  position?: string
  manager1Id?: number | null
  manager2Id?: number | null
}

export default function EmployeesManagersPage() {
  const { user } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const [editOpen, setEditOpen] = useState(false)
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null)
  const [manager1Id, setManager1Id] = useState<string>("")
  const [manager2Id, setManager2Id] = useState<string>("")

  useEffect(() => {
    if (user && !user.roles?.includes("ADMIN")) {
      router.replace("/dashboard")
    }
  }, [user, router])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const stored = localStorage.getItem('oshapp_tokens')
      const headers: Record<string,string> = { 'Content-Type': 'application/json' }
      if (stored) { try { const p = JSON.parse(stored); if (p.access_token) headers['Authorization'] = `Bearer ${p.access_token}` } catch {} }
      const res = await fetch(`${base}/api/v1/admin/employees`, { headers })
      const data = await res.json()
      setEmployees(data)
    } catch {
      setEmployees([])
    } finally { setLoading(false) }
  }

  useEffect(() => { if (user?.roles?.includes("ADMIN")) loadEmployees() }, [user])

  const filtered = useMemo(() => {
    return employees.filter(e => (
      !search || (`${e.firstName} ${e.lastName} ${e.department||''} ${e.position||''}`).toLowerCase().includes(search.toLowerCase())
    ))
  }, [employees, search])

  const saveManagers = async () => {
    if (!targetEmployee) return
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const stored = localStorage.getItem('oshapp_tokens')
      const headers: Record<string,string> = { 'Content-Type': 'application/json' }
      if (stored) { try { const p = JSON.parse(stored); if (p.access_token) headers['Authorization'] = `Bearer ${p.access_token}` } catch {} }
      const body = {
        manager1Id: manager1Id ? parseInt(manager1Id) : null,
        manager2Id: manager2Id ? parseInt(manager2Id) : null,
      }
      const res = await fetch(`${base}/api/v1/admin/employees/${targetEmployee.id}/managers`, {
        method: 'PUT', headers, body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error(await res.text())
      setEditOpen(false)
      await loadEmployees()
    } catch (e) {
      console.error(e)
    }
  }

  if (!user?.roles?.includes("ADMIN")) return null

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" style={{ color: themeColors.colors.primary[600] }} />
          <h1 className="text-2xl font-bold">Gestion des N+1 / N+2</h1>
        </div>
        <Button variant="outline" onClick={loadEmployees} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Actualiser
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder="Rechercher par nom, département, poste" value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employés</CardTitle>
          <CardDescription>Assignez les managers N+1 et N+2 à chaque salarié.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>N+1</TableHead>
                <TableHead>N+2</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(emp => {
                const m1 = emp.manager1Id ? employees.find(e => e.id === emp.manager1Id) : undefined
                const m2 = emp.manager2Id ? employees.find(e => e.id === emp.manager2Id) : undefined
                return (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    <TableCell>{m1 ? `${m1.firstName} ${m1.lastName}` : '-'}</TableCell>
                    <TableCell>{m2 ? `${m2.firstName} ${m2.lastName}` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => {
                        setTargetEmployee(emp)
                        setManager1Id(emp.manager1Id ? String(emp.manager1Id) : "")
                        setManager2Id(emp.manager2Id ? String(emp.manager2Id) : "")
                        setEditOpen(true)
                      }}>
                        <Shield className="h-4 w-4 mr-2" />Définir
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Définir N+1 / N+2</DialogTitle>
            <DialogDescription>{targetEmployee ? `${targetEmployee.firstName} ${targetEmployee.lastName}` : ''}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">N+1</Label>
              <Select value={manager1Id} onValueChange={setManager1Id}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName} ({e.department||'-'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">N+2</Label>
              <Select value={manager2Id} onValueChange={setManager2Id}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName} ({e.department||'-'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setEditOpen(false)}>Annuler</Button>
            <Button onClick={saveManagers} className="text-white" style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


