import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const contentItems = pgTable('content_items', {
  id: serial('id').primaryKey(),
  userType: text('user_type').notNull(),
  ageGroup: text('age_group'),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  ctaLabel: text('cta_label'),
  ctaUrl: text('cta_url'),
  icon: text('icon'),
  priority: integer('priority').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const ads = pgTable('ads', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  advertiser: text('advertiser').notNull(),
  body: text('body').notNull(),
  ctaLabel: text('cta_label'),
  ctaUrl: text('cta_url'),
  userType: text('user_type'),
  ageGroup: text('age_group'),
  accent: text('accent').notNull().default('primary'),
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const connectionSessions = pgTable('connection_sessions', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userType: text('user_type').notNull(),
  ageGroup: text('age_group'),
  rankName: text('rank_name').notNull().default('Wanderers Taxi Rank'),
  device: text('device'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const engagementEvents = pgTable('engagement_events', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userType: text('user_type').notNull(),
  ageGroup: text('age_group'),
  eventType: text('event_type').notNull(),
  target: text('target'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const incidentReports = pgTable('incident_reports', {
  id: serial('id').primaryKey(),
  reporterType: text('reporter_type').notNull(),
  rankName: text('rank_name').notNull().default('Wanderers Taxi Rank'),
  category: text('category').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull().default('medium'),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const vendorApplications = pgTable('vendor_applications', {
  id: serial('id').primaryKey(),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  category: text('category').notNull(),
  phone: text('phone'),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  audience: text('audience').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  level: text('level').notNull().default('info'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------- Better Auth (admin accounts) ----------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('operations'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// ---------- Admin analytics & finance ----------

export const visitorEvents = pgTable('visitor_events', {
  id: serial('id').primaryKey(),
  visitorId: text('visitor_id').notNull(),
  eventType: text('event_type').notNull(),
  path: text('path'),
  userType: text('user_type'),
  ageGroup: text('age_group'),
  referrer: text('referrer'),
  device: text('device'),
  rankName: text('rank_name').notNull().default('Wanderers Taxi Rank'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  source: text('source').notNull(),
  advertiser: text('advertiser'),
  adId: integer('ad_id'),
  userType: text('user_type'),
  ageGroup: text('age_group'),
  category: text('category'),
  rankName: text('rank_name').notNull().default('Wanderers Taxi Rank'),
  status: text('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  commissionRate: numeric('commission_rate').notNull().default('0'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  partnerId: integer('partner_id'),
  partnerName: text('partner_name').notNull(),
  description: text('description'),
  amount: numeric('amount').notNull().default('0'),
  commissionRate: numeric('commission_rate').notNull().default('0'),
  commissionAmount: numeric('commission_amount').notNull().default('0'),
  category: text('category'),
  saleDate: date('sale_date').notNull().defaultNow(),
  recordedBy: text('recorded_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  description: text('description'),
  amount: numeric('amount').notNull().default('0'),
  expenseDate: date('expense_date').notNull().defaultNow(),
  recordedBy: text('recorded_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Each paid Wi-Fi connection (R7) at the rank. Deduplicated per device per day
// via a unique (device_id, connection_date) constraint, so a returning client
// in the same day is never counted twice in financials.
export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  connectionDate: date('connection_date').notNull().defaultNow(),
  amount: numeric('amount').notNull().default('7'),
  rankName: text('rank_name').notNull().default('Wanderers Taxi Rank'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: text('actor_id'),
  actorEmail: text('actor_email'),
  action: text('action').notNull(),
  detail: text('detail'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type ContentItem = typeof contentItems.$inferSelect
export type Ad = typeof ads.$inferSelect
export type IncidentReport = typeof incidentReports.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type VendorApplication = typeof vendorApplications.$inferSelect
export type Lead = typeof leads.$inferSelect
export type Partner = typeof partners.$inferSelect
export type Sale = typeof sales.$inferSelect
export type Expense = typeof expenses.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect
export type Connection = typeof connections.$inferSelect
