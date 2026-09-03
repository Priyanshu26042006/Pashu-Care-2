import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(data: {
  uid: string;
  email?: string;
  name: string;
  role?: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  badgeNumber?: string;
  registrationNumber?: string;
  designation?: string;
  avatarUrl?: string;
  assignedCattleIds?: string[];
}) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: data.uid,
        email: data.email || null,
        name: data.name,
        role: data.role || 'farmer',
        phone: data.phone || null,
        village: data.village || null,
        district: data.district || null,
        state: data.state || null,
        badgeNumber: data.badgeNumber || null,
        registrationNumber: data.registrationNumber || null,
        designation: data.designation || null,
        avatarUrl: data.avatarUrl || null,
        assignedCattleIds: data.assignedCattleIds || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: data.email || null,
          name: data.name,
          role: data.role || 'farmer',
          phone: data.phone || null,
          village: data.village || null,
          district: data.district || null,
          state: data.state || null,
          badgeNumber: data.badgeNumber || null,
          registrationNumber: data.registrationNumber || null,
          designation: data.designation || null,
          avatarUrl: data.avatarUrl || null,
          assignedCattleIds: data.assignedCattleIds || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching user by uid:', error);
    return null;
  }
}
