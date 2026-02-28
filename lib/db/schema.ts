import { sqliteTable, text, integer, unique, primaryKey, index, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["CEO", "ARCHITECT", "COMMERCIAL", "ADMIN"] }).notNull(),
  phone: text("phone"),
  isAvailableEarly: integer("is_available_early", { mode: "boolean" }).default(false),
  pushSubscription: text("push_subscription"),
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

export const proyectos = sqliteTable("proyectos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  codigo: text("codigo").notNull().unique(),
  driveFolderLink: text("drive_folder_link"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const proyectosRelations = relations(proyectos, ({ many }) => ({
  archivos: many(archivosProyectos),
}));

export const archivosProyectos = sqliteTable("archivos_proyectos", {
  id: text("id").primaryKey(),
  proyectoId: text("proyecto_id").notNull().references(() => proyectos.id, { onDelete: "cascade" }),
  etiqueta: text("etiqueta"),
  descripcion: text("descripcion"),
  driveFileLink: text("drive_file_link").notNull(),
  pesoKb: integer("peso_kb"),
  prioridad: integer("prioridad").default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const archivosProyectosRelations = relations(archivosProyectos, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [archivosProyectos.proyectoId],
    references: [proyectos.id],
  }),
}));

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  kommoId: text("kommo_id").unique().notNull(),
  brand: text("brand", { enum: ["AZUR", "COCINAPRO"] }).notNull(),
  category: text("category", { enum: [
    'SERVICE_OFFER', 
    'JOB_CANDIDATE', 
    'NO_RESPONSE', 
    'NOT_INTERESTED', 
    'CONFUSED', 
    'POTENTIAL_CLIENT',
    'MANUAL_FOLLOW_UP'
  ] }).notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone"), // Nuevo campo celular
  leadEntryDate: text("lead_entry_date"), // Nuevo campo fecha ingreso manual
  status: text("status", { enum: ['PENDING', 'ARCHIVED', 'WAITING_FOR_DATE', 'SCHEDULED', 'ON_HOLD', 'IN_EXECUTION'] }).default('PENDING'),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  brandIdx: index("idx_leads_brand").on(table.brand),
  categoryIdx: index("idx_leads_category").on(table.category),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  prospect: one(clientProspects, {
    fields: [leads.id],
    references: [clientProspects.leadId],
  }),
  businessResource: one(businessResources, {
    fields: [leads.id],
    references: [businessResources.leadId],
  }),
  discardReason: one(leadDiscardReasons, {
    fields: [leads.id],
    references: [leadDiscardReasons.leadId],
  }),
}));

export const clientProspects = sqliteTable("client_prospects", {
  leadId: text("lead_id").primaryKey().references(() => leads.id, { onDelete: "cascade" }),
  address: text("address"),
  squareMeters: real("square_meters"),
  materials: text("materials"),
  hasBlueprints: integer("has_blueprints", { mode: "boolean" }).default(false),
  requirementsDetail: text("requirements_detail"),
});

export const clientProspectsRelations = relations(clientProspects, ({ one }) => ({
  lead: one(leads, {
    fields: [clientProspects.leadId],
    references: [leads.id],
  }),
}));

export const businessResources = sqliteTable("business_resources", {
  leadId: text("lead_id").primaryKey().references(() => leads.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  offerDetails: text("offer_details"),
  cvAnalysisSummary: text("cv_analysis_summary"),
  fileUrl: text("file_url"),
});

export const businessResourcesRelations = relations(businessResources, ({ one }) => ({
  lead: one(leads, {
    fields: [businessResources.leadId],
    references: [leads.id],
  }),
}));

export const leadDiscardReasons = sqliteTable("lead_discard_reasons", {
  leadId: text("lead_id").primaryKey().references(() => leads.id, { onDelete: "cascade" }),
  reasonDetail: text("reason_detail"),
});

export const leadDiscardReasonsRelations = relations(leadDiscardReasons, ({ one }) => ({
  lead: one(leads, {
    fields: [leadDiscardReasons.leadId],
    references: [leads.id],
  }),
}));
