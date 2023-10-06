import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { IdValidator } from '@/lib/validations/validate-id';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { id: userIdToAdd } = IdValidator.parse(body);

    // check if they are already friends
    const isAlreadyFriends = await db.sismember(
      `user:${session.user.id}:friends`,
      userIdToAdd
    );

    if (isAlreadyFriends) {
      return new Response('You are already friends', { status: 400 });
    }

    // check if user is present in incoming friend requests
    const isUserInIncomingFriendRequests = await db.sismember(
      `user:${session.user.id}:incoming_friend_requests`,
      userIdToAdd
    );

    if (!isUserInIncomingFriendRequests) {
      return new Response('User not in incoming friend requests', {
        status: 400,
      });
    }

    // transaction to accept friend request
    await db
      .multi()
      .sadd(`user:${session.user.id}:friends`, userIdToAdd)
      .sadd(`user:${userIdToAdd}:friends`, session.user.id)
      .srem(`user:${session.user.id}:incoming_friend_requests`, userIdToAdd)
      .exec();

    return new Response('Friend request accepted', { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid id', { status: 422 });
    }

    return new Response('There was an error accepting friend request', {
      status: 500,
    });
  }
}
