import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BadgeRussianRuble, Check, Clock, UserCog, TrendingUp, Percent } from "lucide-react";
import { useState } from "react";
import type { Employee, SalaryPayment } from "@shared/schema";

type BonusData = Record<string, { ordersTotal: number; ordersCount: number; bonusAmount: number }>;

export default function Salary() {
  const { toast } = useToast();
  const now = new Date();
  const [period, setPeriod] = useState(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`);

  const { data: employees = [] } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });
  const { data: payments = [] } = useQuery<SalaryPayment[]>({ queryKey: ["/api/salary-payments"] });
  const { data: bonusData = {} } = useQuery<BonusData>({
    queryKey: ["/api/salary/bonus", { period }],
    queryFn: async () => {
      const res = await fetch(`/api/salary/bonus?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch bonus data");
      return res.json();
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: Partial<SalaryPayment>) => apiRequest("POST", "/api/salary-payments", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/salary-payments"] }),
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalaryPayment> }) =>
      apiRequest("PATCH", `/api/salary-payments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/salary-payments"] }),
  });

  const activeEmps = employees.filter(e => e.active);
  const periodPayments = payments.filter(p => p.period === period);

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  // Calculate total salary including bonuses for managers
  function getEmployeeTotal(emp: Employee): number {
    if (emp.role === "manager" && (emp.bonusPercent || 0) > 0) {
      const bonus = bonusData[emp.id]?.bonusAmount || 0;
      return emp.salary + bonus;
    }
    return emp.salary;
  }

  const totalSalary = activeEmps.reduce((s, e) => s + getEmployeeTotal(e), 0);
  const totalPaid = periodPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = periodPayments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  function generatePayments() {
    activeEmps.forEach((emp) => {
      const existing = periodPayments.find(p => p.employeeId === emp.id);
      if (!existing) {
        const total = getEmployeeTotal(emp);
        createPaymentMutation.mutate({
          employeeId: emp.id,
          amount: total,
          period,
          status: "pending",
          paidDate: null,
        });
      }
    });
    toast({ title: "Зарплаты начислены" });
  }

  function markPaid(paymentId: string) {
    updatePaymentMutation.mutate({
      id: paymentId,
      data: {
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
      },
    });
    toast({ title: "Статус обновлён" });
  }

  const roleLabels: Record<string, string> = { admin: "Администратор", master: "Мастер", manager: "Менеджер" };

  // months list for selector
  const months: string[] = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`);
  }

  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    const names = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    return `${names[parseInt(mo) - 1]} ${y}`;
  };

  return (
    <div className="space-y-6" data-testid="salary-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Расчёт зарплат</h1>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="period-select"
          >
            {months.map(m => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <Button size="sm" onClick={generatePayments} data-testid="generate-salaries">
            <BadgeRussianRuble className="w-4 h-4 mr-1" /> Начислить
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs text-muted-foreground">ФОТ за месяц</p>
            <p className="text-lg font-bold">{fmt(totalSalary)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs text-muted-foreground">Выплачено</p>
            <p className="text-lg font-bold text-green-500">{fmt(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs text-muted-foreground">К выплате</p>
            <p className="text-lg font-bold text-yellow-500">{fmt(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee salary list */}
      <div className="space-y-2">
        {activeEmps.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Нет активных сотрудников</p>
        ) : activeEmps.map((emp) => {
          const payment = periodPayments.find(p => p.employeeId === emp.id);
          const isManager = emp.role === "manager" && (emp.bonusPercent || 0) > 0;
          const bonus = bonusData[emp.id];
          const bonusAmount = bonus?.bonusAmount || 0;
          const totalPay = getEmployeeTotal(emp);

          return (
            <div
              key={emp.id}
              className="py-3 px-4 rounded-lg bg-card border border-border"
              data-testid={`salary-row-${emp.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <UserCog className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[emp.role] || emp.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-semibold">{fmt(totalPay)}</span>
                    {isManager && (
                      <p className="text-xs text-muted-foreground">
                        фикс {fmt(emp.salary)} + бонус {fmt(bonusAmount)}
                      </p>
                    )}
                  </div>
                  {payment ? (
                    payment.status === "paid" ? (
                      <span className="flex items-center gap-1 text-xs text-green-500 font-medium whitespace-nowrap">
                        <Check className="w-3.5 h-3.5" /> Выплачено {payment.paidDate}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markPaid(payment.id)}
                        data-testid={`pay-${emp.id}`}
                      >
                        <Check className="w-4 h-4 mr-1" /> Выплатить
                      </Button>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" /> Не начислено
                    </span>
                  )}
                </div>
              </div>

              {/* Manager bonus details */}
              {isManager && bonus && bonus.ordersCount > 0 && (
                <div className="mt-2 ml-12 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {bonus.ordersCount} заказ(ов) на {fmt(bonus.ordersTotal)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {emp.bonusPercent}% = {fmt(bonusAmount)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
