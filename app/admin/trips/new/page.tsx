"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

type Client = {
  id: string;
  full_name: string;
  email: string;
};

export default function NewTripPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Form state
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("draft");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      console.log("Fetching clients...");
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "client")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
        alert("Error al cargar clientes: " + error.message);
        return;
      }

      console.log("Clients loaded:", data?.length || 0);
      setClients(data || []);
    } catch (error) {
      console.error("Exception fetching clients:", error);
      alert("Error inesperado al cargar clientes");
    } finally {
      setIsLoadingClients(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones básicas
      if (!title || title.trim() === "") {
        alert("Por favor ingresa un título para el viaje");
        setIsLoading(false);
        return;
      }

      if (!clientId || clientId === "") {
        alert("Por favor selecciona un cliente o 'OPEN' para crear una plantilla");
        setIsLoading(false);
        return;
      }

      if (!startDate) {
        alert("Por favor selecciona una fecha de inicio");
        setIsLoading(false);
        return;
      }

      if (!endDate) {
        alert("Por favor selecciona una fecha de fin");
        setIsLoading(false);
        return;
      }

      // Validar que la fecha de fin sea posterior a la de inicio
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        alert("La fecha de fin debe ser posterior a la fecha de inicio");
        setIsLoading(false);
        return;
      }

      // Preparar datos para insertar
      const formData = {
        title: title.trim(),
        // Send null if it's the template placeholder, otherwise the client ID
        user_id: clientId === "00000000-0000-0000-0000-000000000000" ? null : clientId,
        start_date: startDate,
        end_date: endDate,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Enviando datos:", formData);

      // Insertar en Supabase
      const { data: insertedData, error } = await supabase
        .from("trips")
        .insert(formData)
        .select();

      if (error) {
        console.error("Error Supabase:", error);
        alert("Error Supabase: " + error.message);
        setIsLoading(false);
        return;
      }

      console.log("Viaje creado exitosamente:", insertedData);

      // Mostrar toast de éxito
      toast({
        title: "Viaje creado con éxito!",
        description: `El viaje "${title}" ha sido creado correctamente.`,
      });

      // Redirigir al editor de itinerario del nuevo viaje
      if (insertedData && insertedData.length > 0) {
        const newTripId = insertedData[0].id;
        console.log("Redirigiendo al editor de itinerario:", newTripId);
        setTimeout(() => {
          router.push(`/admin/trips/${newTripId}`);
        }, 1000);
      } else {
        // Fallback: si no hay data, ir a la lista
        setTimeout(() => {
          router.push("/admin/trips");
        }, 1000);
      }
    } catch (error) {
      console.error("Exception en handleSubmit:", error);
      alert("Error inesperado: " + (error instanceof Error ? error.message : String(error)));
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Create New Trip</h1>
          <p className="text-slate-600 mt-1 font-body">Add a new trip for a client</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/trips")}
          className="font-body"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Button>
      </div>

      {/* Form */}
      <Card className="bg-white border-slate-200 max-w-2xl">
        <CardHeader>
          <CardTitle className="font-body">Trip Details</CardTitle>
          <CardDescription className="font-body">
            Fill in the information to create a new trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-body">
                Trip Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Costa Rica Expedition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="font-body"
                required
              />
            </div>

            {/* Client Select */}
            <div className="space-y-2">
              <Label htmlFor="client" className="font-body">
                Client <span className="text-red-500">*</span>
              </Label>
              {isLoadingClients ? (
                <div className="flex items-center gap-2 text-slate-600 font-body">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading clients...</span>
                </div>
              ) : (
                <select
                  id="client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={isLoading || isLoadingClients}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                  required
                >
                  <option value="">-- Select a client --</option>
                  <option value="00000000-0000-0000-0000-000000000000">OPEN (Template)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </option>
                  ))}
                </select>
              )}
              {clients.length === 0 && !isLoadingClients && (
                <p className="text-sm text-slate-500 font-body">
                  No clients found. Please create a client first.
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="font-body">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isLoading}
                  className="font-body"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="font-body">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isLoading}
                  className="font-body"
                  required
                />
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-2">
              <Label htmlFor="status" className="font-body">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "draft")}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                required
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-body"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Trip
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/trips")}
                disabled={isLoading}
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
