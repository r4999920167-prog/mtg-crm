import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Camera, Image } from "lucide-react";
import { useState, useMemo } from "react";
import type { Appointment, Client, Employee } from "@shared/schema";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function CalendarPage() {
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewAppt, setViewAppt] = useState<Appointment | null>(null);

  const { data: appointments = [] } = useQuery<Appointment[]>({ queryKey: ["/api/appointments"] });
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: employees = [] } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Appointment>) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      apiRequest("PATCH", `/api/appointments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }),
  });

  // Calendar grid
  const calDays = useMemo(() => {
    const first = new Date(currentMonth.year, currentMonth.month, 1);
    let startDay = first.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
    const days: { day: number; date: string; isToday: boolean }[] = [];
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < startDay; i++) days.push({ day: 0, date: "", isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth.year}-${pad(currentMonth.month + 1)}-${pad(d)}`;
      days.push({ day: d, date: dateStr, isToday: dateStr === today });
    }
    return days;
  }, [currentMonth]);

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  function prevMonth() {
    setCurrentMonth((m) => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 });
  }
  function nextMonth() {
    setCurrentMonth((m) => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 });
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      clientId: fd.get("clientId") as string,
      employeeId: (fd.get("employeeId") as string) || null,
      workOrderId: null,
      date: fd.get("date") as string,
      timeStart: fd.get("timeStart") as string,
      timeEnd: fd.get("timeEnd") as string,
      title: fd.get("title") as string,
      notes: (fd.get("notes") as string) || null,
      status: "scheduled",
      photos: null,
    });
    setOpen(false);
    toast({ title: "Запись добавлена" });
  }

  function handleUpdateAppt(id: string, updates: Partial<Appointment>) {
    updateMutation.mutate({ id, data: updates });
    setViewAppt(prev => prev && prev.id === id ? { ...prev, ...updates } as Appointment : prev);
    toast({ title: "Запись обновлена" });
  }

  // selected date appointments
  const selectedAppts = selectedDate ? (apptsByDate[selectedDate] || []) : [];

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500",
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  return (
    <div className="space-y-6" data-testid="calendar-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Календарь</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="add-appointment-btn">
              <Plus className="w-4 h-4 mr-1" /> Запись
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая запись</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Название *</Label>
                <Input name="title" required placeholder="Оклейка PPF полный кузов" data-testid="input-appt-title" />
              </div>
              <div>
                <Label>Клиент *</Label>
                <select name="clientId" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-appt-client">
                  <option value="">Выберите клиента</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.car || c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Мастер</Label>
                <select name="employeeId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-appt-employee">
                  <option value="">Не назначен</option>
                  {employees.filter(e => e.role === "master").map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Дата *</Label>
                  <Input name="date" type="date" required defaultValue={selectedDate || ""} data-testid="input-appt-date" />
                </div>
                <div>
                  <Label>Начало *</Label>
                  <Input name="timeStart" type="time" required defaultValue="10:00" data-testid="input-appt-start" />
                </div>
                <div>
                  <Label>Конец *</Label>
                  <Input name="timeEnd" type="time" required defaultValue="18:00" data-testid="input-appt-end" />
                </div>
              </div>
              <div>
                <Label>Заметки</Label>
                <Textarea name="notes" data-testid="input-appt-notes" />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-appointment">
                Записать
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-md" data-testid="prev-month">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm">
                {MONTHS[currentMonth.month]} {currentMonth.year}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-md" data-testid="next-month">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {calDays.map((d, i) => {
                if (d.day === 0) return <div key={`empty-${i}`} />;
                const dayAppts = apptsByDate[d.date] || [];
                const isSelected = d.date === selectedDate;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`
                      relative p-2 min-h-[60px] text-left rounded-md transition-colors text-sm
                      ${d.isToday ? "ring-1 ring-primary" : ""}
                      ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}
                    `}
                    data-testid={`day-${d.date}`}
                  >
                    <span className={`text-xs ${d.isToday ? "font-bold text-primary" : ""}`}>{d.day}</span>
                    {dayAppts.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayAppts.slice(0, 2).map((a) => (
                          <div
                            key={a.id}
                            className={`w-full h-1.5 rounded-full ${statusColors[a.status] || "bg-muted"}`}
                          />
                        ))}
                        {dayAppts.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{dayAppts.length - 2}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })
                : "Выберите день"}
            </h3>
            {selectedAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет записей</p>
            ) : (
              <div className="space-y-3">
                {selectedAppts.map((a) => {
                  const client = clients.find(c => c.id === a.clientId);
                  const emp = employees.find(e => e.id === a.employeeId);
                  const photos = a.photos ? JSON.parse(a.photos) : [];
                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg bg-muted/30 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setViewAppt(a)}
                      data-testid={`appt-item-${a.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{a.title}</span>
                        <span className={`w-2 h-2 rounded-full ${statusColors[a.status]}`} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.timeStart}–{a.timeEnd}</span>
                        {client && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {client.name}</span>}
                      </div>
                      {emp && <p className="text-xs text-muted-foreground">Мастер: {emp.name}</p>}
                      {photos.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Image className="w-3 h-3" /> {photos.length} фото
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment detail dialog */}
      <Dialog open={!!viewAppt} onOpenChange={(v) => { if (!v) setViewAppt(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewAppt?.title}</DialogTitle>
          </DialogHeader>
          {viewAppt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Дата:</span>
                  <p className="font-medium">{viewAppt.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Время:</span>
                  <p className="font-medium">{viewAppt.timeStart} — {viewAppt.timeEnd}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Клиент:</span>
                  <p className="font-medium">{clients.find(c => c.id === viewAppt.clientId)?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Мастер:</span>
                  <p className="font-medium">{employees.find(e => e.id === viewAppt.employeeId)?.name || "—"}</p>
                </div>
              </div>
              {viewAppt.notes && <p className="text-sm">{viewAppt.notes}</p>}

              {/* Photo upload area */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4" /> Фото осмотра
                </Label>
                <div className="relative border border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground">Перетащите фото сюда или нажмите для загрузки</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const existing = viewAppt.photos ? JSON.parse(viewAppt.photos) : [];
                      Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          existing.push(reader.result);
                          handleUpdateAppt(viewAppt.id, { photos: JSON.stringify(existing) });
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    data-testid="photo-upload"
                  />
                </div>
                {viewAppt.photos && JSON.parse(viewAppt.photos).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {JSON.parse(viewAppt.photos).map((src: string, i: number) => (
                      <img key={i} src={src} alt={`Фото ${i + 1}`} className="rounded-md w-full h-20 object-cover" />
                    ))}
                  </div>
                )}
              </div>

              {/* Status change */}
              <div className="flex gap-2">
                {["scheduled", "in_progress", "completed"].map((s) => (
                  <Button
                    key={s}
                    variant={viewAppt.status === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateAppt(viewAppt.id, { status: s })}
                    data-testid={`status-${s}`}
                  >
                    {{ scheduled: "Запланирован", in_progress: "В работе", completed: "Завершён" }[s]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
