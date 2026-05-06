import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Phone, UserCog, Percent } from "lucide-react";
import { useState } from "react";
import type { Employee } from "@shared/schema";

const roleLabels: Record<string, string> = { admin: "Администратор", master: "Мастер", manager: "Менеджер" };
const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  master: "bg-blue-500/10 text-blue-400",
  manager: "bg-purple-500/10 text-purple-400",
};

export default function Employees() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);

  const { data: employees = [] } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });

  const createMut = useMutation({
    mutationFn: (data: any) =>
      editEmp
        ? apiRequest("PATCH", `/api/employees/${editEmp.id}`, data).then(r => r.json())
        : apiRequest("POST", "/api/employees", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setOpen(false);
      setEditEmp(null);
      toast({ title: editEmp ? "Сотрудник обновлён" : "Сотрудник добавлен" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Сотрудник удалён" });
    },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const role = fd.get("role") as string;
    createMut.mutate({
      name: fd.get("name"),
      role,
      phone: fd.get("phone") || undefined,
      salary: parseFloat(fd.get("salary") as string),
      bonusPercent: role === "manager" ? parseFloat(fd.get("bonusPercent") as string) || 0 : 0,
      active: true,
    });
  }

  return (
    <div className="space-y-6" data-testid="employees-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Сотрудники</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditEmp(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="add-employee-btn"><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editEmp ? "Редактировать" : "Новый сотрудник"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Имя *</Label><Input name="name" required defaultValue={editEmp?.name || ""} data-testid="input-emp-name" /></div>
              <div>
                <Label>Роль *</Label>
                <select name="role" required defaultValue={editEmp?.role || "master"} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-emp-role">
                  <option value="master">Мастер</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div><Label>Телефон</Label><Input name="phone" defaultValue={editEmp?.phone || ""} data-testid="input-emp-phone" /></div>
              <div><Label>Зарплата (₽/мес) *</Label><Input name="salary" type="number" required defaultValue={editEmp?.salary || ""} data-testid="input-emp-salary" /></div>
              <div id="bonus-field">
                <Label>Бонус % от заказов (для менеджеров)</Label>
                <Input name="bonusPercent" type="number" step="0.5" min="0" max="100" defaultValue={editEmp?.bonusPercent || 10} data-testid="input-emp-bonus" placeholder="10" />
                <p className="text-xs text-muted-foreground mt-1">Процент от суммы завершённых заказов</p>
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending} data-testid="submit-employee">Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card key={emp.id} className={!emp.active ? "opacity-50" : ""} data-testid={`employee-card-${emp.id}`}>
            <CardContent className="pt-5 pb-4 px-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><UserCog className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <p className="text-sm font-semibold">{emp.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[emp.role] || ""}`}>{roleLabels[emp.role] || emp.role}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditEmp(emp); setOpen(true); }} className="p-1.5 rounded-md hover:bg-muted transition-colors" data-testid={`edit-emp-${emp.id}`}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteMut.mutate(emp.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" data-testid={`delete-emp-${emp.id}`}><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {emp.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {emp.phone}</div>}
                <div className="flex items-center justify-between"><span>Зарплата:</span><span className="font-semibold text-foreground">{fmt(emp.salary)}</span></div>
                {emp.role === "manager" && emp.bonusPercent > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Бонус:</span>
                    <span className="font-semibold text-primary">{emp.bonusPercent}% от заказов</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
