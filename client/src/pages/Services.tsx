import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import type { Service } from "@shared/schema";

const catLabels: Record<string, string> = {
  ppf: "Оклейка PPF",
  detailing: "Детейлинг",
  tinting: "Тонировка",
  tuning: "Тюнинг",
  audio: "Аудио",
  wrap: "Оклейка плёнкой",
};

const catColors: Record<string, string> = {
  ppf: "bg-blue-500/10 text-blue-400",
  detailing: "bg-green-500/10 text-green-400",
  tinting: "bg-purple-500/10 text-purple-400",
  tuning: "bg-orange-500/10 text-orange-400",
  audio: "bg-pink-500/10 text-pink-400",
  wrap: "bg-cyan-500/10 text-cyan-400",
};

export default function Services() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editSvc, setEditSvc] = useState<Service | null>(null);

  const { data: services = [] } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const grouped = useMemo(() => {
    const g: Record<string, Service[]> = {};
    services.forEach(s => {
      if (!g[s.category]) g[s.category] = [];
      g[s.category].push(s);
    });
    return g;
  }, [services]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Service>) => apiRequest("POST", "/api/services", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      apiRequest("PATCH", `/api/services/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      price: parseFloat(fd.get("price") as string),
      duration: fd.get("duration") ? parseInt(fd.get("duration") as string) : null,
    };

    if (editSvc) {
      updateMutation.mutate({ id: editSvc.id, data: payload });
      toast({ title: "Услуга обновлена" });
    } else {
      createMutation.mutate(payload);
      toast({ title: "Услуга добавлена" });
    }
    setOpen(false);
    setEditSvc(null);
  }

  return (
    <div className="space-y-6" data-testid="services-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Прайс-лист</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditSvc(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="add-service-btn">
              <Plus className="w-4 h-4 mr-1" /> Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editSvc ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Название *</Label>
                <Input name="name" required defaultValue={editSvc?.name || ""} data-testid="input-svc-name" />
              </div>
              <div>
                <Label>Категория *</Label>
                <select name="category" required defaultValue={editSvc?.category || "ppf"} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-svc-category">
                  {Object.entries(catLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Цена (₽) *</Label>
                <Input name="price" type="number" step="1" required defaultValue={editSvc?.price || ""} data-testid="input-svc-price" />
              </div>
              <div>
                <Label>Время (мин.)</Label>
                <Input name="duration" type="number" defaultValue={editSvc?.duration || ""} placeholder="480" data-testid="input-svc-duration" />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-service">
                Сохранить
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(grouped).map(([cat, svcs]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColors[cat] || ""}`}>
              {catLabels[cat] || cat}
            </span>
            <span className="text-muted-foreground text-xs">{svcs.length} услуг</span>
          </h3>
          <div className="space-y-1.5">
            {svcs.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-card border border-border"
                data-testid={`service-row-${s.id}`}
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  {s.duration && <p className="text-xs text-muted-foreground">{Math.floor(s.duration / 60)}ч {s.duration % 60 > 0 ? `${s.duration % 60}мин` : ""}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{fmt(s.price)}</span>
                  <button
                    onClick={() => { setEditSvc(s); setOpen(true); }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    data-testid={`edit-svc-${s.id}`}
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => { deleteMutation.mutate(s.id); toast({ title: "Услуга удалена" }); }}
                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                    data-testid={`delete-svc-${s.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
