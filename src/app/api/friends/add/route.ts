import { fetchFromRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { addFriendValidator } from '@/lib/validations/add-friend';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }

    const body = await req.json();
    const { email: validatedEmail } = addFriendValidator.parse({
      email: body.email,
    });

    const userIdToAdd = await fetchFromRedis(
      'get',
      `user:email:${validatedEmail}`
    );

    if (!userIdToAdd) {
      return new Response('User not found', {
        status: 404,
      });
    }

    if (userIdToAdd === session.user.id) {
      return new Response('You cannot add yourself', {
        status: 400,
      });
    }

    const isAlreadyFriend = await fetchFromRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      userIdToAdd
    );

    if (isAlreadyFriend) {
      return new Response('You are already friends', {
        status: 400,
      });
    }

    const isFriendRequestAlreadySent = await fetchFromRedis(
      'sismember',
      `user:${userIdToAdd}:incoming_friend_requests`,
      session.user.id
    );

    if (isFriendRequestAlreadySent) {
      return new Response('Friend request already sent', {
        status: 400,
      });
    }

    const isFriendRequestAlreadyRecieved = await fetchFromRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      userIdToAdd
    );

    if (isFriendRequestAlreadyRecieved) {
      return new Response('Friend request already recieved', {
        status: 400,
      });
    }

    await db.sadd(
      `user:${userIdToAdd}:incoming_friend_requests`,
      session.user.id
    );

    return new Response('Friend request sent', {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return new Response('Invalid request', {
        status: 422,
      });
    }

    new Response('Something went wrong', {
      status: 500,
    });
  }
}
