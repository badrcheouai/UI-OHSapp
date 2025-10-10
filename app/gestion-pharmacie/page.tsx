"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { useTheme } from "@/contexts/ThemeContext"
import { pharmacyAPI, PharmacyItem } from "@/lib/api"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pill, Package, Shield, ShoppingCart, FileText, Truck, Receipt, Upload, Download, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { pharmacyOrderAPI, CreatePharmacyNeed, PharmacyNeed, PharmacyQuote, PharmacyOrder, PharmacyDelivery } from "@/lib/api"
import * as XLSX from 'xlsx';

export default function GestionPharmaciePage() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const { themeColors } = useTheme()

	useEffect(() => {
		if (!loading) {
			if (!user) router.replace("/login")
			else if (!user.roles?.includes("INFIRMIER_ST")) router.replace("/403")
		}
	}, [user, loading, router])

	if (loading || !user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div
					className="animate-spin rounded-full h-16 w-16 border-b-2"
					style={{ borderColor: themeColors.colors.primary[600] }}
				/>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
			<DashboardNavigation userRole={user.roles[0]} currentPage="gestion-pharmacie" />
			<PharmacyManagement />
		</div>
	)
} 

function PharmacyManagement() {
  const { themeColors } = useTheme()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Gestion de pharmacie</h1>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Stock
          </TabsTrigger>
          <TabsTrigger value="commandes" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Commandes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <PharmacyInventory />
        </TabsContent>
        
        <TabsContent value="commandes">
          <OrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PharmacyInventory() {
  const { themeColors } = useTheme()
  const [items, setItems] = useState<PharmacyItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [open, setOpen] = useState<boolean>(false)
  const [editing, setEditing] = useState<PharmacyItem | null>(null)
  const [deleting, setDeleting] = useState<PharmacyItem | null>(null)
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    pharmacyAPI.getAll()
      .then(res => { if (isMounted) { setItems(res.data); setError(null) } })
      .catch(err => { if (isMounted) setError(err?.message || 'Erreur de chargement') })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const grouped = useMemo(() => {
    const result: Record<string, PharmacyItem[]> = { MEDICAMENT: [], PARAPHARMACEUTIQUE: [], MATERIEL_SST: [] }
    if (items) {
      for (const it of items) {
        if (!result[it.category]) result[it.category] = []
        result[it.category].push(it)
      }
      for (const key of Object.keys(result)) {
        result[key] = result[key].sort((a, b) => a.name.localeCompare(b.name))
      }
    }
    return result
  }, [items])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderColor: themeColors.colors.primary[600] }} />
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestion du stock</h2>
        <Badge className="ml-2" style={{ background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})` }}>{items?.length ?? 0} articles</Badge>
        <div className="ml-auto">
          <Button
            onClick={() => { setEditing(null); setOpen(true) }}
            className="hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:-translate-y-1 px-6 py-3 text-lg font-semibold text-white shadow-2xl btn-premium"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`
            }}
          >
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Centered Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input 
            placeholder="Rechercher un produit..." 
            value={query} 
            onChange={async (e) => {
              const q = e.target.value
              setQuery(q)
              try {
                if (q.trim().length === 0) {
                  const res = await pharmacyAPI.getAll()
                  setItems(res.data)
                } else {
                  const res = await pharmacyAPI.search(q)
                  setItems(res.data)
                }
              } catch {}
            }}
            className="pl-10 pr-4 py-3 text-lg border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:border-slate-400 dark:focus:border-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="MEDICAMENT" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="MEDICAMENT" className="flex items-center gap-2"><Pill className="h-4 w-4" /> Médicaments</TabsTrigger>
          <TabsTrigger value="PARAPHARMACEUTIQUE" className="flex items-center gap-2"><Package className="h-4 w-4" /> Parapharmaceutiques</TabsTrigger>
          <TabsTrigger value="MATERIEL_SST" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Matériel SST</TabsTrigger>
        </TabsList>

        <TabsContent value="MEDICAMENT">
          <InventoryTable 
            category="MEDICAMENT" 
            items={grouped.MEDICAMENT}
            onEdit={(it) => { setEditing(it); setOpen(true) }}
            onDelete={(it) => setDeleting(it)}
          />
        </TabsContent>
        <TabsContent value="PARAPHARMACEUTIQUE">
          <InventoryTable 
            category="PARAPHARMACEUTIQUE" 
            items={grouped.PARAPHARMACEUTIQUE}
            onEdit={(it) => { setEditing(it); setOpen(true) }}
            onDelete={(it) => setDeleting(it)}
          />
        </TabsContent>
        <TabsContent value="MATERIEL_SST">
          <InventoryTable 
            category="MATERIEL_SST" 
            items={grouped.MATERIEL_SST}
            onEdit={(it) => { setEditing(it); setOpen(true) }}
            onDelete={(it) => setDeleting(it)}
          />
        </TabsContent>
      </Tabs>

      <PharmacyFormDialog
        open={open}
        onOpenChange={setOpen}
        initialItem={editing}
        onSaved={async () => {
          setOpen(false)
          setEditing(null)
          setLoading(true)
          try {
            const res = await pharmacyAPI.getAll()
            setItems(res.data)
          } catch (e: any) {
            setError(e?.message || 'Erreur de rechargement')
          } finally {
            setLoading(false)
          }
        }}
      />

      <DeleteConfirmDialog
        item={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return
          try {
            await pharmacyAPI.delete(deleting.id)
            setDeleting(null)
            const res = await pharmacyAPI.getAll()
            setItems(res.data)
          } catch (e: any) {
            setError(e?.message || 'Suppression échouée')
          }
        }}
      />
    </div>
  )
}

function OrderManagement() {
  const { themeColors } = useTheme()
  const [orders, setOrders] = useState<PharmacyOrder[]>([])
  const [needs, setNeeds] = useState<PharmacyNeed[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNeed, setEditingNeed] = useState<PharmacyNeed | null>(null)
  const [formNeed, setFormNeed] = useState<CreatePharmacyNeed>({
    title: '',
    notes: '',
    items: [{ product: '', quantity: 1, notes: '' }]
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [linkNeedId, setLinkNeedId] = useState<number | undefined>(undefined)
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState<number>(0)
  const [needSearchQuery, setNeedSearchQuery] = useState<string>('')
  const [needDateFilter, setNeedDateFilter] = useState<string>('')

  useEffect(() => {
    load()
    loadNeeds()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const response = await pharmacyOrderAPI.getOrders()
      console.log('Loaded orders:', response.data.content) // Debug log
      setOrders(response.data.content || [])
    } catch (e) {
      console.error('Error loading orders:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadNeeds = async () => {
    try {
      setLoading(true)
      const response = await pharmacyOrderAPI.getAllNeeds()
      setNeeds(response.data)
    } catch (error: any) {
      console.error('Error loading needs:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNeed = async () => {
    try {
      await pharmacyOrderAPI.createNeed(formNeed)
      setFormNeed({
        title: '',
        notes: '',
        items: [{ product: '', quantity: 1, notes: '' }]
      })
      setShowForm(false)
      await loadNeeds()
      alert('Besoin ajouté')
    } catch (e) { alert('Erreur ajout besoin') }
  }

  const editNeed = (need: PharmacyNeed) => {
    setEditingNeed(need)
    setFormNeed({
      title: need.title,
      notes: need.notes,
      items: need.items.map(item => ({ ...item, id: item.id }))
    })
    setShowForm(true)
  }

  const deleteNeed = async (need: PharmacyNeed) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le besoin "${need.title}" ?`)) {
      try {
        await pharmacyOrderAPI.deleteNeed(need.id)
        await loadNeeds()
        alert('Besoin supprimé')
      } catch (error: any) {
        console.error('Error deleting need:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const viewDetails = (need: PharmacyNeed) => {
    alert(`Détails du besoin ${need.id}:\nTitre: ${need.title}\nNotes: ${need.notes}\nStatut: ${need.status}\nCrée par: ${need.createdByEmail}`)
  }

  const importInvoice = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier')
      return
    }
    if (!linkNeedId) {
      alert('Veuillez sélectionner une commande en attente à lier')
      return
    }
    if (invoiceTotalAmount <= 0) {
      alert('Veuillez entrer un montant total valide')
      return
    }

    try {
      const res = await pharmacyOrderAPI.uploadNeedInvoice(linkNeedId, selectedFile, invoiceTotalAmount)
      console.log('Invoice uploaded and need updated:', res.data)

      // Reset form
      setSelectedFile(null)
      setLinkNeedId(undefined)
      setInvoiceTotalAmount(0)
      
      // Reload needs to show updated status
      await loadNeeds()
      
      alert('Facture importée avec succès')
    } catch (e) { 
      alert('Erreur import facture') 
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const addNeedItem = () => {
    setFormNeed(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, notes: '' }]
    }))
  }

  const removeNeedItem = (index: number) => {
    setFormNeed(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateNeedItem = (index: number, field: string, value: any) => {
    setFormNeed(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleFormSubmit = async (formData: CreatePharmacyNeed) => {
    try {
      if (editingNeed) {
        // For now, we'll just update the status since the API doesn't support full updates
        await pharmacyOrderAPI.updateNeedStatus(editingNeed.id, 'ENVOYE')
      } else {
        await pharmacyOrderAPI.createNeed(formData)
      }
      setShowForm(false)
      setEditingNeed(null)
      await loadNeeds()
    } catch (error: any) {
      console.error('Error saving need:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  // Filter needs based on search query and date
  const filteredNeeds = needs.filter(need => {
    const matchesSearch = needSearchQuery === '' || 
      need.title.toLowerCase().includes(needSearchQuery.toLowerCase()) ||
      need.notes?.toLowerCase().includes(needSearchQuery.toLowerCase()) ||
      need.id.toString().includes(needSearchQuery)
    
    const matchesDate = needDateFilter === '' || 
      (need.createdAt && new Date(need.createdAt).toISOString().split('T')[0] === needDateFilter)
    
    return matchesSearch && matchesDate
  })

  return (
    <div>
      <Tabs defaultValue="ajouter-commande" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="ajouter-commande" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Ajouter une commande
          </TabsTrigger>
          <TabsTrigger value="importer-facture" className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Importer une facture
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ajouter-commande">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Gestion des besoins</h3>
                <p className="text-slate-600 dark:text-slate-400">Définissez vos besoins en produits pour les transmettre aux fournisseurs</p>
              </div>
              <Button
                onClick={() => { setEditingNeed(null); setShowForm(true) }}
                className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                  boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
                }}
              >
                Nouveau besoin
              </Button>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Rechercher par titre, notes ou ID</Label>
                  <Input 
                    placeholder="Rechercher..." 
                    value={needSearchQuery} 
                    onChange={(e) => setNeedSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Filtrer par date de création</Label>
                  <Input 
                    type="date" 
                    value={needDateFilter} 
                    onChange={(e) => setNeedDateFilter(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">Chargement...</p>
                </CardContent>
              </Card>
            ) : filteredNeeds.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mb-4" />
                  <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {needs.length === 0 ? 'Aucun besoin défini' : 'Aucun besoin trouvé'}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {needs.length === 0 ? 'Commencez par créer votre premier besoin' : 'Aucun besoin ne correspond à vos critères de recherche'}
                  </p>
                  <Button
                    onClick={() => { setEditingNeed(null); setShowForm(true) }}
                    className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                      boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
                    }}
                  >
                    Créer un besoin
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredNeeds.map((need) => (
                  <Card key={need.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{need.title}</h4>
                            <Badge 
                              variant={need.status === 'EN_ATTENTE' ? 'default' : 
                                      need.status === 'ENVOYE' ? 'secondary' : 
                                      need.status === 'TRAITE' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {need.status}
                            </Badge>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-3">{need.notes}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span>Créé par: {need.createdByEmail}</span>
                            <span>Date: {new Date(need.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span>Articles: {need.items.length}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewDetails(need)}
                            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {need.status === 'TERMINE' && (
                            <>
                              {typeof need.invoiceTotalAmount !== 'undefined' && (
                                <span className="self-center text-sm text-slate-600 dark:text-slate-300">Montant facture: {need.invoiceTotalAmount} DH</span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const res = await pharmacyOrderAPI.downloadNeedInvoice(need.id)
                                    const blob = new Blob([res.data])
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `facture_besoin_${need.id}.pdf`
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                  } catch (e) {
                                    alert('Téléchargement de la facture échoué')
                                  }
                                }}
                                className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                              >
                                Télécharger facture
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editNeed(need)}
                            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNeed(need)}
                            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {showForm && (
              <NeedFormDialog
                open={showForm}
                onOpenChange={setShowForm}
                need={editingNeed}
                onSubmit={handleFormSubmit}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="importer-facture">
          <Card className="shadow-lg border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importer une facture
              </CardTitle>
              <CardDescription>Attachez un fichier et liez-le à une commande</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">Fichier de facture</Label>
                <div className="mt-1">
                  <Input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Fichier sélectionné: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Lier à la commande (besoin)</Label>
                <Select 
                  value={linkNeedId ? String(linkNeedId) : ''} 
                  onValueChange={(v) => setLinkNeedId(v ? Number(v) : undefined)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner une commande en attente" />
                  </SelectTrigger>
                  <SelectContent>
                    {needs.filter(need => need.status === 'EN_ATTENTE').length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-slate-500 dark:text-slate-400">
                        Aucune commande en attente disponible
                      </div>
                    ) : (
                      needs.filter(need => need.status === 'EN_ATTENTE').map(need => (
                        <SelectItem key={need.id} value={String(need.id)}>
                          Besoin #{need.id} - {need.title} (Créé par: {need.createdByEmail})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {needs.filter(need => need.status === 'EN_ATTENTE').length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Aucune commande en attente disponible. Créez d'abord une commande dans l'onglet "Ajouter une commande".
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Prix total de la facture</Label>
                <Input 
                  type="number" 
                  value={invoiceTotalAmount} 
                  onChange={(e) => setInvoiceTotalAmount(Number(e.target.value) || 0)}
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>
              <Button 
                onClick={importInvoice} 
                className="w-full text-white font-semibold py-3"
                style={{ background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})` }}
                disabled={!selectedFile || !linkNeedId || invoiceTotalAmount <= 0}
              >
                Importer la facture
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NeedsManagement() {
  const { themeColors } = useTheme()
  const [needs, setNeeds] = useState<PharmacyNeed[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNeed, setEditingNeed] = useState<PharmacyNeed | null>(null)

  // Load needs data
  useEffect(() => {
    loadNeeds()
  }, [])

  const loadNeeds = async () => {
    try {
      setLoading(true)
      const response = await pharmacyOrderAPI.getAllNeeds()
      setNeeds(response.data)
    } catch (error: any) {
      console.error('Error loading needs:', error)
      // Show error toast or alert
    } finally {
      setLoading(false)
    }
  }

    const exportToExcel = () => {
        if (needs.length === 0) return;

        // Préparer les données pour Excel avec les informations spécifiques demandées
        const data = needs.flatMap(need => {
            // Si le besoin a des items, on crée une ligne par médicament
            if (need.items && need.items.length > 0) {
                return need.items.map(item => ({
                    'ID du besoin': need.id,
                    'Titre du besoin': need.title,
                    'Remarque générale': need.notes || '',
                    'Nom du médicament': item.product || '',
                    'Quantité': item.quantity || 0,
                    'Remarque sur le médicament': item.notes || '',
                    'Statut': need.status,
                    'Créé par': need.createdByEmail || '',
                    'Date de création': new Date(need.createdAt).toLocaleDateString('fr-FR')
                }));
            } else {
                // Si pas d'items, on crée une ligne vide pour le besoin
                return [{
                    'ID du besoin': need.id,
                    'Titre du besoin': need.title,
                    'Remarque générale': need.notes || '',
                    'Nom du médicament': '',
                    'Quantité': 0,
                    'Remarque sur le médicament': '',
                    'Statut': need.status,
                    'Créé par': need.createdByEmail || '',
                    'Date de création': new Date(need.createdAt).toLocaleDateString('fr-FR')
                }];
            }
        });

        // Créer un classeur Excel
        const workbook = XLSX.utils.book_new();

        // Convertir les données en feuille de calcul
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Ajuster la largeur des colonnes pour une meilleure lisibilité
        const colWidths = [
            { wch: 15 }, // ID du besoin
            { wch: 25 }, // Titre du besoin
            { wch: 30 }, // Remarque générale
            { wch: 25 }, // Nom du médicament
            { wch: 10 }, // Quantité
            { wch: 30 }, // Remarque sur le médicament
            { wch: 15 }, // Statut
            { wch: 20 }, // Créé par
            { wch: 15 }  // Date de création
        ];
        worksheet['!cols'] = colWidths;

        // Ajouter la feuille au classeur
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Besoins Médicaments');

        // Générer le fichier Excel
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Créer le blob et télécharger
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'besoins_medicaments.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };
  const viewDetails = (need: PharmacyNeed) => {
    alert(`Détails du besoin ${need.id}:\nTitre: ${need.title}\nNotes: ${need.notes}\nStatut: ${need.status}\nCréé par: ${need.createdByEmail}`)
  }

  const editNeed = (need: PharmacyNeed) => {
    setEditingNeed(need)
    setShowForm(true)
  }

  const deleteNeed = async (need: PharmacyNeed) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le besoin "${need.title}" ?`)) {
      try {
        await pharmacyOrderAPI.deleteNeed(need.id)
        await loadNeeds() // Reload data
      } catch (error: any) {
        console.error('Error deleting need:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleFormSubmit = async (formData: CreatePharmacyNeed) => {
    try {
      if (editingNeed) {
        // For now, we'll just update the status since the API doesn't support full updates
        await pharmacyOrderAPI.updateNeedStatus(editingNeed.id, 'ENVOYE')
      } else {
        await pharmacyOrderAPI.createNeed(formData)
      }
      setShowForm(false)
      setEditingNeed(null)
      await loadNeeds() // Reload data
    } catch (error: any) {
      console.error('Error saving need:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Expression des besoins</h3>
          <p className="text-slate-600 dark:text-slate-400">Définissez vos besoins en produits pour les transmettre aux fournisseurs</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
            onClick={exportToExcel}
            disabled={needs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
              boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
            }}
          >
            Nouveau besoin
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Chargement...</p>
          </CardContent>
        </Card>
      ) : needs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mb-4" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Aucun besoin défini</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Commencez par créer votre premier besoin</p>
            <Button
              onClick={() => setShowForm(true)}
              className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
              style={{
                background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
              }}
            >
              Créer un besoin
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {needs.map((need) => (
            <Card key={need.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{need.title}</h4>
                      <Badge 
                        variant={need.status === 'EN_ATTENTE' ? 'default' : 
                                need.status === 'ENVOYE' ? 'secondary' : 
                                need.status === 'TRAITE' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {need.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">{need.notes}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>Créé par: {need.createdByEmail}</span>
                      <span>Date: {new Date(need.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>Articles: {need.items.length}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDetails(need)}
                      className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editNeed(need)}
                      className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNeed(need)}
                      className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <NeedFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          need={editingNeed}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}

function QuotesManagement() {
  const { themeColors } = useTheme()
  const [quotes, setQuotes] = useState<PharmacyQuote[]>([])
  const [loading, setLoading] = useState(false)

  // Load quotes data
  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const response = await pharmacyOrderAPI.getQuotes()
      setQuotes(response.data.content || [])
    } catch (error: any) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const importQuote = async () => {
    // For now, simulate quote import
    alert('Fonctionnalité d\'import de devis à implémenter')
  }

  const viewDetails = (quote: PharmacyQuote) => {
    alert(`Détails du devis ${quote.quoteNumber}:\nFournisseur: ${quote.supplier}\nMontant: ${quote.totalAmount}€\nStatut: ${quote.status}`)
  }

  const compareQuotes = (quote: any) => {
    alert(`Comparer le devis ${quote.supplier}`)
  }

  const acceptQuote = async (quote: PharmacyQuote) => {
    try {
      await pharmacyOrderAPI.updateQuoteStatus(quote.id, 'ACCEPTE')
      await loadQuotes() // Reload data
    } catch (error: any) {
      console.error('Error accepting quote:', error)
      alert('Erreur lors de l\'acceptation du devis')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Gestion des devis</h3>
          <p className="text-slate-600 dark:text-slate-400">Importez et gérez les devis reçus des fournisseurs</p>
        </div>
        <Button
          onClick={importQuote}
          className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
            boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importer devis
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Chargement...</p>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-slate-400 mb-4" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Aucun devis importé</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Importez les devis reçus des fournisseurs</p>
            <Button
              onClick={importQuote}
              className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
              style={{
                background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
              }}
            >
              Importer un devis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Devis {quote.supplier}</span>
                  <Badge variant="outline">{quote.status}</Badge>
                </CardTitle>
                <CardDescription>Total: {quote.totalAmount}€ - {new Date(quote.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => viewDetails(quote)}>Voir détails</Button>
                  <Button size="sm" variant="outline" onClick={() => compareQuotes(quote)}>Comparer</Button>
                  <Button size="sm" variant="outline" onClick={() => acceptQuote(quote)}>Accepter</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function OrdersManagement() {
  const { themeColors } = useTheme()
  const [orders, setOrders] = useState<PharmacyOrder[]>([])
  const [loading, setLoading] = useState(false)

  // Load orders data
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await pharmacyOrderAPI.getOrders()
      setOrders(response.data.content || [])
    } catch (error: any) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOrder = async () => {
    // For now, simulate order generation
    alert('Fonctionnalité de génération de commande à implémenter')
  }

  const viewPDF = (order: any) => {
    alert(`Ouvrir PDF de la commande ${order.id}`)
  }

  const downloadOrder = (order: any) => {
    alert(`Télécharger la commande ${order.id}`)
  }

  const trackOrder = (order: any) => {
    alert(`Suivre la commande ${order.id}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Bons de commande</h3>
          <p className="text-slate-600 dark:text-slate-400">Générez et suivez vos bons de commande</p>
        </div>
        <Button
          onClick={generateOrder}
          className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
            boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Générer commande
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Chargement...</p>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-slate-400 mb-4" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Aucun bon de commande</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Générez votre premier bon de commande</p>
            <Button
              onClick={generateOrder}
              className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
              style={{
                background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
              }}
            >
              Générer une commande
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Commande #{order.id}</span>
                  <Badge variant="outline">{order.status}</Badge>
                </CardTitle>
                <CardDescription>{order.supplier} - {new Date(order.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => viewPDF(order)}>Voir PDF</Button>
                  <Button size="sm" variant="outline" onClick={() => downloadOrder(order)}>Télécharger</Button>
                  <Button size="sm" variant="outline" onClick={() => trackOrder(order)}>Suivre</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function DeliveryManagement() {
  const { themeColors } = useTheme()
  const [deliveries, setDeliveries] = useState<PharmacyDelivery[]>([])
  const [loading, setLoading] = useState(false)

  // Load deliveries data
  useEffect(() => {
    loadDeliveries()
  }, [])

  const loadDeliveries = async () => {
    try {
      setLoading(true)
      const response = await pharmacyOrderAPI.getDeliveries()
      setDeliveries(response.data.content || [])
    } catch (error: any) {
      console.error('Error loading deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const importDeliveryNote = async () => {
    // For now, simulate delivery note import
    alert('Fonctionnalité d\'import de bon de livraison à implémenter')
  }

  const checkCompliance = (delivery: PharmacyDelivery) => {
    alert(`Vérifier la conformité de la livraison ${delivery.deliveryNumber}`)
  }

  const confirmReception = async (delivery: PharmacyDelivery) => {
    try {
      await pharmacyOrderAPI.updateDeliveryStatus(delivery.id, 'RECU')
      await loadDeliveries() // Reload data
    } catch (error: any) {
      console.error('Error confirming reception:', error)
      alert('Erreur lors de la confirmation de réception')
    }
  }

  const updateStock = async (delivery: PharmacyDelivery) => {
    try {
      await pharmacyOrderAPI.updateStockFromDelivery(delivery.id)
      await loadDeliveries() // Reload data
      alert('Stock mis à jour avec succès')
    } catch (error: any) {
      console.error('Error updating stock:', error)
      alert('Erreur lors de la mise à jour du stock')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Livraisons</h3>
          <p className="text-slate-600 dark:text-slate-400">Confirmez les livraisons et mettez à jour le stock</p>
        </div>
        <Button
          onClick={importDeliveryNote}
          className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
            boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importer bon de livraison
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Chargement...</p>
          </CardContent>
        </Card>
      ) : deliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-slate-400 mb-4" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Aucune livraison</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Importez les bons de livraison reçus</p>
            <Button
              onClick={importDeliveryNote}
              className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
              style={{
                background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
              }}
            >
              Importer un bon de livraison
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deliveries.map((delivery, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Livraison #{delivery.id}</span>
                  <Badge variant="outline">{delivery.status}</Badge>
                </CardTitle>
                <CardDescription>{delivery.supplier} - {new Date(delivery.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => checkCompliance(delivery)}>Vérifier conformité</Button>
                  <Button size="sm" variant="outline" onClick={() => confirmReception(delivery)}>Confirmer réception</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStock(delivery)}>Mettre à jour stock</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function NeedFormDialog({ open, onOpenChange, need, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; need: PharmacyNeed | null; onSubmit: (data: CreatePharmacyNeed) => void }) {
  const { themeColors } = useTheme()
  const [form, setForm] = useState<CreatePharmacyNeed>({
    title: '',
    notes: '',
    items: [{ product: '', quantity: 1, notes: '' }]
  })

  useEffect(() => {
    if (need) {
      setForm({
        title: need.title,
        notes: need.notes,
        items: need.items.map(item => ({ ...item, id: item.id }))
      })
    } else {
      setForm({
        title: '',
        notes: '',
        items: [{ product: '', quantity: 1, notes: '' }]
      })
    }
  }, [need])

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, notes: '' }]
    }))
  }

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const save = async () => {
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{need ? 'Modifier un besoin' : 'Nouveau besoin'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Titre du besoin</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Réapprovisionnement Q1 2024"
            />
          </div>
          
          <div>
            <Label>Remarques générales</Label>
            <Textarea 
              value={form.notes} 
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Précisions sur les besoins, contraintes, etc."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Produits demandés</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Ajouter un produit
              </Button>
            </div>
            
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm">Produit</Label>
                    <Input 
                      value={item.product} 
                      onChange={(e) => updateItem(index, 'product', e.target.value)}
                      placeholder="Nom du produit"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-sm">Quantité</Label>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Remarques</Label>
                    <Input 
                      value={item.notes} 
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      placeholder="Précisions sur ce produit"
                    />
                  </div>
                  {form.items.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeItem(index)}
                      className="mt-6"
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            Annuler
          </Button>
          <Button
            onClick={save}
            className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
              boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
            }}
          >
            {need ? 'Enregistrer' : 'Créer le besoin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InventoryTable({ category, items, onEdit, onDelete }: { category: PharmacyItem['category']; items: PharmacyItem[]; onEdit: (it: PharmacyItem) => void; onDelete: (it: PharmacyItem) => void }) {
  const isMedication = category === 'MEDICAMENT'
  const isSst = category === 'MATERIEL_SST'

  if (!items || items.length === 0) {
    return <div className="mt-6 text-slate-600 dark:text-slate-300">Aucun article trouvé.</div>
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            {isMedication && <TableHead>Forme</TableHead>}
            <TableHead>Quantité</TableHead>
            <TableHead>Date d'achat</TableHead>
            {isMedication && <TableHead>Date de péremption</TableHead>}
            {isMedication && <TableHead>Date de prescription</TableHead>}
            {category === 'PARAPHARMACEUTIQUE' && <TableHead>Date de péremption</TableHead>}
            {category === 'PARAPHARMACEUTIQUE' && <TableHead>Date de prescription</TableHead>}
            {isSst && <TableHead>Date de réparation</TableHead>}
            {isSst && <TableHead>Étalonnage</TableHead>}
            {isMedication && <TableHead>Dispense unitaire</TableHead>}
            {isMedication && <TableHead>Unités/boîte</TableHead>}
            {isMedication && <TableHead>Unités restantes</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(it => (
            <TableRow key={it.id}>
              <TableCell className="font-medium">{it.name}</TableCell>
              {isMedication && <TableCell>{it.form ?? '-'}</TableCell>}
              <TableCell>{it.quantity}</TableCell>
              <TableCell>{it.purchaseDate ? new Date(it.purchaseDate).toLocaleDateString() : '-'}</TableCell>
              {isMedication && <TableCell>{it.expirationDate ? new Date(it.expirationDate).toLocaleDateString() : '-'}</TableCell>}
              {isMedication && <TableCell>{it.prescriptionDate ? new Date(it.prescriptionDate).toLocaleDateString() : '-'}</TableCell>}
              {category === 'PARAPHARMACEUTIQUE' && <TableCell>{it.expirationDate ? new Date(it.expirationDate).toLocaleDateString() : '-'}</TableCell>}
              {category === 'PARAPHARMACEUTIQUE' && <TableCell>{it.prescriptionDate ? new Date(it.prescriptionDate).toLocaleDateString() : '-'}</TableCell>}
              {isSst && <TableCell>{it.repairDate ? new Date(it.repairDate).toLocaleDateString() : '-'}</TableCell>}
              {isSst && <TableCell>{it.calibrationDate ? new Date(it.calibrationDate).toLocaleDateString() : '-'}</TableCell>}
              {isMedication && <TableCell>{it.dispenseByUnit ? 'Oui' : 'Non'}</TableCell>}
              {isMedication && <TableCell>{it.unitsPerPackage ?? '-'}</TableCell>}
              {isMedication && <TableCell>{it.unitsRemaining ?? '-'}</TableCell>}
              <TableCell className="text-right">
                <RowActions item={it} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function RowActions({ item, onEdit, onDelete }: { item: PharmacyItem; onEdit: (it: PharmacyItem) => void; onDelete: (it: PharmacyItem) => void }) {
  const { themeColors } = useTheme()
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
        onClick={() => onEdit(item)}
      >
        Modifier
      </Button>
      <Button
        size="sm"
        className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
        style={{
          background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
          boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
        }}
        onClick={() => onDelete(item)}
      >
        Supprimer
      </Button>
    </div>
  )
}

function PharmacyFormDialog({ open, onOpenChange, initialItem, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; initialItem: PharmacyItem | null; onSaved: () => void }) {
  const { themeColors } = useTheme()
  const [form, setForm] = useState<Omit<PharmacyItem, 'id'>>({
    category: 'MEDICAMENT',
    name: '',
    quantity: 0,
    form: undefined,
    expirationDate: undefined,
    purchaseDate: undefined,
    prescriptionDate: undefined,
    repairDate: undefined,
    calibrationDate: undefined,
    id: undefined as any,
  } as any)

  useEffect(() => {
    if (initialItem) {
      const { id, ...rest } = initialItem
      setForm(rest as any)
    } else {
      setForm({ category: 'MEDICAMENT', name: '', quantity: 0 } as any)
    }
  }, [initialItem])

  const isMedication = form.category === 'MEDICAMENT'
  const isSst = form.category === 'MATERIEL_SST'
  const isComprime = isMedication && form.form === 'COMPRIME'

  const save = async () => {
    const payload = { ...form }
    try {
      if (initialItem) {
        await pharmacyAPI.update(initialItem.id, payload as any)
      } else {
        await pharmacyAPI.create(payload as any)
      }
      onSaved()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{initialItem ? 'Modifier un article' : 'Ajouter un article'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div>
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDICAMENT">Médicament</SelectItem>
                <SelectItem value="PARAPHARMACEUTIQUE">Parapharmaceutique</SelectItem>
                <SelectItem value="MATERIEL_SST">Matériel SST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nom</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Quantité</Label>
            <Input className="mt-1" type="number" value={form.quantity ?? 0} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </div>
          {isMedication && (
            <div>
              <Label>Forme</Label>
              <Select value={form.form} onValueChange={(v) => setForm({ ...form, form: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Forme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INJECTABLE">Injectable</SelectItem>
                  <SelectItem value="COMPRIME">Comprimé</SelectItem>
                  <SelectItem value="SUPPOSITOIRE">Suppositoire</SelectItem>
                  <SelectItem value="TOPIQUE">Topique</SelectItem>
                  <SelectItem value="GOUTTE">Goutte</SelectItem>
                  <SelectItem value="SPRAY">Spray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Date d'achat</Label>
            <Input className="mt-1" type="date" value={form.purchaseDate ?? ''} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          </div>
          {isMedication && (
            <>
              <div>
                <Label>Date de péremption</Label>
                <Input className="mt-1" type="date" value={form.expirationDate ?? ''} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />
              </div>
              <div>
                <Label>Date de prescription</Label>
                <Input className="mt-1" type="date" value={form.prescriptionDate ?? ''} onChange={(e) => setForm({ ...form, prescriptionDate: e.target.value })} />
              </div>
              {isComprime && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Dispense unitaire (comprimé)</Label>
                    <Select value={(form.dispenseByUnit ? 'true' : 'false') as any} onValueChange={(v) => setForm({ ...form, dispenseByUnit: v === 'true' })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Dispense unitaire" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Non</SelectItem>
                        <SelectItem value="true">Oui</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unités par boîte</Label>
                    <Input className="mt-1" type="number" value={form.unitsPerPackage ?? ''} onChange={(e) => setForm({ ...form, unitsPerPackage: Number(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Unités restantes</Label>
                    <Input className="mt-1" type="number" value={form.unitsRemaining ?? ''} onChange={(e) => setForm({ ...form, unitsRemaining: Number(e.target.value) || 0 })} />
                  </div>
                </div>
              )}
            </>
          )}
          {form.category === 'PARAPHARMACEUTIQUE' && (
            <>
              <div>
                <Label>Date de péremption</Label>
                <Input className="mt-1" type="date" value={form.expirationDate ?? ''} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />
              </div>
              <div>
                <Label>Date de prescription</Label>
                <Input className="mt-1" type="date" value={form.prescriptionDate ?? ''} onChange={(e) => setForm({ ...form, prescriptionDate: e.target.value })} />
              </div>
            </>
          )}
          {isSst && (
            <>
              <div>
                <Label>Date de réparation</Label>
                <Input className="mt-1" type="date" value={form.repairDate ?? ''} onChange={(e) => setForm({ ...form, repairDate: e.target.value })} />
              </div>
              <div>
                <Label>Étalonnage</Label>
                <Input className="mt-1" type="date" value={form.calibrationDate ?? ''} onChange={(e) => setForm({ ...form, calibrationDate: e.target.value })} />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            Annuler
          </Button>
          <Button
            onClick={save}
            className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
              boxShadow: `0 4px 6px -1px ${themeColors.colors.primary[500]}20`
            }}
          >
            {initialItem ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({ item, onCancel, onConfirm }: { item: PharmacyItem | null; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={!!item}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-2 text-sm text-slate-600 dark:text-slate-300">{item?.name}</div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}