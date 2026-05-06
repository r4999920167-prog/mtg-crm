import { randomUUID } from "crypto";
import type {
  Employee, InsertEmployee,
  Client, InsertClient,
  Service, InsertService,
  WorkOrder, InsertWorkOrder,
  WorkOrderItem, InsertWorkOrderItem,
  Appointment, InsertAppointment,
  Transaction, InsertTransaction,
  SalaryPayment, InsertSalaryPayment,
  Message, InsertMessage,
} from "@shared/schema";

export interface IStorage {
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(e: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, e: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(c: InsertClient): Promise<Client>;
  updateClient(id: string, c: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(s: InsertService): Promise<Service>;
  updateService(id: string, s: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Work Orders
  getWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrder(id: string): Promise<WorkOrder | undefined>;
  createWorkOrder(wo: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: string, wo: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  deleteWorkOrder(id: string): Promise<boolean>;

  // Work Order Items
  getWorkOrderItems(workOrderId: string): Promise<WorkOrderItem[]>;
  createWorkOrderItem(i: InsertWorkOrderItem): Promise<WorkOrderItem>;
  deleteWorkOrderItem(id: string): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(a: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, a: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(t: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: string): Promise<boolean>;

  // Salary Payments
  getSalaryPayments(): Promise<SalaryPayment[]>;
  createSalaryPayment(s: InsertSalaryPayment): Promise<SalaryPayment>;
  updateSalaryPayment(id: string, s: Partial<InsertSalaryPayment>): Promise<SalaryPayment | undefined>;

  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(m: InsertMessage): Promise<Message>;
  updateMessage(id: string, m: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private employees = new Map<string, Employee>();
  private clients = new Map<string, Client>();
  private services = new Map<string, Service>();
  private workOrders = new Map<string, WorkOrder>();
  private workOrderItems = new Map<string, WorkOrderItem>();
  private appointments = new Map<string, Appointment>();
  private transactions = new Map<string, Transaction>();
  private salaryPayments = new Map<string, SalaryPayment>();
  private messages = new Map<string, Message>();
  private orderCounter = 0;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed employees
    const empData: InsertEmployee[] = [
      { name: "Алексей Макаров", role: "admin", phone: "+7 925 741 6910", salary: 120000, active: true },
      { name: "Дмитрий Волков", role: "master", phone: "+7 926 111 2233", salary: 85000, active: true },
      { name: "Сергей Петров", role: "master", phone: "+7 926 222 3344", salary: 85000, active: true },
      { name: "Михаил Козлов", role: "master", phone: "+7 926 333 4455", salary: 80000, active: true },
      { name: "Андрей Смирнов", role: "master", phone: "+7 926 444 5566", salary: 80000, active: true },
      { name: "Иван Новиков", role: "master", phone: "+7 926 555 6677", salary: 75000, active: true },
      { name: "Павел Морозов", role: "master", phone: "+7 926 666 7788", salary: 75000, active: true },
      { name: "Николай Егоров", role: "manager", phone: "+7 926 777 8899", salary: 70000, bonusPercent: 10, active: true },
    ];
    empData.forEach(e => this.createEmployee(e));

    // Seed services (full detailing cycle)
    const svcData: InsertService[] = [
      // PPF
      { name: "Оклейка PPF полный кузов", category: "ppf", price: 180000, duration: 2880 },
      { name: "Оклейка PPF передняя часть", category: "ppf", price: 65000, duration: 960 },
      { name: "Оклейка PPF капот", category: "ppf", price: 25000, duration: 480 },
      // Detailing
      { name: "Мойка комплексная", category: "detailing", price: 3500, duration: 120 },
      { name: "Полировка кузова", category: "detailing", price: 25000, duration: 480 },
      { name: "Керамическое покрытие", category: "detailing", price: 35000, duration: 360 },
      { name: "Химчистка салона", category: "detailing", price: 12000, duration: 360 },
      { name: "Защита кожи салона", category: "detailing", price: 15000, duration: 240 },
      // Tinting
      { name: "Тонировка боковых стёкол", category: "tinting", price: 8000, duration: 180 },
      { name: "Тонировка лобового", category: "tinting", price: 5000, duration: 120 },
      { name: "Тонировка заднего", category: "tinting", price: 4000, duration: 90 },
      // Tuning
      { name: "Шумоизоляция полная", category: "tuning", price: 80000, duration: 2880 },
      { name: "Установка сигнализации", category: "tuning", price: 25000, duration: 480 },
      { name: "Установка автозапуска", category: "tuning", price: 15000, duration: 360 },
      { name: "Контурная подсветка салона", category: "tuning", price: 35000, duration: 480 },
      { name: "Электро-пороги", category: "tuning", price: 120000, duration: 960 },
      // Audio
      { name: "Установка акустики", category: "audio", price: 20000, duration: 480 },
      { name: "Установка сабвуфера", category: "audio", price: 15000, duration: 360 },
      // Wrap
      { name: "Оклейка цветной плёнкой (полная)", category: "wrap", price: 150000, duration: 2880 },
      { name: "Оклейка элементов (крыша, зеркала)", category: "wrap", price: 20000, duration: 360 },
    ];
    svcData.forEach(s => this.createService(s));

    // Seed sample clients
    const clientData: InsertClient[] = [
      { name: "Владимир Иванов", phone: "+7 916 100 2000", car: "Range Rover Sport 2024", licensePlate: "А001АА77", email: "v.ivanov@mail.ru", notes: "" },
      { name: "Екатерина Соколова", phone: "+7 903 200 3000", car: "Mercedes G-class W463", licensePlate: "В002ВВ99", email: "", notes: "VIP клиент" },
      { name: "Артём Кузнецов", phone: "+7 915 300 4000", car: "BMW X5 G05", licensePlate: "С003СС77", email: "artem.k@gmail.com", notes: "" },
    ];
    clientData.forEach(c => this.createClient(c));
  }

  // ─── Employees ───
  async getEmployees() { return Array.from(this.employees.values()); }
  async getEmployee(id: string) { return this.employees.get(id); }
  async createEmployee(e: InsertEmployee) {
    const id = randomUUID();
    const emp: Employee = { id, name: e.name, role: e.role, phone: e.phone ?? null, salary: e.salary ?? 0, bonusPercent: e.bonusPercent ?? 0, active: e.active ?? true };
    this.employees.set(id, emp);
    return emp;
  }
  async updateEmployee(id: string, e: Partial<InsertEmployee>) {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...e };
    this.employees.set(id, updated);
    return updated;
  }
  async deleteEmployee(id: string) { return this.employees.delete(id); }

  // ─── Clients ───
  async getClients() { return Array.from(this.clients.values()); }
  async getClient(id: string) { return this.clients.get(id); }
  async createClient(c: InsertClient) {
    const id = randomUUID();
    const client: Client = { id, name: c.name, phone: c.phone, email: c.email ?? null, car: c.car ?? null, licensePlate: c.licensePlate ?? null, notes: c.notes ?? null };
    this.clients.set(id, client);
    return client;
  }
  async updateClient(id: string, c: Partial<InsertClient>) {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...c };
    this.clients.set(id, updated);
    return updated;
  }
  async deleteClient(id: string) { return this.clients.delete(id); }

  // ─── Services ───
  async getServices() { return Array.from(this.services.values()); }
  async getService(id: string) { return this.services.get(id); }
  async createService(s: InsertService) {
    const id = randomUUID();
    const svc: Service = { id, name: s.name, category: s.category, price: s.price, duration: s.duration ?? null };
    this.services.set(id, svc);
    return svc;
  }
  async updateService(id: string, s: Partial<InsertService>) {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...s };
    this.services.set(id, updated);
    return updated;
  }
  async deleteService(id: string) { return this.services.delete(id); }

  // ─── Work Orders ───
  async getWorkOrders() { return Array.from(this.workOrders.values()); }
  async getWorkOrder(id: string) { return this.workOrders.get(id); }
  async createWorkOrder(wo: InsertWorkOrder) {
    const id = randomUUID();
    this.orderCounter++;
    const order: WorkOrder = {
      id,
      orderNumber: wo.orderNumber || this.orderCounter,
      clientId: wo.clientId,
      employeeId: wo.employeeId ?? null,
      managerId: wo.managerId ?? null,
      status: wo.status || "new",
      date: wo.date,
      notes: wo.notes ?? null,
      totalPrice: wo.totalPrice ?? 0,
    };
    this.workOrders.set(id, order);
    return order;
  }
  async updateWorkOrder(id: string, wo: Partial<InsertWorkOrder>) {
    const existing = this.workOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...wo };
    this.workOrders.set(id, updated);
    return updated;
  }
  async deleteWorkOrder(id: string) { return this.workOrders.delete(id); }

  // ─── Work Order Items ───
  async getWorkOrderItems(workOrderId: string) {
    return Array.from(this.workOrderItems.values()).filter(i => i.workOrderId === workOrderId);
  }
  async createWorkOrderItem(i: InsertWorkOrderItem) {
    const id = randomUUID();
    const item: WorkOrderItem = { id, workOrderId: i.workOrderId, serviceId: i.serviceId ?? null, description: i.description, quantity: i.quantity ?? 1, price: i.price };
    this.workOrderItems.set(id, item);
    return item;
  }
  async deleteWorkOrderItem(id: string) { return this.workOrderItems.delete(id); }

  // ─── Appointments ───
  async getAppointments() { return Array.from(this.appointments.values()); }
  async getAppointment(id: string) { return this.appointments.get(id); }
  async createAppointment(a: InsertAppointment) {
    const id = randomUUID();
    const appt: Appointment = {
      id, clientId: a.clientId, employeeId: a.employeeId ?? null, workOrderId: a.workOrderId ?? null,
      date: a.date, timeStart: a.timeStart, timeEnd: a.timeEnd, title: a.title,
      status: a.status || "scheduled", notes: a.notes ?? null, photos: a.photos ?? null,
    };
    this.appointments.set(id, appt);
    return appt;
  }
  async updateAppointment(id: string, a: Partial<InsertAppointment>) {
    const existing = this.appointments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...a };
    this.appointments.set(id, updated);
    return updated;
  }
  async deleteAppointment(id: string) { return this.appointments.delete(id); }

  // ─── Transactions ───
  async getTransactions() { return Array.from(this.transactions.values()); }
  async createTransaction(t: InsertTransaction) {
    const id = randomUUID();
    const txn: Transaction = {
      id, type: t.type, category: t.category, amount: t.amount,
      description: t.description ?? null, date: t.date,
      workOrderId: t.workOrderId ?? null, employeeId: t.employeeId ?? null,
    };
    this.transactions.set(id, txn);
    return txn;
  }
  async deleteTransaction(id: string) { return this.transactions.delete(id); }

  // ─── Salary Payments ───
  async getSalaryPayments() { return Array.from(this.salaryPayments.values()); }
  async createSalaryPayment(s: InsertSalaryPayment) {
    const id = randomUUID();
    const sp: SalaryPayment = { id, employeeId: s.employeeId, amount: s.amount, period: s.period, paidDate: s.paidDate ?? null, status: s.status || "pending" };
    this.salaryPayments.set(id, sp);
    return sp;
  }
  async updateSalaryPayment(id: string, s: Partial<InsertSalaryPayment>) {
    const existing = this.salaryPayments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...s };
    this.salaryPayments.set(id, updated);
    return updated;
  }

  // ─── Messages ───
  async getMessages() { return Array.from(this.messages.values()); }
  async createMessage(m: InsertMessage) {
    const id = randomUUID();
    const msg: Message = { id, subject: m.subject, body: m.body, sentDate: m.sentDate, recipientType: m.recipientType, recipientIds: m.recipientIds ?? null, status: m.status || "draft" };
    this.messages.set(id, msg);
    return msg;
  }
  async updateMessage(id: string, m: Partial<InsertMessage>) {
    const existing = this.messages.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...m };
    this.messages.set(id, updated);
    return updated;
  }
  async deleteMessage(id: string) { return this.messages.delete(id); }
}

export const storage = new MemStorage();
