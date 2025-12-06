"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, User, Settings, Mail, Phone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Trip = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
};

type Client = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  country_code: string | null;
  is_active: boolean | null;
  created_at: string;
  trips?: Trip[];
};

// Calculate if client has an active trip (startDate <= today <= endDate)
function hasActiveTrip(client: Client): boolean {
  if (!client.trips || client.trips.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return client.trips.some((trip) => {
    const startDate = new Date(trip.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(trip.end_date);
    endDate.setHours(0, 0, 0, 0);

    return startDate <= today && today <= endDate;
  });
}

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, statusFilter, clients]);

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          username,
          phone,
          country_code,
          is_active,
          created_at,
          trips:trips!user_id (
            id,
            start_date,
            end_date,
            status
          )
        `)
        .eq("role", "client")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to handle Supabase's relation format
      const transformedClients = (data || []).map((client: any) => ({
        ...client,
        trips: Array.isArray(client.trips) ? client.trips : [],
      }));

      setClients(transformedClients as Client[]);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load clients.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function filterClients() {
    let filtered = [...clients];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.full_name?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.username?.toLowerCase().includes(query) ||
          client.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter based on trip activity (not is_active field)
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => {
        const hasActive = hasActiveTrip(client);
        return statusFilter === "active" ? hasActive : !hasActive;
      });
    }

    setFilteredClients(filtered);
  }

  function getInitials(name: string | null, email: string): string {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  }

  function getCountryDisplay(countryCode: string | null): string {
    if (!countryCode) return "N/A";
    // You can enhance this with a country code to name mapping
    return countryCode.toUpperCase();
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Clients</h1>
          <p className="text-slate-600 mt-1 font-body">
            Manage and view all client profiles
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, username, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-body"
              />
            </div>

            {/* Status Filter */}
            <Tabs
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}
              className="w-auto"
            >
              <TabsList className="font-body">
                <TabsTrigger value="all">Show All</TabsTrigger>
                <TabsTrigger value="active">Active Only</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="font-body">
            {filteredClients.length} {filteredClients.length === 1 ? "Client" : "Clients"}
          </CardTitle>
          <CardDescription className="font-body">
            {searchQuery || statusFilter !== "all"
              ? `Filtered from ${clients.length} total clients`
              : "All registered clients"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-body">
              <User className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold">No clients found</p>
              <p className="text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No clients have been registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="font-body">Identity</TableHead>
                    <TableHead className="font-body">Contact</TableHead>
                    <TableHead className="font-body">Origin</TableHead>
                    <TableHead className="font-body">Status</TableHead>
                    <TableHead className="font-body text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const isActive = client.is_active !== false;
                    const displayName = client.full_name || client.email.split("@")[0];
                    const username = client.username
                      ? `@${client.username}`
                      : `@${client.email.split("@")[0]}`;

                    return (
                      <TableRow key={client.id} className="border-slate-200">
                        {/* Identity Column */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-slate-200">
                              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {getInitials(client.full_name, client.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 font-body">
                                {displayName}
                              </p>
                              <p className="text-sm text-slate-500 font-body">{username}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Contact Column */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="font-body text-slate-700">{client.email}</span>
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="font-body text-slate-600">
                                  {client.country_code ? `+${client.country_code} ` : ""}
                                  {client.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Origin Column */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <Badge
                              variant="outline"
                              className="font-body bg-slate-50 text-slate-700 border-slate-200"
                            >
                              {getCountryDisplay(client.country_code)}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Status Column - Based on Trip Activity */}
                        <TableCell>
                          {(() => {
                            const hasActive = hasActiveTrip(client);
                            return (
                              <Badge
                                className={cn(
                                  "font-body",
                                  hasActive
                                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100"
                                )}
                                variant="outline"
                              >
                                {hasActive ? "En Viaje" : "Inactivo"}
                              </Badge>
                            );
                          })()}
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="font-body"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

