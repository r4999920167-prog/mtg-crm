import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  salary: number;
  bonusPercent: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  car: string | null;
  licensePlate: string | null;
  notes: string | null;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number | null;
}

export interface WorkOrder {
  id: string;
  orderNumber: number;
  clientId: string;
  employeeId: string | null;
  managerId: string | null;
  status: string;
  date: string;
  notes: string | null;
  totalPrice: number;
}

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  serviceId: string | null;
  description: string;
  quantity: number;
  price: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  employeeId: string | null;
  workOrderId: string | null;
  date: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  status: string;
  notes: string | null;
  photos: string | null;
}

export interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  workOrderId: string | null;
  employeeId: string | null;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  amount: number;
  period: string;
  paidDate: string | null;
  status: string;
}

export interface Message {
  id: string;
  subject: string;
  body: string;
  sentDate: string;
  recipientType: string;
  recipientIds: string[] | null;
  status: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

function createSeedEmployees(): Employee[] {
  return [
    { id: uuid(), name: "Алексей Макаров", role: "admin", phone: "+7 925 741 6910", salary: 120000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Дмитрий Волков", role: "master", phone: "+7 926 111 2233", salary: 85000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Сергей Петров", role: "master", phone: "+7 926 222 3344", salary: 85000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Михаил Козлов", role: "master", phone: "+7 926 333 4455", salary: 80000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Андрей Смирнов", role: "master", phone: "+7 926 444 5566", salary: 80000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Иван Новиков", role: "master", phone: "+7 926 555 6677", salary: 75000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Павел Морозов", role: "master", phone: "+7 926 666 7788", salary: 75000, bonusPercent: 0, active: true },
    { id: uuid(), name: "Николай Егоров", role: "manager", phone: "+7 926 777 8899", salary: 70000, bonusPercent: 10, active: true },
  ];
}

function createSeedServices(): Service[] {
  return [
    // PPF
    { id: uuid(), name: "Оклейка PPF полный кузов", category: "ppf", price: 180000, duration: 2880 },
    { id: uuid(), name: "Оклейка PPF передняя часть", category: "ppf", price: 65000, duration: 960 },
    { id: uuid(), name: "Оклейка PPF капот", category: "ppf", price: 25000, duration: 480 },
    // Detailing
    { id: uuid(), name: "Мойка комплексная", category: "detailing", price: 3500, duration: 120 },
    { id: uuid(), name: "Полировка кузова", category: "detailing", price: 25000, duration: 480 },
    { id: uuid(), name: "Керамическое покрытие", category: "detailing", price: 35000, duration: 360 },
    { id: uuid(), name: "Химчистка салона", category: "detailing", price: 12000, duration: 360 },
    { id: uuid(), name: "Защита кожи салона", category: "detailing", price: 15000, duration: 240 },
    // Tinting
    { id: uuid(), name: "Тонировка боковых стёкол", category: "tinting", price: 8000, duration: 180 },
    { id: uuid(), name: "Тонировка лобового", category: "tinting", price: 5000, duration: 120 },
    { id: uuid(), name: "Тонировка заднего", category: "tinting", price: 4000, duration: 90 },
    // Tuning
    { id: uuid(), name: "Шумоизоляция полная", category: "tuning", price: 80000, duration: 2880 },
    { id: uuid(), name: "Установка сигнализации", category: "tuning", price: 25000, duration: 480 },
    { id: uuid(), name: "Установка автозапуска", category: "tuning", price: 15000, duration: 360 },
    { id: uuid(), name: "Контурная подсветка салона", category: "tuning", price: 35000, duration: 480 },
    { id: uuid(), name: "Электро-пороги", category: "tuning", price: 120000, duration: 960 },
    // Audio
    { id: uuid(), name: "Установка акустики", category: "audio", price: 20000, duration: 480 },
    { id: uuid(), name: "Установка сабвуфера", category: "audio", price: 15000, duration: 360 },
    // Wrap
    { id: uuid(), name: "Оклейка цветной плёнкой (полная)", category: "wrap", price: 150000, duration: 2880 },
    { id: uuid(), name: "Оклейка элементов (крыша, зеркала)", category: "wrap", price: 20000, duration: 360 },
  ];
}

function createSeedClients(): Client[] {
  return [
    { id: uuid(), name: "Владимир Иванов", phone: "+7 916 100 2000", car: "Range Rover Sport 2024", licensePlate: "А001АА77", email: "v.ivanov@mail.ru", notes: "" },
    { id: uuid(), name: "Екатерина Соколова", phone: "+7 903 200 3000", car: "Mercedes G-class W463", licensePlate: "В002ВВ99", email: "", notes: "VIP клиент" },
    { id: uuid(), name: "Артём Кузнецов", phone: "+7 915 300 4000", car: "BMW X5 G05", licensePlate: "С003СС77", email: "artem.k@gmail.com", notes: "" },
  ];
}

// ─── Context Interface ────────────────────────────────────────────────────────

interface DataContextType {
  // State
  employees: Employee[];
  clients: Client[];
  services: Service[];
  workOrders: WorkOrder[];
  workOrderItems: WorkOrderItem[];
  appointments: Appointment[];
  transactions: Transaction[];
  salaryPayments: SalaryPayment[];
  messages: Message[];

  // Employees
  addEmployee: (e: Omit<Employee, "id">) => Employee;
  updateEmployee: (id: string, e: Partial<Omit<Employee, "id">>) => void;
  deleteEmployee: (id: string) => void;

  // Clients
  addClient: (c: Omit<Client, "id">) => Client;
  updateClient: (id: string, c: Partial<Omit<Client, "id">>) => void;
  deleteClient: (id: string) => void;

  // Services
  addService: (s: Omit<Service, "id">) => Service;
  updateService: (id: string, s: Partial<Omit<Service, "id">>) => void;
  deleteService: (id: string) => void;

  // Work Orders
  addWorkOrder: (wo: Omit<WorkOrder, "id">) => WorkOrder;
  updateWorkOrder: (id: string, wo: Partial<Omit<WorkOrder, "id">>) => void;
  deleteWorkOrder: (id: string) => void;

  // Work Order Items
  getWorkOrderItems: (workOrderId: string) => WorkOrderItem[];
  addWorkOrderItem: (i: Omit<WorkOrderItem, "id">) => WorkOrderItem;
  deleteWorkOrderItem: (id: string) => void;

  // Appointments
  addAppointment: (a: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, a: Partial<Omit<Appointment, "id">>) => void;
  deleteAppointment: (id: string) => void;

  // Transactions
  addTransaction: (t: Omit<Transaction, "id">) => Transaction;
  deleteTransaction: (id: string) => void;

  // Salary Payments
  addSalaryPayment: (s: Omit<SalaryPayment, "id">) => SalaryPayment;
  updateSalaryPayment: (id: string, s: Partial<Omit<SalaryPayment, "id">>) => void;

  // Messages
  addMessage: (m: Omit<Message, "id">) => Message;
  updateMessage: (id: string, m: Partial<Omit<Message, "id">>) => void;
  deleteMessage: (id: string) => void;

  // Stats & calculations
  getStats: () => {
    totalClients: number;
    totalOrders: number;
    activeOrders: number;
    todayAppointments: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  getBonusByManager: (period: string) => Record<string, { ordersTotal: number; ordersCount: number; bonusAmount: number }>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(createSeedEmployees);
  const [clients, setClients] = useState<Client[]>(createSeedClients);
  const [services, setServices] = useState<Service[]>(createSeedServices);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orderCounter, setOrderCounter] = useState(0);

  // ── Employees ──
  const addEmployee = useCallback((e: Omit<Employee, "id">): Employee => {
    const emp: Employee = { id: uuid(), ...e };
    setEmployees(prev => [...prev, emp]);
    return emp;
  }, []);

  const updateEmployee = useCallback((id: string, e: Partial<Omit<Employee, "id">>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...e } : emp));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  }, []);

  // ── Clients ──
  const addClient = useCallback((c: Omit<Client, "id">): Client => {
    const client: Client = { id: uuid(), ...c };
    setClients(prev => [...prev, client]);
    return client;
  }, []);

  const updateClient = useCallback((id: string, c: Partial<Omit<Client, "id">>) => {
    setClients(prev => prev.map(client => client.id === id ? { ...client, ...c } : client));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  }, []);

  // ── Services ──
  const addService = useCallback((s: Omit<Service, "id">): Service => {
    const svc: Service = { id: uuid(), ...s };
    setServices(prev => [...prev, svc]);
    return svc;
  }, []);

  const updateService = useCallback((id: string, s: Partial<Omit<Service, "id">>) => {
    setServices(prev => prev.map(svc => svc.id === id ? { ...svc, ...s } : svc));
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices(prev => prev.filter(svc => svc.id !== id));
  }, []);

  // ── Work Orders ──
  const addWorkOrder = useCallback((wo: Omit<WorkOrder, "id">): WorkOrder => {
    let newOrder: WorkOrder | null = null;
    setOrderCounter(prev => {
      const counter = prev + 1;
      newOrder = { id: uuid(), ...wo, orderNumber: wo.orderNumber || counter };
      return counter;
    });
    // Because setState is async, we create the object directly
    const order: WorkOrder = { id: uuid(), ...wo };
    setWorkOrders(prev => {
      const num = wo.orderNumber || prev.length + 1;
      const o: WorkOrder = { id: order.id, ...wo, orderNumber: num };
      return [...prev, o];
    });
    return order;
  }, []);

  const updateWorkOrder = useCallback((id: string, wo: Partial<Omit<WorkOrder, "id">>) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? { ...o, ...wo } : o));
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders(prev => prev.filter(o => o.id !== id));
    setWorkOrderItems(prev => prev.filter(i => i.workOrderId !== id));
  }, []);

  // ── Work Order Items ──
  const getWorkOrderItems = useCallback((workOrderId: string): WorkOrderItem[] => {
    return workOrderItems.filter(i => i.workOrderId === workOrderId);
  }, [workOrderItems]);

  const addWorkOrderItem = useCallback((i: Omit<WorkOrderItem, "id">): WorkOrderItem => {
    const item: WorkOrderItem = { id: uuid(), ...i };
    setWorkOrderItems(prev => [...prev, item]);
    return item;
  }, []);

  const deleteWorkOrderItem = useCallback((id: string) => {
    setWorkOrderItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── Appointments ──
  const addAppointment = useCallback((a: Omit<Appointment, "id">): Appointment => {
    const appt: Appointment = { id: uuid(), ...a };
    setAppointments(prev => [...prev, appt]);
    return appt;
  }, []);

  const updateAppointment = useCallback((id: string, a: Partial<Omit<Appointment, "id">>) => {
    setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, ...a } : appt));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(appt => appt.id !== id));
  }, []);

  // ── Transactions ──
  const addTransaction = useCallback((t: Omit<Transaction, "id">): Transaction => {
    const txn: Transaction = { id: uuid(), ...t };
    setTransactions(prev => [...prev, txn]);
    return txn;
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Salary Payments ──
  const addSalaryPayment = useCallback((s: Omit<SalaryPayment, "id">): SalaryPayment => {
    const sp: SalaryPayment = { id: uuid(), ...s };
    setSalaryPayments(prev => [...prev, sp]);
    return sp;
  }, []);

  const updateSalaryPayment = useCallback((id: string, s: Partial<Omit<SalaryPayment, "id">>) => {
    setSalaryPayments(prev => prev.map(sp => sp.id === id ? { ...sp, ...s } : sp));
  }, []);

  // ── Messages ──
  const addMessage = useCallback((m: Omit<Message, "id">): Message => {
    const msg: Message = { id: uuid(), ...m };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const updateMessage = useCallback((id: string, m: Partial<Omit<Message, "id">>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...m } : msg));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // ── Stats ──
  const getStats = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return {
      totalClients: clients.length,
      totalOrders: workOrders.length,
      activeOrders: workOrders.filter(o => o.status === "in_progress").length,
      todayAppointments: appointments.filter(a => a.date === today).length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [clients, workOrders, appointments, transactions]);

  // ── Bonus By Manager ──
  const getBonusByManager = useCallback(
    (period: string): Record<string, { ordersTotal: number; ordersCount: number; bonusAmount: number }> => {
      const result: Record<string, { ordersTotal: number; ordersCount: number; bonusAmount: number }> = {};
      const managers = employees.filter(e => e.role === "manager" && e.bonusPercent > 0);

      managers.forEach(mgr => {
        // Filter completed orders where this manager is the managerId in the given period
        const mgrOrders = workOrders.filter(o => {
          if (o.managerId !== mgr.id) return false;
          if (o.status !== "done") return false;
          // period is "YYYY-MM", check if order date starts with it
          return o.date.startsWith(period);
        });

        const ordersTotal = mgrOrders.reduce((s, o) => s + o.totalPrice, 0);
        const bonusAmount = Math.round((ordersTotal * mgr.bonusPercent) / 100);
        result[mgr.id] = {
          ordersTotal,
          ordersCount: mgrOrders.length,
          bonusAmount,
        };
      });

      return result;
    },
    [employees, workOrders]
  );

  const value: DataContextType = {
    employees,
    clients,
    services,
    workOrders,
    workOrderItems,
    appointments,
    transactions,
    salaryPayments,
    messages,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addClient,
    updateClient,
    deleteClient,
    addService,
    updateService,
    deleteService,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    getWorkOrderItems,
    addWorkOrderItem,
    deleteWorkOrderItem,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addTransaction,
    deleteTransaction,
    addSalaryPayment,
    updateSalaryPayment,
    addMessage,
    updateMessage,
    deleteMessage,
    getStats,
    getBonusByManager,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
