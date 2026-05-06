import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Printer } from "lucide-react";
import { useState } from "react";
import type { WorkOrder, WorkOrderItem, Client, Employee, Service } from "@shared/schema";

export default function Orders() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<WorkOrder | null>(null);

  const { data: orders = [] } = useQuery<WorkOrder[]>({ queryKey: ["/api/work-orders"] });
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: employees = [] } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });
  const { data: services = [] } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const createMutation = useMutation({
    mutationFn: (data: Partial<WorkOrder>) => apiRequest("POST", "/api/work-orders", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrder> }) =>
      apiRequest("PATCH", `/api/work-orders/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/work-orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] }),
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      clientId: fd.get("clientId") as string,
      employeeId: (fd.get("employeeId") as string) || null,
      managerId: (fd.get("managerId") as string) || null,
      date: (fd.get("date") as string) || new Date().toISOString().split("T")[0],
      notes: (fd.get("notes") as string) || null,
      orderNumber: orders.length + 1,
      totalPrice: 0,
      status: "new",
    });
    setOpen(false);
    toast({ title: "Заказ-наряд создан" });
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  const statusLabels: Record<string, string> = { new: "Новый", in_progress: "В работе", done: "Готов", cancelled: "Отменён" };
  const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400",
    in_progress: "bg-yellow-500/10 text-yellow-400",
    done: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
  };

  const sorted = [...orders].sort((a, b) => b.orderNumber - a.orderNumber);

  return (
    <div className="space-y-6" data-testid="orders-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Заказ-наряды</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="add-order-btn">
              <Plus className="w-4 h-4 mr-1" /> Новый заказ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый заказ-наряд</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Клиент *</Label>
                <select name="clientId" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-order-client">
                  <option value="">Выберите клиента</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.car || c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Мастер</Label>
                <select name="employeeId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-order-employee">
                  <option value="">Не назначен</option>
                  {employees.filter(e => e.role === "master").map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Менеджер</Label>
                <select name="managerId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-order-manager">
                  <option value="">Не назначен</option>
                  {employees.filter(e => e.role === "manager").map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Дата</Label>
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} data-testid="input-order-date" />
              </div>
              <div>
                <Label>Примечания</Label>
                <Textarea name="notes" data-testid="input-order-notes" />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-order">
                Создать
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Order list */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Заказов нет</p>
        ) : sorted.map((o) => {
          const client = clients.find(c => c.id === o.clientId);
          const emp = employees.find(e => e.id === o.employeeId);
          return (
            <Card key={o.id} className="cursor-pointer hover:border-primary/30 transition-colors" data-testid={`order-card-${o.id}`}>
              <CardContent className="p-4" onClick={() => setDetailOrder(o)}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Заказ-наряд #{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {client?.name} {client?.car ? `— ${client.car}` : ""} {emp ? `| Мастер: ${emp.name}` : ""}
                        {(() => { const mgr = employees.find(e => e.id === o.managerId); return mgr ? ` | Менеджер: ${mgr.name}` : ""; })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{fmt(o.totalPrice)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status]}`}>
                      {statusLabels[o.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">{o.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail dialog */}
      <OrderDetail
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
        clients={clients}
        employees={employees}
        services={services}
        onStatusChange={(id, status) => {
          updateMutation.mutate({ id, data: { status } });
          setDetailOrder(prev => prev && prev.id === id ? { ...prev, status } : prev);
          toast({ title: "Заказ обновлён" });
        }}
        onPriceUpdate={(id, price) => {
          updateMutation.mutate({ id, data: { totalPrice: price } });
          setDetailOrder(prev => prev && prev.id === id ? { ...prev, totalPrice: price } : prev);
        }}
        onDelete={(id) => {
          deleteMutation.mutate(id);
          setDetailOrder(null);
          toast({ title: "Заказ удалён" });
        }}
      />
    </div>
  );
}

function OrderDetail({
  order, onClose, clients, employees, services, onStatusChange, onPriceUpdate, onDelete,
}: {
  order: WorkOrder | null;
  onClose: () => void;
  clients: Client[];
  employees: Employee[];
  services: Service[];
  onStatusChange: (id: string, status: string) => void;
  onPriceUpdate: (id: string, price: number) => void;
  onDelete: (id: string) => void;
}) {
  const { data: items = [] } = useQuery<WorkOrderItem[]>({
    queryKey: ["/api/work-orders", order?.id, "items"],
    enabled: !!order,
  });

  const addItemMutation = useMutation({
    mutationFn: (data: Partial<WorkOrderItem>) => apiRequest("POST", "/api/work-order-items", data),
    onSuccess: () => {
      if (order) queryClient.invalidateQueries({ queryKey: ["/api/work-orders", order.id, "items"] });
    },
  });

  function addService(svc: Service) {
    if (!order) return;
    addItemMutation.mutate({
      workOrderId: order.id,
      serviceId: svc.id,
      description: svc.name,
      quantity: 1,
      price: svc.price,
    });
    const newTotal = items.reduce((s, i) => s + i.price * i.quantity, 0) + svc.price;
    onPriceUpdate(order.id, newTotal);
  }

  if (!order) return null;
  const client = clients.find(c => c.id === order.clientId);
  const emp = employees.find(e => e.id === order.employeeId);

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  // Group services by category
  const cats: Record<string, Service[]> = {};
  services.forEach(s => {
    if (!cats[s.category]) cats[s.category] = [];
    cats[s.category].push(s);
  });

  const catLabels: Record<string, string> = {
    ppf: "Оклейка PPF", detailing: "Детейлинг", tinting: "Тонировка",
    tuning: "Тюнинг", audio: "Аудио", wrap: "Оклейка плёнкой",
  };

  function handlePrint() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Заказ-наряд #${order!.orderNumber}</title>
      <style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-weight:bold;font-size:18px}</style></head>
      <body><h1>Заказ-наряд #${order!.orderNumber}</h1>
      <p><b>Клиент:</b> ${client?.name || "—"} ${client?.car ? `(${client.car})` : ""}</p>
      <p><b>Мастер:</b> ${emp?.name || "Не назначен"}</p>
      <p><b>Менеджер:</b> ${employees.find(e => e.id === order!.managerId)?.name || "Не назначен"}</p>
      <p><b>Дата:</b> ${order!.date}</p>
      <table><tr><th>Услуга</th><th>Кол-во</th><th>Цена</th></tr>
      ${items.map(i => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${fmt(i.price)}</td></tr>`).join("")}
      </table>
      <p class="total">Итого: ${fmt(order!.totalPrice)}</p>
      ${order!.notes ? `<p><b>Примечания:</b> ${order!.notes}</p>` : ""}
      <p style="margin-top:60px">Подпись клиента: _________________</p>
      <p>Подпись мастера: _________________</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  return (
    <Dialog open={!!order} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Заказ-наряд #{order.orderNumber}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} data-testid="print-order">
                <Printer className="w-4 h-4 mr-1" /> Печать
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(order.id)} data-testid="delete-order">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Order info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Клиент:</span> <span className="font-medium">{client?.name}</span></div>
            <div><span className="text-muted-foreground">Авто:</span> <span className="font-medium">{client?.car || "—"}</span></div>
            <div><span className="text-muted-foreground">Мастер:</span> <span className="font-medium">{emp?.name || "—"}</span></div>
            <div><span className="text-muted-foreground">Менеджер:</span> <span className="font-medium">{employees.find(e => e.id === order.managerId)?.name || "—"}</span></div>
            <div><span className="text-muted-foreground">Дата:</span> <span className="font-medium">{order.date}</span></div>
          </div>

          {/* Status buttons */}
          <div className="flex gap-2">
            {["new", "in_progress", "done", "cancelled"].map(s => (
              <Button
                key={s}
                variant={order.status === s ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusChange(order.id, s)}
                data-testid={`order-status-${s}`}
              >
                {{ new: "Новый", in_progress: "В работе", done: "Готов", cancelled: "Отменён" }[s]}
              </Button>
            ))}
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Позиции</h4>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Добавьте услуги из прайса ниже</p>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1.5 px-3 rounded bg-muted/30 text-sm">
                    <span>{item.description}</span>
                    <span className="font-medium">{fmt(item.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-3 rounded bg-primary/10 text-sm font-bold">
                  <span>Итого</span>
                  <span>{fmt(order.totalPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Services picker */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Добавить услугу из прайса</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {Object.entries(cats).map(([cat, svcs]) => (
                <div key={cat}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {catLabels[cat] || cat}
                  </p>
                  <div className="space-y-1">
                    {svcs.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => addService(svc)}
                        className="w-full flex items-center justify-between py-1.5 px-3 rounded hover:bg-muted/50 text-sm transition-colors text-left"
                        data-testid={`add-service-${svc.id}`}
                      >
                        <span>{svc.name}</span>
                        <span className="text-muted-foreground">{fmt(svc.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Примечания</h4>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
