import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Trash2, Mail, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { Message, Client } from "@shared/schema";

export default function Messages() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { data: messages = [] } = useQuery<Message[]>({ queryKey: ["/api/messages"] });
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const createMut = useMutation({ mutationFn: (data: any) => apiRequest("POST", "/api/messages", data).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages"] }); setOpen(false); toast({ title: "Сообщение создано" }); } });
  const sendMut = useMutation({ mutationFn: (id: string) => apiRequest("PATCH", `/api/messages/${id}`, { status: "sent", sentDate: new Date().toISOString().split("T")[0] }).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages"] }); toast({ title: "Рассылка отправлена" }); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", `/api/messages/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages"] }); toast({ title: "Сообщение удалено" }); } });
  function handleCreate(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const fd = new FormData(e.currentTarget); createMut.mutate({ subject: fd.get("subject"), body: fd.get("body"), recipientType: fd.get("recipientType"), sentDate: new Date().toISOString().split("T")[0], status: "draft" }); }
  const sorted = [...messages].sort((a, b) => b.sentDate.localeCompare(a.sentDate));
  return (
    <div className="space-y-6" data-testid="messages-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Рассылка</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="add-message-btn"><Plus className="w-4 h-4 mr-1" /> Новое сообщение</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая рассылка</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><Label>Тема *</Label><Input name="subject" required placeholder="Акция на оклейку PPF" data-testid="input-msg-subject" /></div>
              <div><Label>Получатели *</Label><select name="recipientType" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-msg-recipients"><option value="all">Все клиенты ({clients.length})</option><option value="specific">Выборочно</option></select></div>
              <div><Label>Текст сообщения *</Label><Textarea name="body" required rows={6} placeholder="Здравствуйте! Рады сообщить о специальном предложении..." data-testid="input-msg-body" /></div>
              <Button type="submit" className="w-full" disabled={createMut.isPending} data-testid="submit-message">Создать черновик</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5 pb-4 px-5"><p className="text-xs text-muted-foreground">Всего рассылок</p><p className="text-lg font-bold">{messages.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 px-5"><p className="text-xs text-muted-foreground">Отправлено</p><p className="text-lg font-bold text-green-500">{messages.filter(m => m.status === "sent").length}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 px-5"><p className="text-xs text-muted-foreground">Черновики</p><p className="text-lg font-bold text-yellow-500">{messages.filter(m => m.status === "draft").length}</p></CardContent></Card>
      </div>
      <div className="space-y-3">
        {sorted.length === 0 ? (<p className="text-muted-foreground text-sm text-center py-8">Нет рассылок</p>) : sorted.map((m) => (
          <Card key={m.id} data-testid={`message-card-${m.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.status === "sent" ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                    {m.status === "sent" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{m.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.body}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{m.recipientType === "all" ? `Все клиенты (${clients.length})` : "Выборочно"}<span>&middot;</span><span>{m.sentDate}</span></div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {m.status === "draft" && (<Button size="sm" onClick={() => sendMut.mutate(m.id)} disabled={sendMut.isPending} data-testid={`send-msg-${m.id}`}><Send className="w-4 h-4 mr-1" /> Отправить</Button>)}
                  <button onClick={() => deleteMut.mutate(m.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" data-testid={`delete-msg-${m.id}`}><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
