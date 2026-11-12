import { pgTable, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'supplier' or 'buyer'
  name: text("name").notNull(),
  phone: text("phone"),
  // Email verification
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  // Password reset
  passwordResetCode: text("password_reset_code"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  logo: text("logo"),
  location: text("location").notNull(),
  yearsInBusiness: integer("years_in_business").notNull(),
  categories: text("categories").array().notNull(),
  description: text("description"),
  // Contact details
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  whatsappNumber: text("whatsapp_number"),
  // Verification documents
  businessRegistrationDoc: text("business_registration_doc"),
  taxComplianceDoc: text("tax_compliance_doc"),
  proofOfResidenceDoc: text("proof_of_residence_doc"),
  bankAccountDoc: text("bank_account_doc"),
  // Verification status
  verificationStatus: text("verification_status").default("pending").notNull(), // 'pending', 'submitted', 'verified', 'rejected'
  verificationNotes: text("verification_notes"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isGoldSupplier: boolean("is_gold_supplier").default(false).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  responseRate: text("response_rate").default("0%"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  images: text("images").array().notNull(),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }).notNull(),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }).notNull(),
  moq: text("moq").notNull(), // Minimum Order Quantity
  specifications: jsonb("specifications"),
  isHot: boolean("is_hot").default(false).notNull(),
  // Moderation fields
  isRestricted: boolean("is_restricted").default(false).notNull(),
  restrictionReason: text("restriction_reason"),
  restrictedAt: timestamp("restricted_at"),
  restrictedBy: integer("restricted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rfqs = pgTable("rfqs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  productName: text("product_name").notNull(),
  category: text("category").notNull(),
  quantity: text("quantity").notNull(),
  targetPrice: text("target_price"),
  deliveryDate: text("delivery_date"),
  specifications: text("specifications"),
  attachments: text("attachments").array(),
  status: text("status").default("open").notNull(), // 'open', 'quoted', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CMS Pages for editable website content
export const cmsPages = pgTable("cms_pages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(), // 'terms', 'privacy', 'about', 'faq'
  title: text("title").notNull(),
  content: text("content").notNull(), // Rich HTML content
  metaTitle: text("meta_title"), // SEO title
  metaDescription: text("meta_description"), // SEO description
  isPublished: boolean("is_published").default(true).notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// FAQ items for structured FAQ management
export const faqItems = pgTable("faq_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"), // Optional grouping
  sortOrder: integer("sort_order").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Site settings for managing homepage images and other dynamic content
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(), // 'hero_image', 'category_images', etc.
  value: jsonb("value").notNull(), // Flexible JSON structure for different setting types
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories for product organization with parent-child relationships
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: integer("parent_id"), // Self-reference for subcategories (null = top-level)
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact submissions from contact us form
export const contactSubmissions = pgTable("contact_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  complaintType: text("complaint_type").notNull(), // 'support', 'abuse', 'sales'
  userType: text("user_type").notNull(), // 'buyer', 'supplier'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product views for tracking and recommendations
export const productViews = pgTable("product_views", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  sessionId: text("session_id"), // For anonymous tracking
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// User browsing history
export const browsingHistory = pgTable("browsing_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  viewCount: integer("view_count").default(1).notNull(),
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
});

// Shipping services
export const shippingServices = pgTable("shipping_services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  estimatedDays: text("estimated_days").notNull(),
  baseRate: decimal("base_rate", { precision: 10, scale: 2 }).notNull(),
  ratePerKg: decimal("rate_per_kg", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shipping quote requests
export const shippingQuoteRequests = pgTable("shipping_quote_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  shippingServiceId: integer("shipping_service_id").references(() => shippingServices.id),
  destinationAddress: text("destination_address").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationCountry: text("destination_country").notNull(),
  quantity: integer("quantity").notNull(),
  estimatedWeight: decimal("estimated_weight", { precision: 10, scale: 2 }),
  status: text("status").default("pending").notNull(), // 'pending', 'quoted', 'accepted', 'rejected'
  quotedAmount: decimal("quoted_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customs tariffs for calculator
export const customsTariffs = pgTable("customs_tariffs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  hsCode: text("hs_code").notNull(),
  description: text("description").notNull(),
  dutyRate: decimal("duty_rate", { precision: 5, scale: 2 }).notNull(), // Percentage
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15.00").notNull(), // SA VAT 15%
  surchargeRate: decimal("surcharge_rate", { precision: 5, scale: 2 }).default("0.00"),
  region: text("region").default("ZA").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.string(),
  name: z.string().min(1),
});

export const insertSupplierSchema = z.object({
  userId: z.number(),
  companyName: z.string().min(1),
  logo: z.string().optional(),
  location: z.string().min(1),
  yearsInBusiness: z.number(),
  categories: z.array(z.string()),
  description: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  businessRegistrationDoc: z.string().optional(),
  taxComplianceDoc: z.string().optional(),
  proofOfResidenceDoc: z.string().optional(),
  bankAccountDoc: z.string().optional(),
});

export const updateSupplierVerificationSchema = z.object({
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  businessRegistrationDoc: z.string().optional(),
  taxComplianceDoc: z.string().optional(),
  proofOfResidenceDoc: z.string().optional(),
  bankAccountDoc: z.string().optional(),
});

export const insertProductSchema = z.object({
  supplierId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  images: z.array(z.string()),
  priceMin: z.string(),
  priceMax: z.string(),
  moq: z.string(),
  specifications: z.any().optional(),
});

export const updateProductSchema = insertProductSchema.omit({
  supplierId: true,
}).partial();

export const insertRfqSchema = z.object({
  buyerId: z.number(),
  productName: z.string().min(1),
  category: z.string().min(1),
  quantity: z.string().min(1),
  targetPrice: z.string().optional(),
  deliveryDate: z.string().optional(),
  specifications: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const insertMessageSchema = z.object({
  senderId: z.number(),
  receiverId: z.number(),
  productId: z.number().optional(),
  rfqId: z.number().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const insertCmsPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const updateCmsPageSchema = insertCmsPageSchema.omit({ slug: true }).partial();

export const insertFaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  sortOrder: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export const updateFaqItemSchema = insertFaqItemSchema.partial();

export const insertSiteSettingSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export const updateSiteSettingSchema = z.object({
  value: z.any(),
});

export const restrictProductSchema = z.object({
  isRestricted: z.boolean(),
  restrictionReason: z.string().optional(),
});

export const insertContactSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  complaintType: z.enum(["support", "abuse", "sales"]),
  userType: z.enum(["buyer", "supplier"]),
  message: z.string().min(10),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = insertCategorySchema.partial();

// Product view tracking schema
export const insertProductViewSchema = z.object({
  userId: z.number().optional(),
  productId: z.number(),
  sessionId: z.string().optional(),
});

// Browsing history schema
export const insertBrowsingHistorySchema = z.object({
  userId: z.number(),
  productId: z.number(),
});

// Shipping service schemas
export const insertShippingServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  estimatedDays: z.string().min(1),
  baseRate: z.string(),
  ratePerKg: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Shipping quote request schema
export const insertShippingQuoteRequestSchema = z.object({
  buyerId: z.number(),
  productId: z.number().optional(),
  shippingServiceId: z.number().optional(),
  destinationAddress: z.string().min(1),
  destinationCity: z.string().min(1),
  destinationCountry: z.string().min(1),
  quantity: z.number().min(1),
  estimatedWeight: z.string().optional(),
  notes: z.string().optional(),
});

// Customs tariff schema
export const insertCustomsTariffSchema = z.object({
  hsCode: z.string().min(1),
  description: z.string().min(1),
  dutyRate: z.string(),
  vatRate: z.string().optional(),
  surchargeRate: z.string().optional(),
  region: z.string().optional(),
});

// User profile update schema (for buyers)
export const updateUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type UpdateSupplierVerification = z.infer<typeof updateSupplierVerificationSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type RFQ = typeof rfqs.$inferSelect;
export type InsertRFQ = z.infer<typeof insertRfqSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type UpdateCmsPage = z.infer<typeof updateCmsPageSchema>;

export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type UpdateFaqItem = z.infer<typeof updateFaqItemSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type UpdateSiteSetting = z.infer<typeof updateSiteSettingSchema>;
export type RestrictProduct = z.infer<typeof restrictProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type ProductView = typeof productViews.$inferSelect;
export type InsertProductView = z.infer<typeof insertProductViewSchema>;

export type BrowsingHistory = typeof browsingHistory.$inferSelect;
export type InsertBrowsingHistory = z.infer<typeof insertBrowsingHistorySchema>;

export type ShippingService = typeof shippingServices.$inferSelect;
export type InsertShippingService = z.infer<typeof insertShippingServiceSchema>;

export type ShippingQuoteRequest = typeof shippingQuoteRequests.$inferSelect;
export type InsertShippingQuoteRequest = z.infer<typeof insertShippingQuoteRequestSchema>;

export type CustomsTariff = typeof customsTariffs.$inferSelect;
export type InsertCustomsTariff = z.infer<typeof insertCustomsTariffSchema>;

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type VerifyEmail = z.infer<typeof verifyEmailSchema>;
