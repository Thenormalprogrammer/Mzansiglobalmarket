import { 
  type User, 
  type InsertUser,
  type Supplier,
  type InsertSupplier,
  type UpdateSupplierVerification,
  type Product,
  type InsertProduct,
  type RFQ,
  type InsertRFQ,
  type Message,
  type InsertMessage,
  type CmsPage,
  type InsertCmsPage,
  type UpdateCmsPage,
  type FaqItem,
  type InsertFaqItem,
  type UpdateFaqItem,
  type SiteSetting,
  type InsertSiteSetting,
  type RestrictProduct,
  type Category,
  type InsertCategory,
  type UpdateCategory,
  type ContactSubmission,
  type InsertContactSubmission,
  type ProductView,
  type InsertProductView,
  type BrowsingHistory,
  type InsertBrowsingHistory,
  type ShippingService,
  type InsertShippingService,
  type ShippingQuoteRequest,
  type InsertShippingQuoteRequest,
  type CustomsTariff,
  type InsertCustomsTariff,
  type UpdateUserProfile,
  users,
  suppliers,
  products,
  rfqs,
  messages,
  cmsPages,
  faqItems,
  siteSettings,
  categories,
  contactSubmissions,
  productViews,
  browsingHistory,
  shippingServices,
  shippingQuoteRequests,
  customsTariffs,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  getVerifiedSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  updateSupplierVerification(id: number, data: UpdateSupplierVerification): Promise<Supplier | undefined>;
  submitSupplierForVerification(id: number): Promise<Supplier | undefined>;
  verifySupplier(id: number, verified: boolean, notes?: string): Promise<Supplier | undefined>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductsBySupplierId(supplierId: number): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // RFQ operations
  getRFQ(id: number): Promise<RFQ | undefined>;
  getRFQsByBuyerId(buyerId: number): Promise<RFQ[]>;
  getAllRFQs(): Promise<RFQ[]>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQStatus(id: number, status: string): Promise<RFQ | undefined>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  // CMS Page operations
  getCmsPage(slug: string): Promise<CmsPage | undefined>;
  getAllCmsPages(): Promise<CmsPage[]>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(slug: string, data: UpdateCmsPage, updatedBy?: number): Promise<CmsPage | undefined>;
  deleteCmsPage(slug: string): Promise<boolean>;

  // FAQ operations
  getFaqItem(id: number): Promise<FaqItem | undefined>;
  getAllFaqItems(): Promise<FaqItem[]>;
  getPublishedFaqItems(): Promise<FaqItem[]>;
  createFaqItem(faq: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, data: UpdateFaqItem): Promise<FaqItem | undefined>;
  deleteFaqItem(id: number): Promise<boolean>;

  // Site settings operations
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  upsertSiteSetting(key: string, value: any, updatedBy?: number): Promise<SiteSetting>;

  // Product moderation operations
  getPublicProducts(): Promise<Product[]>;
  getRestrictedProducts(): Promise<Product[]>;
  restrictProduct(id: number, data: RestrictProduct, restrictedBy: number): Promise<Product | undefined>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  getActiveCategories(): Promise<Category[]>;
  getTopLevelCategories(): Promise<Category[]>;
  getSubcategories(parentId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Contact submission operations
  createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  getUnreadContactSubmissions(): Promise<ContactSubmission[]>;
  markContactAsRead(id: number): Promise<ContactSubmission | undefined>;

  // User profile operations
  updateUserProfile(id: number, data: UpdateUserProfile): Promise<User | undefined>;
  updateUserVerification(id: number, code: string, expiry: Date): Promise<User | undefined>;
  verifyUserEmail(id: number): Promise<User | undefined>;
  
  // Password reset operations
  setPasswordResetCode(email: string, code: string, expiry: Date): Promise<User | undefined>;
  verifyPasswordResetCode(email: string, code: string): Promise<User | undefined>;
  updatePassword(userId: number, hashedPassword: string): Promise<User | undefined>;
  clearPasswordResetCode(userId: number): Promise<void>;

  // Product view operations
  trackProductView(view: InsertProductView): Promise<ProductView>;
  getProductViewCount(productId: number): Promise<number>;
  getTrendingProducts(limit?: number): Promise<{ productId: number; viewCount: number }[]>;

  // Browsing history operations
  addToBrowsingHistory(userId: number, productId: number): Promise<BrowsingHistory>;
  getBrowsingHistory(userId: number, limit?: number): Promise<BrowsingHistory[]>;
  getRelatedProducts(productId: number, limit?: number): Promise<{ productId: number; score: number }[]>;

  // Shipping service operations
  getShippingService(id: number): Promise<ShippingService | undefined>;
  getAllShippingServices(): Promise<ShippingService[]>;
  getActiveShippingServices(): Promise<ShippingService[]>;
  createShippingService(service: InsertShippingService): Promise<ShippingService>;

  // Shipping quote request operations
  createShippingQuoteRequest(request: InsertShippingQuoteRequest): Promise<ShippingQuoteRequest>;
  getShippingQuoteRequests(buyerId: number): Promise<ShippingQuoteRequest[]>;
  updateShippingQuoteStatus(id: number, status: string, quotedAmount?: string): Promise<ShippingQuoteRequest | undefined>;

  // Customs tariff operations
  getCustomsTariff(hsCode: string): Promise<CustomsTariff | undefined>;
  getAllCustomsTariffs(): Promise<CustomsTariff[]>;
  createCustomsTariff(tariff: InsertCustomsTariff): Promise<CustomsTariff>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.userId, userId));
    return supplier;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getVerifiedSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers)
      .where(eq(suppliers.isVerified, true))
      .orderBy(desc(suppliers.createdAt));
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(insertSupplier).returning();
    return supplier;
  }

  async updateSupplier(id: number, updateData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [supplier] = await db.update(suppliers)
      .set(updateData)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async updateSupplierVerification(id: number, data: UpdateSupplierVerification): Promise<Supplier | undefined> {
    const [supplier] = await db.update(suppliers)
      .set(data)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async submitSupplierForVerification(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.update(suppliers)
      .set({ verificationStatus: "submitted" })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async verifySupplier(id: number, verified: boolean, notes?: string): Promise<Supplier | undefined> {
    const [supplier] = await db.update(suppliers)
      .set({
        isVerified: verified,
        verificationStatus: verified ? "verified" : "rejected",
        verificationNotes: notes || null,
      })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsBySupplierId(supplierId: number): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.supplierId, supplierId))
      .orderBy(desc(products.createdAt));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.category, category))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // RFQ operations
  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }

  async getRFQsByBuyerId(buyerId: number): Promise<RFQ[]> {
    return await db.select().from(rfqs)
      .where(eq(rfqs.buyerId, buyerId))
      .orderBy(desc(rfqs.createdAt));
  }

  async getAllRFQs(): Promise<RFQ[]> {
    return await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));
  }

  async createRFQ(insertRfq: InsertRFQ): Promise<RFQ> {
    const [rfq] = await db.insert(rfqs).values(insertRfq).returning();
    return rfq;
  }

  async updateRFQStatus(id: number, status: string): Promise<RFQ | undefined> {
    const [rfq] = await db.update(rfqs)
      .set({ status })
      .where(eq(rfqs.id, id))
      .returning();
    return rfq;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [message] = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  // CMS Page operations
  async getCmsPage(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page;
  }

  async getAllCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(asc(cmsPages.title));
  }

  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const [newPage] = await db.insert(cmsPages).values(page).returning();
    return newPage;
  }

  async updateCmsPage(slug: string, data: UpdateCmsPage, updatedBy?: number): Promise<CmsPage | undefined> {
    const [page] = await db.update(cmsPages)
      .set({
        ...data,
        updatedBy: updatedBy || null,
        updatedAt: new Date(),
      })
      .where(eq(cmsPages.slug, slug))
      .returning();
    return page;
  }

  async deleteCmsPage(slug: string): Promise<boolean> {
    const result = await db.delete(cmsPages).where(eq(cmsPages.slug, slug));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // FAQ operations
  async getFaqItem(id: number): Promise<FaqItem | undefined> {
    const [faq] = await db.select().from(faqItems).where(eq(faqItems.id, id));
    return faq;
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).orderBy(asc(faqItems.sortOrder), desc(faqItems.createdAt));
  }

  async getPublishedFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems)
      .where(eq(faqItems.isPublished, true))
      .orderBy(asc(faqItems.sortOrder), desc(faqItems.createdAt));
  }

  async createFaqItem(faq: InsertFaqItem): Promise<FaqItem> {
    const [newFaq] = await db.insert(faqItems).values(faq).returning();
    return newFaq;
  }

  async updateFaqItem(id: number, data: UpdateFaqItem): Promise<FaqItem | undefined> {
    const [faq] = await db.update(faqItems)
      .set(data)
      .where(eq(faqItems.id, id))
      .returning();
    return faq;
  }

  async deleteFaqItem(id: number): Promise<boolean> {
    const result = await db.delete(faqItems).where(eq(faqItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Site settings operations
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async upsertSiteSetting(key: string, value: any, updatedBy?: number): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(key);
    if (existing) {
      const [setting] = await db.update(siteSettings)
        .set({ value, updatedBy: updatedBy || null, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db.insert(siteSettings)
        .values({ key, value, updatedBy: updatedBy || null })
        .returning();
      return setting;
    }
  }

  // Product moderation operations
  async getPublicProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isRestricted, false))
      .orderBy(desc(products.createdAt));
  }

  async getRestrictedProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isRestricted, true))
      .orderBy(desc(products.restrictedAt));
  }

  async restrictProduct(id: number, data: RestrictProduct, restrictedBy: number): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set({
        isRestricted: data.isRestricted,
        restrictionReason: data.restrictionReason || null,
        restrictedAt: data.isRestricted ? new Date() : null,
        restrictedBy: data.isRestricted ? restrictedBy : null,
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  async getActiveCategories(): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  async getTopLevelCategories(): Promise<Category[]> {
    return await db.select().from(categories)
      .where(sql`${categories.parentId} IS NULL`)
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  async getSubcategories(parentId: number): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.parentId, parentId))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, data: UpdateCategory): Promise<Category | undefined> {
    const [category] = await db.update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Contact submission operations
  async createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db.insert(contactSubmissions).values(contact).returning();
    return submission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async getUnreadContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions)
      .where(eq(contactSubmissions.isRead, false))
      .orderBy(desc(contactSubmissions.createdAt));
  }

  async markContactAsRead(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db.update(contactSubmissions)
      .set({ isRead: true })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return submission;
  }

  // User profile operations
  async updateUserProfile(id: number, data: UpdateUserProfile): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserVerification(id: number, code: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ verificationCode: code, verificationCodeExpiry: expiry })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyUserEmail(id: number): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isEmailVerified: true, verificationCode: null, verificationCodeExpiry: null })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Password reset operations
  async setPasswordResetCode(email: string, code: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ passwordResetCode: code, passwordResetExpiry: expiry })
      .where(eq(users.email, email))
      .returning();
    return user;
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(
        eq(users.email, email),
        eq(users.passwordResetCode, code),
        gt(users.passwordResetExpiry, new Date())
      ));
    return user;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async clearPasswordResetCode(userId: number): Promise<void> {
    await db.update(users)
      .set({ passwordResetCode: null, passwordResetExpiry: null })
      .where(eq(users.id, userId));
  }

  // Product view operations
  async trackProductView(view: InsertProductView): Promise<ProductView> {
    const [productView] = await db.insert(productViews).values(view).returning();
    return productView;
  }

  async getProductViewCount(productId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(productViews)
      .where(eq(productViews.productId, productId));
    return result[0]?.count || 0;
  }

  async getTrendingProducts(limitParam: number = 10): Promise<{ productId: number; viewCount: number }[]> {
    // Ensure limit is a valid positive integer
    let safeLimit = 10;
    if (typeof limitParam === 'number' && Number.isFinite(limitParam)) {
      safeLimit = Math.max(1, Math.min(Math.floor(limitParam), 100));
    }
    
    try {
      // Get all product views and count them manually
      const allViews = await db.select().from(productViews);
      
      if (allViews.length === 0) {
        return [];
      }
      
      // Calculate views in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Group by product ID and count
      const viewCounts = new Map<number, number>();
      for (const view of allViews) {
        if (view.viewedAt && view.viewedAt >= sevenDaysAgo) {
          viewCounts.set(view.productId, (viewCounts.get(view.productId) || 0) + 1);
        }
      }
      
      // Convert to array and sort by count
      const result = Array.from(viewCounts.entries())
        .map(([productId, viewCount]) => ({ productId, viewCount }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, safeLimit);
      
      return result;
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  // Browsing history operations
  async addToBrowsingHistory(userId: number, productId: number): Promise<BrowsingHistory> {
    // Check if entry exists
    const [existing] = await db.select().from(browsingHistory)
      .where(and(eq(browsingHistory.userId, userId), eq(browsingHistory.productId, productId)));
    
    if (existing) {
      const [updated] = await db.update(browsingHistory)
        .set({ viewCount: existing.viewCount + 1, lastViewedAt: new Date() })
        .where(eq(browsingHistory.id, existing.id))
        .returning();
      return updated;
    }

    const [history] = await db.insert(browsingHistory)
      .values({ userId, productId })
      .returning();
    return history;
  }

  async getBrowsingHistory(userId: number, limit: number = 20): Promise<BrowsingHistory[]> {
    return await db.select().from(browsingHistory)
      .where(eq(browsingHistory.userId, userId))
      .orderBy(desc(browsingHistory.lastViewedAt))
      .limit(limit);
  }

  async getRelatedProducts(productId: number, limit: number = 10): Promise<{ productId: number; score: number }[]> {
    // Find users who viewed this product
    // Then find what other products they viewed
    const safeLimit = Math.max(1, Math.min(isNaN(limit) ? 10 : limit, 100));
    const result = await db.execute(sql`
      SELECT bh2.product_id as "productId", CAST(COUNT(*) as INTEGER) as score
      FROM browsing_history bh1
      JOIN browsing_history bh2 ON bh1.user_id = bh2.user_id
      WHERE bh1.product_id = ${productId}
        AND bh2.product_id != ${productId}
      GROUP BY bh2.product_id
      ORDER BY COUNT(*) DESC
      LIMIT ${safeLimit}
    `);
    return result.rows as { productId: number; score: number }[];
  }

  // Shipping service operations
  async getShippingService(id: number): Promise<ShippingService | undefined> {
    const [service] = await db.select().from(shippingServices).where(eq(shippingServices.id, id));
    return service;
  }

  async getAllShippingServices(): Promise<ShippingService[]> {
    return await db.select().from(shippingServices).orderBy(asc(shippingServices.name));
  }

  async getActiveShippingServices(): Promise<ShippingService[]> {
    return await db.select().from(shippingServices)
      .where(eq(shippingServices.isActive, true))
      .orderBy(asc(shippingServices.name));
  }

  async createShippingService(service: InsertShippingService): Promise<ShippingService> {
    const [newService] = await db.insert(shippingServices).values(service).returning();
    return newService;
  }

  // Shipping quote request operations
  async createShippingQuoteRequest(request: InsertShippingQuoteRequest): Promise<ShippingQuoteRequest> {
    const [quoteRequest] = await db.insert(shippingQuoteRequests).values(request).returning();
    return quoteRequest;
  }

  async getShippingQuoteRequests(buyerId: number): Promise<ShippingQuoteRequest[]> {
    return await db.select().from(shippingQuoteRequests)
      .where(eq(shippingQuoteRequests.buyerId, buyerId))
      .orderBy(desc(shippingQuoteRequests.createdAt));
  }

  async updateShippingQuoteStatus(id: number, status: string, quotedAmount?: string): Promise<ShippingQuoteRequest | undefined> {
    const [request] = await db.update(shippingQuoteRequests)
      .set({ status, quotedAmount })
      .where(eq(shippingQuoteRequests.id, id))
      .returning();
    return request;
  }

  // Customs tariff operations
  async getCustomsTariff(hsCode: string): Promise<CustomsTariff | undefined> {
    const [tariff] = await db.select().from(customsTariffs).where(eq(customsTariffs.hsCode, hsCode));
    return tariff;
  }

  async getAllCustomsTariffs(): Promise<CustomsTariff[]> {
    return await db.select().from(customsTariffs).orderBy(asc(customsTariffs.hsCode));
  }

  async createCustomsTariff(tariff: InsertCustomsTariff): Promise<CustomsTariff> {
    const [newTariff] = await db.insert(customsTariffs).values(tariff).returning();
    return newTariff;
  }
}

export const storage = new DatabaseStorage();
