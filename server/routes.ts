import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ─── Employees ───
  app.get("/api/employees", async (_req, res) => {
    res.json(await storage.getEmployees());
  });
  app.get("/api/employees/:id", async (req, res) => {
    const e = await storage.getEmployee(req.params.id);
    e ? res.json(e) : res.status(404).json({ error: "Not found" });
  });
  app.post("/api/employees", async (req, res) => {
    res.json(await storage.createEmployee(req.body));
  });
  app.patch("/api/employees/:id", async (req, res) => {
    const e = await storage.updateEmployee(req.params.id, req.body);
    e ? res.json(e) : res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/employees/:id", async (req, res) => {
    await storage.deleteEmployee(req.params.id);
    res.json({ ok: true });
  });

  // ─── Clients ───
  app.get("/api/clients", async (_req, res) => {
    res.json(await storage.getClients());
  });
  app.get("/api/clients/:id", async (req, res) => {
    const c = await storage.getClient(req.params.id);
    c ? res.json(c) : res.status(404).json({ error: "Not found" });
  });
  app.post("/api/clients", async (req, res) => {
    res.json(await storage.createClient(req.body));
  });
  app.patch("/api/clients/:id", async (req, res) => {
    const c = await storage.updateClient(req.params.id, req.body);
    c ? res.json(c) : res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/clients/:id", async (req, res) => {
    await storage.deleteClient(req.params.id);
    res.json({ ok: true });
  });

  // ─── Services ───
  app.get("/api/services", async (_req, res) => {
    res.json(await storage.getServices());
  });
  app.post("/api/services", async (req, res) => {
    res.json(await storage.createService(req.body));
  });
  app.patch("/api/services/:id", async (req, res) => {
    const s = await storage.updateService(req.params.id, req.body);
    s ? res.json(s) : res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/services/:id", async (req, res) => {
    await storage.deleteService(req.params.id);
    res.json({ ok: true });
  });

  // ─── Work Orders ───
  app.get("/api/work-orders", async (_req, res) => {
    res.json(await storage.getWorkOrders());
  });
  app.get("/api/work-orders/:id", async (req, res) => {
    const wo = await storage.getWorkOrder(req.params.id);
    wo ? res.json(wo) : res.status(404).json({ error: "Not found" });
  });
  app.post("/api/work-orders", async (req, res) => {
    res.json(await storage.createWorkOrder(req.body));
  });
  app.patch("/api/work-orders/:id", async (req, res) => {
    const wo = await storage.updateWorkOrder(req.params.id, req.body);
    wo ? res.json(wo) : res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/work-orders/:id", async (req, res) => {
    await storage.deleteWorkOrder(req.params.id);
    res.json({ ok: true });
  });

  // ─── Work Order Items ───
  app.get("/api/work-orders/:id/items", async (req, res) => {
    res.json(await storage.getWorkOrderItems(req.params.id));
  });
  app.post("/api/work-order-items", async (req, res) => {
    res.json(await storage.createWorkOrderItem(req.body));
  });
  app.delete("/api/work-order-items/:id", async (req, res) => {
    await storage.deleteWorkOrderItem(req.params.id);
    res.json({ ok: true });
  });

  // ─── Appointments ───
  app.get("/api/appointments", async (_req, res) => {
    res.json(await storage.getAppointments());
  });
  app.post("/api/appointments", async (req, res) => {
    res.json(await storage.createAppointment(req.body));
  });
  app.patch("/api/appointments/:id", async (req, res) => {
    const a = await storage.updateAppointment(req.params.id, req.body);
    a ? res.json(a) : res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/appointments/:id", async (req, res) => {
    await storage.deleteAppointment(req.params.id);
    res.json({ ok: true });
  });

  // ─── Transactions ───
  app.get("/api/transactions", async (_req, res) => {
    res.json(await storage.getTransactions());
  });
  app.post("/api/transactions", async (req, res) => {
    res.json(await storage.createTransaction(req.body));
  });
  app.delete("/api/transactions/:id", async (req, res) => {
    await storage.deleteTransaction(req.params.id);
    res.json({ ok: true });
  });

  // ─── Salary Payments ───
  app.get("/api/salary-payments", async (_req, res) => {
    res.json(await storage.getSalaryPayments());
  });
  app.post("/api/salary-payments", async (req, res) => {
    res.json(await storage.createSalaryPayment(req.body));
  });
  app.patch("/api/salary-payments/:id", async (req, res) => {
    const s = await storage.updateSalaryPayment(req.params.id, req.body);
    s ? res.json(s) : res.status(404).json({ error: "Not found" });
  });

  // ─── Messages ───
  app.get("/api/messages", async (_req, res) => {
    res.json(await storage.getMessages());
  });
  app.post("/api/messages", async (req, res) => {
    res.json(await storage.createMessage(req.body));
  });
  app.patch("/api/messages/:id", async (req, res) => {
    const m = await storage.updateMessage(req.params.id, req.body);
    m ? res.json(m) : res.status(404).json({ error: "Not found" });
  });
  app.delete("/api/messages/:id", async (req, res) => {
    await storage.deleteMessage(req.params.id);
    res.json({ ok: true });
  });

  // ─── Manager Bonus Calculation ───
  app.get("/api/salary/bonus", async (req, res) => {
    const period = req.query.period as string; // "2026-03"
    if (!period) return res.status(400).json({ error: "period required" });

    const [year, month] = period.split("-").map(Number);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-01`; // works because we compare <

    const orders = await storage.getWorkOrders();
    const employees = await storage.getEmployees();

    // Find completed orders in the given period where a manager is assigned
    const completedOrders = orders.filter(
      (o) => o.status === "done" && o.managerId && o.date >= startDate && o.date < endDate
    );

    // Group by manager
    const bonusByManager: Record<string, { ordersTotal: number; ordersCount: number; bonusAmount: number }> = {};
    for (const o of completedOrders) {
      const mgr = employees.find((e) => e.id === o.managerId);
      if (!mgr || mgr.role !== "manager") continue;
      if (!bonusByManager[mgr.id]) {
        bonusByManager[mgr.id] = { ordersTotal: 0, ordersCount: 0, bonusAmount: 0 };
      }
      bonusByManager[mgr.id].ordersTotal += o.totalPrice;
      bonusByManager[mgr.id].ordersCount += 1;
      bonusByManager[mgr.id].bonusAmount += o.totalPrice * ((mgr.bonusPercent || 0) / 100);
    }

    res.json(bonusByManager);
  });

  // ─── Dashboard Stats ───
  app.get("/api/stats", async (_req, res) => {
    const clients = await storage.getClients();
    const orders = await storage.getWorkOrders();
    const txns = await storage.getTransactions();
    const appts = await storage.getAppointments();
    
    const totalIncome = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const activeOrders = orders.filter(o => o.status === "in_progress").length;
    const todayAppts = appts.filter(a => a.date === new Date().toISOString().split("T")[0]).length;

    res.json({
      totalClients: clients.length,
      totalOrders: orders.length,
      activeOrders,
      todayAppointments: todayAppts,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  });

  return httpServer;
}
