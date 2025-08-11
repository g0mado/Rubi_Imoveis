import { 
  properties, 
  users, 
  favorites,
  type Property, 
  type InsertProperty,
  type User,
  type InsertUser,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property methods
  getProperties(filters?: {
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  
  // Favorites methods
  getFavorites(sessionId: string): Promise<(Favorite & { property: Property })[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(propertyId: string, sessionId: string): Promise<void>;
  isFavorite(propertyId: string, sessionId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProperties(filters?: {
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Property[]> {
    let query = db.select().from(properties);
    
    const conditions = [];
    
    if (filters?.type) {
      conditions.push(eq(properties.type, filters.type));
    }
    
    if (filters?.location) {
      conditions.push(ilike(properties.location, `%${filters.location}%`));
    }
    
    if (filters?.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice.toString()));
    }
    
    if (filters?.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice.toString()));
    }
    
    if (filters?.status) {
      conditions.push(eq(properties.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(properties.createdAt));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async getFavorites(sessionId: string): Promise<(Favorite & { property: Property })[]> {
    const result = await db
      .select({
        id: favorites.id,
        propertyId: favorites.propertyId,
        sessionId: favorites.sessionId,
        createdAt: favorites.createdAt,
        property: properties
      })
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .where(eq(favorites.sessionId, sessionId))
      .orderBy(desc(favorites.createdAt));
    
    return result;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(propertyId: string, sessionId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(
        eq(favorites.propertyId, propertyId),
        eq(favorites.sessionId, sessionId)
      ));
  }

  async isFavorite(propertyId: string, sessionId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.propertyId, propertyId),
        eq(favorites.sessionId, sessionId)
      ));
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
