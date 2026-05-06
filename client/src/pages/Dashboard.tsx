import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CalendarDays, Wallet, TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { WorkOrder, Appointment, Client } from "@shared/schema";

export default function Dashboard() {
  const { data: stats } = useQuery<{
    totalClients: number;
    totalOrders: number;
    activeOrders: number;
    todayAppointments: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>({ queryKey: ["/api/stats"] });

  const { data: orders } = useQuery<WorkOrder[]>({ queryKey: ["/api/work-orders"] });
  const { data: clients } = useQuery<Client[]>({ queryKey: ["/api/clients"] });

  const recentOrders = (orders || [])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <h1 className="text-xl font-semibold">Дашборд</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-clients">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Клиенты</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalClients ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-orders">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Заказы</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalOrders ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-active">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">В работе</p>
                <p className="text-2xl font-bold mt-1">{stats?.activeOrders ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-today">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Записей сегодня</p>
                <p className="text-2xl font-bold mt-1">{stats?.todayAppointments ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card data-testid="stat-income">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Доход</p>
                <p className="text-lg font-bold text-green-500">{fmt(stats?.totalIncome ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-expense">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Расход</p>
                <p className="text-lg font-bold text-red-500">{fmt(stats?.totalExpense ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-balance">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Баланс</p>
                <p className="text-lg font-bold">{fmt(stats?.balance ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Последние заказ-наряды</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Заказов пока нет</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => {
                const client = (clients || []).find((c) => c.id === o.clientId);
                return (
                  <div key={o.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30" data-testid={`order-row-${o.id}`}>
                    <div>
                      <span className="text-sm font-medium">#{o.orderNumber}</span>
                      <span className="text-sm text-muted-foreground ml-2">{client?.name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{fmt(o.totalPrice)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400",
    in_progress: "bg-yellow-500/10 text-yellow-400",
    done: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
  };
  const labels: Record<string, string> = {
    new: "Новый", in_progress: "В работе", done: "Готов", cancelled: "Отменён",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
