import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Phone, Mail, Car, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Client } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery<Client[]>({ queryKey: ["/api/clients"] });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.car || "").toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data: Partial<Client>) =>
      editClient
        ? apiRequest("PATCH", `/api/clients/${editClient.id}`, data).then(r => r.json())
        : apiRequest("POST", "/api/clients", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      setEditClient(null);
      toast({ title: editClient ? "Клиент обновлён" : "Клиент добавлен" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Клиент удалён" });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      email: (fd.get("email") as string) || undefined,
      car: (fd.get("car") as string) || undefined,
      licensePlate: (fd.get("licensePlate") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    });
  }

  return (
    <div className="space-y-6" data-testid="clients-page">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">Клиенты</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56" data-testid="client-search" />
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditClient(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="add-client-btn"><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editClient ? "Редактировать клиента" : "Новый клиент"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Имя *</Label><Input name="name" required defaultValue={editClient?.name || ""} data-testid="input-client-name" /></div>
                <div><Label>Телефон *</Label><Input name="phone" required defaultValue={editClient?.phone || ""} data-testid="input-client-phone" /></div>
                <div><Label>Email</Label><Input name="email" type="email" defaultValue={editClient?.email || ""} data-testid="input-client-email" /></div>
                <div><Label>Автомобиль</Label><Input name="car" defaultValue={editClient?.car || ""} placeholder="Mercedes G-class W463" data-testid="input-client-car" /></div>
                <div><Label>Гос. номер</Label><Input name="licensePlate" defaultValue={editClient?.licensePlate || ""} data-testid="input-client-plate" /></div>
                <div><Label>Заметки</Label><Textarea name="notes" defaultValue={editClient?.notes || ""} data-testid="input-client-notes" /></div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="submit-client">Сохранить</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Клиенты не найдены</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} data-testid={`client-card-${c.id}`}>
              <CardContent className="pt-5 pb-4 px-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    {c.notes && <p className="text-xs text-primary mt-0.5">{c.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditClient(c); setOpen(true); }} className="p-1.5 rounded-md hover:bg-muted transition-colors" data-testid={`edit-client-${c.id}`}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" data-testid={`delete-client-${c.id}`}><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</div>
                  {c.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</div>}
                  {c.car && <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5" /> {c.car} {c.licensePlate && `(${c.licensePlate})`}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
