"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import { EnhancedTimePicker } from "@/components/enhanced-time-picker"
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function ManagerVisitesPage() {
  const { user, loading } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()

  const [requests, setRequests] = useState<MedicalVisitRequest[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MedicalVisitRequest | null>(null)
  const [proposeDate, setProposeDate] = useState<Date | null>(null)
  const [proposeTime, setProposeTime] = useState("")
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const isManager = !!user && (user.roles.includes('ADMIN') || user.roles.includes('RH') || user.roles.includes('RESP_RH') || user.roles.includes('SALARIE'))
  if (loading) return null
  if (!isManager) return null

  const load = async () => {
    try {
      // For now, fetch all and filter on client by team; backend endpoint can be added later
      const res = await medicalVisitAPI.getAllRequests()
      const all = res.data
      // Filter: show requests that belong to employees where current user is manager1/manager2 when info is present (requires admin employees endpoint to map). For now, show PROPOSED ones to allow re-propose.
      setRequests(all.filter(r => r.status === 'PROPOSED'))
    } catch {
      setRequests([])
    }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => requests.filter(r => !search || (r.employeeName || '').toLowerCase().includes(search.toLowerCase())), [requests, search])

  const submitProposal = async () => {
    if (!selected || !proposeDate || !proposeTime) return
    setProcessing(true)
    try {
      await medicalVisitAPI.proposeSlot(selected.id, {
        proposedDate: proposeDate.toISOString().split('T')[0],
        proposedTime: proposeTime,
        reason: reason || 'Proposition manager',
        proposedBy: user?.username || user?.email || 'manager'
      })
      setSelected(null)
      setProposeDate(null)
      setProposeTime("")
      setReason("")
      await load()
    } finally { setProcessing(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      <DashboardNavigation userRole={user!.roles[0]} currentPage="demande-visite-medicale" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" style={{ color: themeColors.colors.primary[600] }} />
            <h1 className="text-2xl font-bold">Mes équipes – re-proposition de créneaux</h1>
          </div>
          <Input placeholder="Rechercher…" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-64" />
        </div>

        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-sm">
              <CardContent className="p-4 md:p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.employeeName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Proposé: {r.proposedDate && r.proposedTime ? `${format(new Date(r.proposedDate), 'dd/MM/yyyy', { locale: fr })} à ${r.proposedTime}` : '-'}</div>
                </div>
                <Button onClick={() => setSelected(r)} variant="outline" className="border-slate-300 dark:border-slate-600">Proposer un autre créneau</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Proposal dialog */}
      <div className={selected ? '' : 'hidden'}>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Proposer un créneau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nouvelle date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !proposeDate && 'text-slate-500') }>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {proposeDate ? format(proposeDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <EnhancedCalendar selectedDate={proposeDate} onDateSelect={setProposeDate} minDate={new Date()} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Nouvelle heure</Label>
                <EnhancedTimePicker selectedTime={proposeTime} onTimeSelect={setProposeTime} minTime="08:00" maxTime="18:00" interval={30} />
              </div>
              <div>
                <Label>Message (optionnel)</Label>
                <Textarea value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Ex: contraintes opérationnelles…" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={()=>setSelected(null)}>Annuler</Button>
                <Button onClick={submitProposal} disabled={processing || !proposeDate || !proposeTime} className="text-white" style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}>Envoyer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


