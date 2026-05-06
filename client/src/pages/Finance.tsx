import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import type { Transaction } from "@shared/schema";

export default function Finance() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [txnType, setTxnType] = useState<"income" | "expense">("income");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const { data: txns = [] } = useQuery<Transaction[]>({ queryKey: ["/api/transactions"] });
  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/transactions", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/transactions"] }); queryClient.invalidateQueries({ queryKey: ["/api/stats"] }); setOpen(false); toast({ title: "Операция добавлена" }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/transactions"] }); queryClient.invalidateQueries({ queryKey: ["/api/stats"] }); toast({ title: "Операция удалена" }); },
  });
  const fmt = (n: number) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);
  const totals = useMemo(() => {
    const income = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [txns]);
  const filtered = txns.filter(t => filter === "all" || t.type === filter).sort((a, b) => b.date.localeCompare(a.date));
  const catLabels: Record<string, string> = { service_payment: "Оплата услуг", materials: "Материалы", rent: "Аренда", salary: "Зарплата", equipment: "Оборудование", marketing: "Реклама", other: "Прочее" };
  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({ type: txnType, category: fd.get("category"), amount: parseFloat(fd.get("amount") as string), description: fd.get("description") || undefined, date: fd.get("date") || new Date().toISOString().split("T")[0] });
  }
  return (
    <div className="space-y-6" data-testid="finance-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Финансы</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="add-transaction-btn"><Plus className="w-4 h-4 mr-1" /> Операция</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая операция</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant={txnType === "income" ? "default" : "outline"} size="sm" onClick={() => setTxnType("income")} className={txnType === "income" ? "bg-green-600 hover:bg-green-700" : ""} data-testid="type-income"><TrendingUp className="w-4 h-4 mr-1" /> Приход</Button>
                <Button type="button" variant={txnType === "expense" ? "default" : "outline"} size="sm" onClick={() => setTxnType("expense")} className={txnType === "expense" ? "bg-red-600 hover:bg-red-700" : ""} data-testid="type-expense"><TrendingDown className="w-4 h-4 mr-1" /> Расход</Button>
              </div>
              <div>
                <Label>Категория *</Label>
                <select name="category" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-txn-category">
                  {txnType === "income" ? (<><option value="service_payment">Оплата услуг</option><option value="other">Прочее</option></>) : (<><option value="materials">Материалы</option><option value="rent">Аренда</option><option value="salary">Зарплата</option><option value="equipment">Оборудование</option><option value="marketing">Реклама</option><option value="other">Прочее</option></>)}
                </select>
              </div>
              <div><Label>Сумма *</Label><Input name="amount" type="number" step="0.01" required placeholder="50000" data-testid="input-txn-amount" /></div>
              <div><Label>Дата</Label><Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} data-testid="input-txn-date" /></div>
              <div><Label>Описание</Label><Textarea name="description" placeholder="Оклейка PPF для Range Rover" data-testid="input-txn-desc" /></div>
              <Button type="submit" className="w-full" disabled={createMut.isPending} data-testid="submit-transaction">Добавить</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="finance-income"><CardContent className="pt-5 pb-4 px-5"><div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-500" /><div><p className="text-xs text-muted-foreground">Общий доход</p><p className="text-lg font-bold text-green-500">{fmt(totals.income)}</p></div></div></CardContent></Card>
        <Card data-testid="finance-expense"><CardContent className="pt-5 pb-4 px-5"><div className="flex items-center gap-3"><TrendingDown className="w-5 h-5 text-red-500" /><div><p className="text-xs text-muted-foreground">Общий расход</p><p className="text-lg font-bold text-red-500">{fmt(totals.expense)}</p></div></div></CardContent></Card>
        <Card data-testid="finance-balance"><CardContent className="pt-5 pb-4 px-5"><div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Баланс</p><p className={`text-lg font-bold ${totals.balance >= 0 ? "text-green-500" : "text-red-500"}`}>{fmt(totals.balance)}</p></div></div></CardContent></Card>
      </div>
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map(f => (<Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} data-testid={`filter-${f}`}>{{ all: "Все", income: "Приход", expense: "Расход" }[f]}</Button>))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (<p className="text-muted-foreground text-sm text-center py-8">Операций нет</p>) : filtered.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-card border border-border" data-testid={`txn-row-${t.id}`}>
            <div className="flex items-center gap-3">
              {t.type === "income" ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              <div><p className="text-sm font-medium">{t.description || catLabels[t.category] || t.category}</p><p className="text-xs text-muted-foreground">{catLabels[t.category]} &middot; {t.date}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</span>
              <button onClick={() => deleteMut.mutate(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" data-testid={`delete-txn-${t.id}`}><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
