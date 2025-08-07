"use client"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function IncidentsDemo() {
  const { token } = useAuth()
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!token) return
    setLoading(true)
    apiFetch("http://localhost:8081/incidents", { token })
      .then(setIncidents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      await apiFetch("http://localhost:8081/incidents", {
        method: "POST",
        body: { title, description },
        token,
      })
      setSuccess("Incident créé !")
      setTitle("")
      setDescription("")
      // Refresh list
      const data = await apiFetch("http://localhost:8081/incidents", { token })
      setIncidents(data)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">Incidents (démo API)</h2>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">Erreur: {error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <ul className="mb-4">
        {incidents.map((i) => (
          <li key={i.id} className="border-b py-1">{i.title} – {i.description}</li>
        ))}
      </ul>
      <form onSubmit={handleCreate} className="space-y-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Créer</button>
      </form>
    </div>
  )
}
