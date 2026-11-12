import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import multer from "multer";
import path from "path";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateToken,
  requireSupplier,
  requireBuyer,
  type AuthRequest 
} from "./auth";
import { 
  insertUserSchema, 
  insertSupplierSchema,
  insertProductSchema,
  updateProductSchema,
  insertRfqSchema,
  insertMessageSchema,
  insertCmsPageSchema,
  updateCmsPageSchema,
  insertFaqItemSchema,
  updateFaqItemSchema,
  restrictProductSchema,
  insertCategorySchema,
  updateCategorySchema,
  insertContactSubmissionSchema,
  insertProductViewSchema,
  insertShippingQuoteRequestSchema,
  updateUserProfileSchema,
  verifyEmailSchema,
  type InsertProduct,
  type UpdateProduct
} from "@shared/schema";
import { sendEmail, generateRFQNotificationEmail, generateMessageNotificationEmail, generateVerificationCodeEmail, generateSupplierVerificationEmail, generateVerificationCode, generatePasswordResetEmail } from "./email";
import { updateSupplierVerificationSchema } from "@shared/schema";
import fs from "fs";

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/products";
    // Try to create directory if it doesn't exist (best-effort for development)
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (err) {
      // Directory creation failed - might be in Autoscale. Fall back gracefully.
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow safe image formats (exclude SVG to prevent XSS)
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"));
    }
  },
});

// Document upload storage for verification documents
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/documents";
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (err) {
      // Directory creation failed - might be in Autoscale. Fall back gracefully.
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "application/pdf"
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF documents are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files (documents, product images, etc.)
  app.use("/uploads", express.static("uploads"));

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body) as { email: string; password: string; name: string; userType: string };
      
      // Check if user already exists
      const existingUser = await dbStorage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await dbStorage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Find user
      const user = await dbStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
        token,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Forgot password - request reset code
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user
      const user = await dbStorage.getUserByEmail(email);
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return res.json({ message: "If an account exists with this email, you will receive a password reset code." });
      }

      // Generate reset code and set expiry (15 minutes)
      const resetCode = generateVerificationCode();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      await dbStorage.setPasswordResetCode(email, resetCode, expiry);

      // Send reset email
      await sendEmail({
        to: email,
        subject: "Password Reset Request - MzansiGlobalMarket",
        html: generatePasswordResetEmail(user.name, resetCode),
      });

      res.json({ message: "If an account exists with this email, you will receive a password reset code." });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password with code
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: "Email, code, and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Verify the reset code
      const user = await dbStorage.verifyPasswordResetCode(email, code);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }

      // Hash the new password and update
      const hashedPassword = await hashPassword(newPassword);
      await dbStorage.updatePassword(user.id, hashedPassword);

      // Clear the reset code
      await dbStorage.clearPasswordResetCode(user.id);

      res.json({ message: "Password has been reset successfully. You can now login with your new password." });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Supplier routes
  app.post("/api/suppliers", authenticateToken, requireSupplier, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const supplierData = insertSupplierSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Check if supplier profile already exists
      const existing = await dbStorage.getSupplierByUserId(req.user.id);
      if (existing) {
        return res.status(400).json({ message: "Supplier profile already exists" });
      }

      const supplier = await dbStorage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/suppliers/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const supplier = await dbStorage.getSupplierByUserId(req.user.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await dbStorage.getAllSuppliers();
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await dbStorage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/suppliers/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const supplier = await dbStorage.getSupplierByUserId(userId);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/suppliers/:id", authenticateToken, requireSupplier, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const supplier = await dbStorage.getSupplier(id);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      if (supplier.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await dbStorage.updateSupplier(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get only verified suppliers (for public listing)
  app.get("/api/suppliers/verified", async (req, res) => {
    try {
      const suppliers = await dbStorage.getVerifiedSuppliers();
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get supplier public profile with products
  app.get("/api/suppliers/:id/profile", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await dbStorage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      // Get all products from this supplier
      const products = await dbStorage.getProductsBySupplierId(id);

      // Get user info for the supplier
      const user = await dbStorage.getUser(supplier.userId);

      // Return public profile (hide sensitive verification documents)
      res.json({
        supplier: {
          id: supplier.id,
          companyName: supplier.companyName,
          logo: supplier.logo,
          location: supplier.location,
          yearsInBusiness: supplier.yearsInBusiness,
          categories: supplier.categories,
          description: supplier.description,
          contactEmail: supplier.contactEmail,
          contactPhone: supplier.contactPhone,
          whatsappNumber: supplier.whatsappNumber,
          isVerified: supplier.isVerified,
          isGoldSupplier: supplier.isGoldSupplier,
          rating: supplier.rating,
          responseRate: supplier.responseRate,
        },
        products,
        userId: supplier.userId,
        contactName: user?.name || "Supplier",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload verification documents
  app.post(
    "/api/suppliers/:id/documents",
    authenticateToken,
    requireSupplier,
    uploadDoc.fields([
      { name: "businessRegistration", maxCount: 1 },
      { name: "taxCompliance", maxCount: 1 },
      { name: "proofOfResidence", maxCount: 1 },
      { name: "bankAccount", maxCount: 1 },
    ]),
    async (req: AuthRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Not authenticated" });
        }

        const id = parseInt(req.params.id);
        const supplier = await dbStorage.getSupplier(id);

        if (!supplier) {
          return res.status(404).json({ message: "Supplier not found" });
        }

        if (supplier.userId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized" });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const updateData: Record<string, string> = {};

        if (files.businessRegistration?.[0]) {
          const fileContent = fs.readFileSync(files.businessRegistration[0].path);
          const base64 = fileContent.toString('base64');
          const mimeType = files.businessRegistration[0].mimetype;
          updateData.businessRegistrationDoc = `data:${mimeType};base64,${base64}`;
          fs.unlinkSync(files.businessRegistration[0].path); // Clean up temp file
        }
        if (files.taxCompliance?.[0]) {
          const fileContent = fs.readFileSync(files.taxCompliance[0].path);
          const base64 = fileContent.toString('base64');
          const mimeType = files.taxCompliance[0].mimetype;
          updateData.taxComplianceDoc = `data:${mimeType};base64,${base64}`;
          fs.unlinkSync(files.taxCompliance[0].path);
        }
        if (files.proofOfResidence?.[0]) {
          const fileContent = fs.readFileSync(files.proofOfResidence[0].path);
          const base64 = fileContent.toString('base64');
          const mimeType = files.proofOfResidence[0].mimetype;
          updateData.proofOfResidenceDoc = `data:${mimeType};base64,${base64}`;
          fs.unlinkSync(files.proofOfResidence[0].path);
        }
        if (files.bankAccount?.[0]) {
          const fileContent = fs.readFileSync(files.bankAccount[0].path);
          const base64 = fileContent.toString('base64');
          const mimeType = files.bankAccount[0].mimetype;
          updateData.bankAccountDoc = `data:${mimeType};base64,${base64}`;
          fs.unlinkSync(files.bankAccount[0].path);
        }

        const updated = await dbStorage.updateSupplierVerification(id, updateData);
        res.json(updated);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Update supplier contact details and verification info
  app.patch("/api/suppliers/:id/verification", authenticateToken, requireSupplier, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const supplier = await dbStorage.getSupplier(id);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      if (supplier.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const data = updateSupplierVerificationSchema.parse(req.body);
      const updated = await dbStorage.updateSupplierVerification(id, data);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Submit supplier for verification
  app.post("/api/suppliers/:id/submit-verification", authenticateToken, requireSupplier, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const supplier = await dbStorage.getSupplier(id);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      if (supplier.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Check if all required documents are uploaded
      if (!supplier.businessRegistrationDoc || !supplier.taxComplianceDoc ||
          !supplier.proofOfResidenceDoc || !supplier.bankAccountDoc) {
        return res.status(400).json({ 
          message: "Please upload all required documents before submitting for verification" 
        });
      }

      // Check if contact details are provided
      if (!supplier.contactEmail || !supplier.contactPhone) {
        return res.status(400).json({ 
          message: "Please provide contact email and phone number" 
        });
      }

      const updated = await dbStorage.submitSupplierForVerification(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Verify or reject supplier (admin only)
  app.post("/api/admin/suppliers/:id/verify", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Simple admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { verified, notes } = req.body;

      const updated = await dbStorage.verifySupplier(id, verified, notes);
      if (!updated) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      // Send email notification to supplier
      if (updated.contactEmail) {
        await sendEmail({
          to: updated.contactEmail,
          subject: verified 
            ? "Your Supplier Account Has Been Approved - MzansiGlobalMarket"
            : "Supplier Verification Status Update - MzansiGlobalMarket",
          html: generateSupplierVerificationEmail(updated.companyName, verified, notes),
        });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  app.post("/api/products", authenticateToken, requireSupplier, upload.array("images", 5), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get supplier profile
      const supplier = await dbStorage.getSupplierByUserId(req.user.id);
      if (!supplier) {
        return res.status(400).json({ message: "Supplier profile not found" });
      }

      // Verify supplier is verified before allowing product creation
      // Check both isVerified boolean and verificationStatus for consistency
      if (!supplier.isVerified || supplier.verificationStatus !== "verified") {
        return res.status(403).json({ 
          message: "Supplier verification required. Please complete the verification process before listing products."
        });
      }

      // Process uploaded images - convert to base64 for persistent storage
      const files = req.files as Express.Multer.File[];
      const imagePaths: string[] = [];
      
      if (files && files.length > 0) {
        for (const file of files) {
          const fileContent = fs.readFileSync(file.path);
          const base64 = fileContent.toString('base64');
          const mimeType = file.mimetype;
          imagePaths.push(`data:${mimeType};base64,${base64}`);
          fs.unlinkSync(file.path); // Clean up temp file
        }
      }

      // Security: Only allow server-uploaded images, not arbitrary URLs from client
      if (imagePaths.length === 0) {
        return res.status(400).json({ message: "At least one product image is required" });
      }

      const productData: InsertProduct = insertProductSchema.parse({
        ...req.body,
        supplierId: supplier.id,
        images: imagePaths,
      });

      const product = await dbStorage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category, supplierId } = req.query;

      let products;
      if (category) {
        products = await dbStorage.getProductsByCategory(category as string);
      } else if (supplierId) {
        products = await dbStorage.getProductsBySupplierId(parseInt(supplierId as string));
      } else {
        products = await dbStorage.getAllProducts();
      }

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get trending products - MUST BE BEFORE /api/products/:id to prevent matching
  app.get("/api/products/trending", async (req, res) => {
    try {
      const limitStr = req.query.limit as string;
      const limit = limitStr && !isNaN(parseInt(limitStr)) ? parseInt(limitStr) : 10;
      const trendingData = await dbStorage.getTrendingProducts(limit);
      
      // Fetch full product details
      const products = await Promise.all(
        trendingData.map(async (item) => {
          const product = await dbStorage.getProduct(item.productId);
          return product ? { ...product, viewCount: item.viewCount } : null;
        })
      );

      res.json(products.filter(Boolean));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await dbStorage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/products/:id", authenticateToken, requireSupplier, upload.array("images", 5), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const product = await dbStorage.getProduct(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Verify supplier owns the product
      const supplier = await dbStorage.getSupplierByUserId(req.user.id);
      if (!supplier || product.supplierId !== supplier.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Process new uploaded images if provided - convert to base64 for persistent storage
      const files = req.files as Express.Multer.File[];
      const newImagePaths: string[] = [];
      
      if (files && files.length > 0) {
        for (const file of files) {
          const fileContent = fs.readFileSync(file.path);
          const base64 = fileContent.toString('base64');
          const mimeType = file.mimetype;
          newImagePaths.push(`data:${mimeType};base64,${base64}`);
          fs.unlinkSync(file.path); // Clean up temp file
        }
      }

      // Build update payload and validate with Zod schema
      const rawUpdate: any = { ...req.body };
      
      // Only update images if new ones were uploaded (security: prevent URL injection)
      if (newImagePaths.length > 0) {
        rawUpdate.images = newImagePaths;
      } else {
        delete rawUpdate.images; // Don't allow arbitrary URLs from client
      }

      // Validate against updateProductSchema (excludes supplierId to prevent ownership change)
      const updateData: UpdateProduct = updateProductSchema.parse(rawUpdate);

      const updated = await dbStorage.updateProduct(id, updateData);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireSupplier, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const product = await dbStorage.getProduct(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Verify supplier owns the product
      const supplier = await dbStorage.getSupplierByUserId(req.user.id);
      if (!supplier || product.supplierId !== supplier.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await dbStorage.deleteProduct(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // RFQ routes
  app.post("/api/rfqs", authenticateToken, requireBuyer, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const rfqData = insertRfqSchema.parse({
        ...req.body,
        buyerId: req.user.id,
      });

      const rfq = await dbStorage.createRFQ(rfqData);
      res.status(201).json(rfq);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // RFQ List Endpoint
  // DESIGN NOTE: This implements a PUBLIC B2B marketplace model (like Alibaba, Made-in-China)
  // where buyers post RFQs for ALL suppliers to see and quote on. This is intentional.
  // 
  // Alternative models to consider:
  // 1. Private/Invitation-only: Only invited suppliers can view specific RFQs
  // 2. Teaser model: Show limited info first, full specs after supplier shows interest
  // 3. Paid access: Suppliers pay to view full RFQ details
  //
  // Current implementation: Public marketplace with buyer anonymity
  app.get("/api/rfqs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let rfqs;
      if (req.user.userType === "buyer") {
        // Buyers only see their own RFQs with full details
        rfqs = await dbStorage.getRFQsByBuyerId(req.user.id);
        res.json(rfqs);
      } else if (req.user.userType === "supplier") {
        // PUBLIC MARKETPLACE MODEL: Suppliers see all RFQs to find quoting opportunities
        // Product specs, quantity, pricing shown to enable accurate quotes
        // Buyer identity protected (buyerId, attachments redacted)
        rfqs = await dbStorage.getAllRFQs();
        const redactedRfqs = rfqs.map(rfq => ({
          id: rfq.id,
          productName: rfq.productName,
          category: rfq.category,
          quantity: rfq.quantity,
          targetPrice: rfq.targetPrice,
          deliveryDate: rfq.deliveryDate,
          specifications: rfq.specifications,
          status: rfq.status,
          createdAt: rfq.createdAt,
          // buyerId intentionally excluded (buyer anonymity)
          // attachments excluded (may contain buyer identifying info)
        }));
        res.json(redactedRfqs);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // RFQ Detail Endpoint  
  // DESIGN NOTE: Implements PUBLIC marketplace visibility (see list endpoint note above)
  app.get("/api/rfqs/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const rfq = await dbStorage.getRFQ(id);
      
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }

      // Authorization logic based on user type
      if (req.user.userType === "buyer") {
        // Buyers can only view their own RFQs
        if (rfq.buyerId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized to view this RFQ" });
        }
        // Return full RFQ details to owner
        res.json(rfq);
      } else if (req.user.userType === "supplier") {
        // PUBLIC MARKETPLACE: Suppliers can view RFQ details to prepare quotes
        // Specs/quantity/pricing shown to enable accurate quotes
        // Buyer identity protected
        const redactedRfq = {
          id: rfq.id,
          productName: rfq.productName,
          category: rfq.category,
          quantity: rfq.quantity,
          targetPrice: rfq.targetPrice,
          deliveryDate: rfq.deliveryDate,
          specifications: rfq.specifications,
          status: rfq.status,
          createdAt: rfq.createdAt,
          // buyerId and attachments excluded (buyer anonymity)
        };
        res.json(redactedRfq);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/rfqs/:id/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status required" });
      }

      // Validate status values
      const validStatuses = ["open", "quoted", "closed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      // Get the RFQ to check ownership/participation
      const rfq = await dbStorage.getRFQ(id);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }

      // Authorization: Only the buyer who created the RFQ can update its status
      // Future: Could allow suppliers who have quoted to update to "quoted" status
      if (rfq.buyerId !== req.user.id) {
        return res.status(403).json({ message: "Only the RFQ creator can update its status" });
      }

      const updated = await dbStorage.updateRFQStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message routes
  app.post("/api/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      const message = await dbStorage.createMessage(messageData);

      // Send email notification to the receiver
      const receiver = await dbStorage.getUser(messageData.receiverId);
      const sender = await dbStorage.getUser(req.user.id);
      
      if (receiver?.email && sender) {
        // Check if receiver is a supplier
        const supplierProfile = await dbStorage.getSupplierByUserId(receiver.id);
        const receiverName = supplierProfile?.companyName || receiver.name;

        const emailHtml = generateMessageNotificationEmail(
          receiverName,
          sender.name,
          messageData.subject,
          messageData.message
        );

        sendEmail({
          to: receiver.email,
          subject: `New Message: ${messageData.subject} - MzansiGlobalMarket`,
          html: emailHtml,
        }).catch(err => console.error("Failed to send message notification:", err));
      }

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messages = await dbStorage.getMessagesByUserId(req.user.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/conversation/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const otherUserId = parseInt(req.params.userId);
      const messages = await dbStorage.getConversation(req.user.id, otherUserId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/messages/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // Get the message to verify ownership
      const message = await dbStorage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Only the receiver can mark a message as read
      if (message.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }

      const updated = await dbStorage.markMessageAsRead(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // CMS Page routes (public read, admin write)
  app.get("/api/cms/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await dbStorage.getCmsPage(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      // Only return published pages to public
      if (!page.isPublished) {
        return res.status(404).json({ message: "Page not found" });
      }

      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/cms", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pages = await dbStorage.getAllCmsPages();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/cms", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pageData = insertCmsPageSchema.parse(req.body);
      const page = await dbStorage.createCmsPage(pageData);
      res.status(201).json(page);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/cms/:slug", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { slug } = req.params;
      const updateData = updateCmsPageSchema.parse(req.body);
      const page = await dbStorage.updateCmsPage(slug, updateData, req.user.id);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      res.json(page);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/cms/:slug", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { slug } = req.params;
      const deleted = await dbStorage.deleteCmsPage(slug);
      
      if (!deleted) {
        return res.status(404).json({ message: "Page not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // FAQ routes (public read, admin write)
  app.get("/api/faq", async (req, res) => {
    try {
      const faqs = await dbStorage.getPublishedFaqItems();
      res.json(faqs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/faq", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const faqs = await dbStorage.getAllFaqItems();
      res.json(faqs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/faq", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const faqData = insertFaqItemSchema.parse(req.body);
      const faq = await dbStorage.createFaqItem(faqData);
      res.status(201).json(faq);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/faq/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updateData = updateFaqItemSchema.parse(req.body);
      const faq = await dbStorage.updateFaqItem(id, updateData);
      
      if (!faq) {
        return res.status(404).json({ message: "FAQ item not found" });
      }

      res.json(faq);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/faq/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const deleted = await dbStorage.deleteFaqItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "FAQ item not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Site Settings routes (public read for specific keys, admin write)
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await dbStorage.getSiteSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/settings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await dbStorage.getAllSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/settings/:key", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key } = req.params;
      const { value } = req.body;

      const setting = await dbStorage.upsertSiteSetting(key, value, req.user.id);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Upload images for site settings (hero, categories, etc.)
  app.post("/api/admin/settings/upload", authenticateToken, upload.single("image"), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imagePath = `/uploads/products/${file.filename}`;
      res.json({ path: imagePath });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product moderation routes
  app.get("/api/products/public", async (req, res) => {
    try {
      const { category, supplierId } = req.query;

      let products;
      if (category) {
        const allProducts = await dbStorage.getPublicProducts();
        products = allProducts.filter(p => p.category === category);
      } else if (supplierId) {
        const allProducts = await dbStorage.getPublicProducts();
        products = allProducts.filter(p => p.supplierId === parseInt(supplierId as string));
      } else {
        products = await dbStorage.getPublicProducts();
      }

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/products/restricted", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const products = await dbStorage.getRestrictedProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/products/all", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const products = await dbStorage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/products/:id/restrict", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const restrictData = restrictProductSchema.parse(req.body);
      
      const product = await dbStorage.restrictProduct(id, restrictData, req.user.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== CATEGORY MANAGEMENT ROUTES ====================

  // Public: Get all active categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getActiveCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get top-level categories only
  app.get("/api/categories/top-level", async (req, res) => {
    try {
      const categories = await dbStorage.getTopLevelCategories();
      const activeCategories = categories.filter(c => c.isActive);
      res.json(activeCategories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get subcategories of a parent
  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subcategories = await dbStorage.getSubcategories(id);
      const activeSubcategories = subcategories.filter(c => c.isActive);
      res.json(activeSubcategories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get single category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await dbStorage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get all categories (including inactive)
  app.get("/api/admin/categories", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await dbStorage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Create new category
  app.post("/api/admin/categories", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      
      // Check if slug already exists
      const existingCategory = await dbStorage.getCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Category slug already exists" });
      }

      const category = await dbStorage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Update category
  app.patch("/api/admin/categories/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updateData = updateCategorySchema.parse(req.body);

      // If updating slug, check it doesn't conflict
      if (updateData.slug) {
        const existingCategory = await dbStorage.getCategoryBySlug(updateData.slug);
        if (existingCategory && existingCategory.id !== id) {
          return res.status(400).json({ message: "Category slug already exists" });
        }
      }

      const category = await dbStorage.updateCategory(id, updateData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Delete category
  app.delete("/api/admin/categories/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin check
      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);

      // Check if category has subcategories
      const subcategories = await dbStorage.getSubcategories(id);
      if (subcategories.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete category with subcategories. Delete subcategories first." 
        });
      }

      const deleted = await dbStorage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contact form submission (public endpoint)
  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertContactSubmissionSchema.parse(req.body);
      const submission = await dbStorage.createContactSubmission(data);
      res.status(201).json(submission);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Get all contact submissions
  app.get("/api/admin/contacts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const submissions = await dbStorage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Mark contact as read
  app.patch("/api/admin/contacts/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.email !== "mzansiglobalmarket@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const submission = await dbStorage.markContactAsRead(id);
      
      if (!submission) {
        return res.status(404).json({ message: "Contact submission not found" });
      }

      res.json(submission);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ EMAIL VERIFICATION ============
  
  // Send verification code
  app.post("/api/auth/send-verification", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await dbStorage.updateUserVerification(user.id, code, expiry);

      // Send verification email
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - MzansiGlobalMarket",
        html: generateVerificationCodeEmail(user.name, code),
      });

      res.json({ message: "Verification code sent to your email" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Verify email with code
  app.post("/api/auth/verify-email", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { code } = verifyEmailSchema.omit({ email: true }).parse(req.body);
      
      const user = await dbStorage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (!user.verificationCode || !user.verificationCodeExpiry) {
        return res.status(400).json({ message: "No verification code found. Request a new one." });
      }

      if (new Date() > user.verificationCodeExpiry) {
        return res.status(400).json({ message: "Verification code expired. Request a new one." });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      await dbStorage.verifyUserEmail(user.id);
      res.json({ message: "Email verified successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ USER PROFILE ============
  
  // Get current user profile
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password
      const { password, verificationCode, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update user profile (buyers can update name and phone)
  app.patch("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await dbStorage.updateUserProfile(user.id, updateData);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      const { password, verificationCode, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ PRODUCT VIEWS & TRACKING ============
  
  // Track product view
  app.post("/api/products/:id/view", async (req: AuthRequest, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { sessionId } = req.body;
      
      // Get user ID if authenticated
      let userId: number | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const jwt = await import('jsonwebtoken');
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as { id: number };
          userId = decoded.id;
          
          // Add to browsing history for authenticated users
          await dbStorage.addToBrowsingHistory(userId, productId);
        } catch (e) {
          // Invalid token, continue as anonymous
        }
      }

      await dbStorage.trackProductView({ userId, productId, sessionId });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's browsing history
  app.get("/api/user/browsing-history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const history = await dbStorage.getBrowsingHistory(req.user.id, limit);
      
      // Fetch full product details
      const products = await Promise.all(
        history.map(async (item) => {
          const product = await dbStorage.getProduct(item.productId);
          return product ? { ...product, lastViewedAt: item.lastViewedAt, viewCount: item.viewCount } : null;
        })
      );

      res.json(products.filter(Boolean));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get related products (what others also viewed)
  app.get("/api/products/:id/related", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 6;
      const relatedData = await dbStorage.getRelatedProducts(productId, limit);
      
      // Fetch full product details
      const products = await Promise.all(
        relatedData.map(async (item) => {
          const product = await dbStorage.getProduct(item.productId);
          return product;
        })
      );

      res.json(products.filter(Boolean));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ SHIPPING SERVICES ============
  
  // Get active shipping services
  app.get("/api/shipping/services", async (req, res) => {
    try {
      const services = await dbStorage.getActiveShippingServices();
      res.json(services);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Request shipping quote
  app.post("/api/shipping/quote-request", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await dbStorage.getUser(req.user.id);
      if (!user || user.userType !== 'buyer') {
        return res.status(403).json({ message: "Only buyers can request shipping quotes" });
      }

      // Check for non-South Africa destination
      const { destinationCountry } = req.body;
      if (destinationCountry && destinationCountry.toLowerCase() !== 'south africa' && destinationCountry.toLowerCase() !== 'za') {
        return res.status(400).json({ 
          message: "We currently only ship within South Africa. International shipping is not available.",
          isInternational: true
        });
      }

      const requestData = insertShippingQuoteRequestSchema.parse({
        ...req.body,
        buyerId: req.user.id
      });

      const quoteRequest = await dbStorage.createShippingQuoteRequest(requestData);
      res.status(201).json(quoteRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's shipping quote requests
  app.get("/api/shipping/quote-requests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const requests = await dbStorage.getShippingQuoteRequests(req.user.id);
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ CUSTOMS CALCULATOR ============
  
  // Get customs tariffs
  app.get("/api/customs/tariffs", async (req, res) => {
    try {
      const tariffs = await dbStorage.getAllCustomsTariffs();
      res.json(tariffs);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Calculate customs duty
  app.post("/api/customs/calculate", async (req, res) => {
    try {
      const { hsCode, declaredValue, freightCost = 0, insuranceCost = 0 } = req.body;

      if (!hsCode || !declaredValue) {
        return res.status(400).json({ message: "HS Code and declared value are required" });
      }

      const tariff = await dbStorage.getCustomsTariff(hsCode);
      
      // Default rates if tariff not found
      const dutyRate = tariff ? parseFloat(tariff.dutyRate) : 0;
      const vatRate = tariff ? parseFloat(tariff.vatRate) : 15; // SA VAT is 15%
      const surchargeRate = tariff ? parseFloat(tariff.surchargeRate || "0") : 0;

      // CIF value (Cost + Insurance + Freight)
      const cifValue = parseFloat(declaredValue) + parseFloat(freightCost) + parseFloat(insuranceCost);
      
      // Calculate duties
      const customsDuty = cifValue * (dutyRate / 100);
      const surcharge = cifValue * (surchargeRate / 100);
      const valueForVat = cifValue + customsDuty + surcharge;
      const vat = valueForVat * (vatRate / 100);
      
      const totalLandedCost = cifValue + customsDuty + surcharge + vat;

      res.json({
        declaredValue: parseFloat(declaredValue),
        freightCost: parseFloat(freightCost),
        insuranceCost: parseFloat(insuranceCost),
        cifValue,
        dutyRate,
        customsDuty,
        surchargeRate,
        surcharge,
        vatRate,
        vat,
        totalLandedCost,
        tariffDescription: tariff?.description || "Standard rate applied"
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
