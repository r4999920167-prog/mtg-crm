import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Employees ───
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(), // master, admin, manager
  phone: text("phone"),
  salary: real("salary").notNull().default(0), // fixed monthly salary
  bonusPercent: real("bonus_percent").default(0), // % of completed orders (for managers)
  active: boolean("active").notNull().default(true),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// ─── Clients ───
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  car: text("car"), // e.g. "Mercedes G-class W463"
  licensePlate: text("license_plate"),
  notes: text("notes"),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// ─── Services (price list) ───
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // ppf, tinting, detailing, tuning, audio, etc.
  price: real("price").notNull(),
  duration: integer("duration"), // estimated minutes
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// ─── Work Orders (Заказ-наряды) ───
export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: integer("order_number").notNull(),
  clientId: varchar("client_id").notNull(),
  employeeId: varchar("employee_id"), // master
  managerId: varchar("manager_id"), // manager who processed the order
  status: text("status").notNull().default("new"), // new, in_progress, done, cancelled
  date: text("date").notNull(), // ISO date string
  notes: text("notes"),
  totalPrice: real("total_price").notNull().default(0),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true });
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

// ─── Work Order Items (line items) ───
export const workOrderItems = pgTable("work_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: varchar("work_order_id").notNull(),
  serviceId: varchar("service_id"),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(),
});

export const insertWorkOrderItemSchema = createInsertSchema(workOrderItems).omit({ id: true });
export type InsertWorkOrderItem = z.infer<typeof insertWorkOrderItemSchema>;
export type WorkOrderItem = typeof workOrderItems.$inferSelect;

// ─── Appointments (Calendar) ───
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  employeeId: varchar("employee_id"),
  workOrderId: varchar("work_order_id"),
  date: text("date").notNull(), // ISO date
  timeStart: text("time_start").notNull(), // "09:00"
  timeEnd: text("time_end").notNull(), // "17:00"
  title: text("title").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  photos: text("photos"), // JSON array of photo URLs/base64
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// ─── Financial Transactions ───
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // service_payment, materials, rent, salary, other
  amount: real("amount").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  workOrderId: varchar("work_order_id"),
  employeeId: varchar("employee_id"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// ─── Salary Payments ───
export const salaryPayments = pgTable("salary_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  amount: real("amount").notNull(),
  period: text("period").notNull(), // "2026-03"
  paidDate: text("paid_date"),
  status: text("status").notNull().default("pending"), // pending, paid
});

export const insertSalaryPaymentSchema = createInsertSchema(salaryPayments).omit({ id: true });
export type InsertSalaryPayment = z.infer<typeof insertSalaryPaymentSchema>;
export type SalaryPayment = typeof salaryPayments.$inferSelect;

// ─── Messages (in-app broadcast) ───
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentDate: text("sent_date").notNull(),
  recipientType: text("recipient_type").notNull(), // all, specific
  recipientIds: text("recipient_ids"), // JSON array of client IDs (null = all)
  status: text("status").notNull().default("draft"), // draft, sent
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
