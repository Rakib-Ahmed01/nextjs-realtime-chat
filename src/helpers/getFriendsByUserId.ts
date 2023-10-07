import { db } from '@/lib/db';
import { parseJSON } from '@/lib/parseJSON';

export const getFriendsByUserId = async (userId: string) => {
  const friendIds = await db.smembers(`user:${userId}:friends`);
  return Promise.all(
    friendIds.map(async (id) => parseJSON(await db.get(`user:${id}`)) as User)
  );
};
