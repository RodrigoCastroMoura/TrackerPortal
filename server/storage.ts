import { db } from "../db";
import { sessions, userCache, type InsertSession, type Session, type InsertUserCache, type UserCache } from "@shared/schema";
import { eq, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  
  // User cache management
  cacheUser(user: InsertUserCache): Promise<UserCache>;
  getCachedUser(id: string): Promise<UserCache | undefined>;
  getCachedUserByEmail(email: string): Promise<UserCache | undefined>;
  updateCachedUser(id: string, data: Partial<InsertUserCache>): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // Session methods
  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(sessionData).returning();
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.id, id),
        gt(sessions.expiresAt, new Date())
      ))
      .limit(1);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      ))
      .limit(1);
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(
      lt(sessions.expiresAt, new Date())
    );
  }

  // User cache methods
  async cacheUser(userData: InsertUserCache): Promise<UserCache> {
    const [user] = await db
      .insert(userCache)
      .values(userData)
      .onConflictDoUpdate({
        target: userCache.id,
        set: { ...userData, updatedAt: new Date() }
      })
      .returning();
    return user;
  }

  async getCachedUser(id: string): Promise<UserCache | undefined> {
    const [user] = await db
      .select()
      .from(userCache)
      .where(eq(userCache.id, id))
      .limit(1);
    return user;
  }

  async getCachedUserByEmail(email: string): Promise<UserCache | undefined> {
    const [user] = await db
      .select()
      .from(userCache)
      .where(eq(userCache.email, email))
      .limit(1);
    return user;
  }

  async updateCachedUser(id: string, data: Partial<InsertUserCache>): Promise<void> {
    await db
      .update(userCache)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userCache.id, id));
  }
}

export const storage = new PostgresStorage();
