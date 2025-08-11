import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertUserSchema, insertAdminSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 12 // max 12 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(uploadDir));

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      if (!admin.isActive) {
        return res.status(401).json({ message: "Conta desativada" });
      }
      
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      const token = jwt.sign({ 
        id: admin.id, 
        email: admin.email, 
        role: admin.role, 
        permissions: admin.permissions 
      }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get all properties with filters
  app.get("/api/properties", async (req, res) => {
    try {
      const { type, location, minPrice, maxPrice, status } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type as string;
      if (location) filters.location = location as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (status) filters.status = status as string;
      
      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar imóveis' });
    }
  });

  // Get single property
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: 'Imóvel não encontrado' });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar imóvel' });
    }
  });

  // Create property (admin only)
  app.post("/api/properties", authenticateAdmin, upload.array('images', 12), async (req, res) => {
    try {
      console.log('Received property data:', req.body);
      
      // Convert string numbers to proper types
      const processedData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : 0,
        area: req.body.area ? parseFloat(req.body.area) : null,
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : null,
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : null,
        parkingSpaces: req.body.parkingSpaces ? parseInt(req.body.parkingSpaces) : null,
      };
      
      console.log('Processed property data:', processedData);
      
      const validatedData = insertPropertySchema.parse(processedData);
      
      // Handle uploaded images
      const images: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          images.push(`/uploads/${file.filename}`);
        }
      }
      
      const property = await storage.createProperty({
        ...validatedData,
        price: validatedData.price.toString(),
        area: validatedData.area ? validatedData.area.toString() : undefined,
        images
      });
      
      res.status(201).json(property);
    } catch (error) {
      console.error('Property creation error:', error);
      res.status(400).json({ message: 'Dados inválidos', error: error.message || error });
    }
  });

  // Update property (admin only)
  app.put("/api/properties/:id", authenticateAdmin, upload.array('images', 12), async (req, res) => {
    try {
      console.log('Received update data:', req.body);
      
      // Convert string numbers to proper types
      const processedData: any = { ...req.body };
      if (req.body.price) processedData.price = parseFloat(req.body.price);
      if (req.body.area) processedData.area = parseFloat(req.body.area);
      if (req.body.bedrooms) processedData.bedrooms = parseInt(req.body.bedrooms);
      if (req.body.bathrooms) processedData.bathrooms = parseInt(req.body.bathrooms);
      if (req.body.parkingSpaces) processedData.parkingSpaces = parseInt(req.body.parkingSpaces);
      
      const validatedData = insertPropertySchema.partial().parse(processedData);
      
      // Handle uploaded images
      let images: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          images.push(`/uploads/${file.filename}`);
        }
      }
      
      // If no new images, keep existing ones
      if (images.length === 0 && req.body.existingImages) {
        images = JSON.parse(req.body.existingImages);
      }
      
      const property = await storage.updateProperty(req.params.id, {
        ...validatedData,
        price: validatedData.price ? validatedData.price.toString() : undefined,
        area: validatedData.area ? validatedData.area.toString() : undefined,
        images: images.length > 0 ? images : undefined
      });
      
      res.json(property);
    } catch (error) {
      console.error('Property update error:', error);
      res.status(400).json({ message: 'Erro ao atualizar imóvel', error: error.message || error });
    }
  });

  // Delete property (admin only)
  app.delete("/api/properties/:id", authenticateAdmin, async (req, res) => {
    try {
      await storage.deleteProperty(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar imóvel' });
    }
  });

  // Get session ID (for anonymous users)
  app.get("/api/session", (req, res) => {
    // Generate or get session ID from cookies
    let sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2);
    }
    res.json({ sessionId });
  });

  // Get user favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requerido' });
      }
      
      const favorites = await storage.getFavorites(sessionId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar favoritos' });
    }
  });

  // Add favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const { propertyId } = req.body;
      
      if (!sessionId || !propertyId) {
        return res.status(400).json({ message: 'Session ID e Property ID são requeridos' });
      }
      
      const favorite = await storage.addFavorite({ propertyId, sessionId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: 'Erro ao adicionar favorito' });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:propertyId", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const { propertyId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requerido' });
      }
      
      await storage.removeFavorite(propertyId, sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover favorito' });
    }
  });

  // Check if property is favorite
  app.get("/api/favorites/:propertyId/check", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const { propertyId } = req.params;
      
      if (!sessionId) {
        return res.json({ isFavorite: false });
      }
      
      const isFavorite = await storage.isFavorite(propertyId, sessionId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao verificar favorito' });
    }
  });

  // Admin management routes
  
  // Get all admins (super admin only)
  app.get("/api/admins", authenticateAdmin, async (req: any, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const admins = await storage.getAllAdmins();
      const adminsWithoutPasswords = admins.map(admin => ({
        ...admin,
        password: undefined
      }));
      res.json(adminsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar administradores" });
    }
  });

  // Create new admin (super admin only)
  app.post("/api/admins", authenticateAdmin, async (req: any, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const validatedData = insertAdminSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const admin = await storage.createAdmin({
        ...validatedData,
        password: hashedPassword,
        createdBy: req.user.id
      });
      
      res.status(201).json({
        ...admin,
        password: undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar administrador" });
    }
  });

  // Update admin (super admin only)
  app.put("/api/admins/:id", authenticateAdmin, async (req: any, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const { password, ...updateData } = req.body;
      const finalData = password ? 
        { ...updateData, password: await bcrypt.hash(password, 10) } : 
        updateData;
      
      const admin = await storage.updateAdmin(req.params.id, finalData);
      res.json({
        ...admin,
        password: undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar administrador" });
    }
  });

  // Toggle admin status (super admin only)
  app.patch("/api/admins/:id/status", authenticateAdmin, async (req: any, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const { isActive } = req.body;
      const admin = await storage.toggleAdminStatus(req.params.id, isActive);
      
      res.json({
        ...admin,
        password: undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao alterar status do administrador" });
    }
  });

  // Delete admin (super admin only)
  app.delete("/api/admins/:id", authenticateAdmin, async (req: any, res) => {
    try {
      if (req.user.role !== 'super_admin' || req.user.id === req.params.id) {
        return res.status(403).json({ message: "Não é possível excluir a própria conta" });
      }
      
      await storage.deleteAdmin(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir administrador" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
