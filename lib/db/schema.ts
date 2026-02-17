import { sqliteTable, text, integer, unique, primaryKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["CEO", "ARCHITECT", "COMMERCIAL", "ADMIN"] }).notNull(),
  phone: text("phone"),
  isAvailableEarly: integer("is_available_early", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  meetingsCreated: many(meetings),
  participations: many(meetingParticipants),
  messages: many(messages),
}));

export const availabilityRules = sqliteTable("availability_rules", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 1 to 7
  startTime: text("start_time").notNull(), // "HH:MM"
  endTime: text("end_time").notNull(),   // "HH:MM"
}, (table) => ({
  unq: unique().on(table.userId, table.dayOfWeek, table.startTime),
}));

export const meetings = sqliteTable("meetings", {
  id: text("id").primaryKey(),
  clientName: text("client_name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  startDatetime: text("start_datetime").notNull(),
  endDatetime: text("end_datetime").notNull(),
  type: text("type", { enum: ["VIRTUAL", "PRESENCIAL"] }).default("PRESENCIAL"),
  status: text("status", { enum: ["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"] }).default("PENDIENTE"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const meetingsRelations = relations(meetings, ({ many, one }) => ({
  creator: one(users, {
    fields: [meetings.createdBy],
    references: [users.id],
  }),
  participants: many(meetingParticipants),
  messages: many(messages),
}));

export const meetingParticipants = sqliteTable("meeting_participants", {
  meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  status: text("status", { enum: ["ESPERANDO", "ACEPTADO", "RECHAZADO"] }).default("ESPERANDO"),
  notifiedAt: text("notified_at"),
}, (table) => ({
  pk: primaryKey({ columns: [table.meetingId, table.userId] }),
}));

export const meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingParticipants.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [meetingParticipants.userId],
    references: [users.id],
  }),
}));

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").default("text"), // 'text', 'image', 'system'
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  meeting: one(meetings, {
    fields: [messages.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

