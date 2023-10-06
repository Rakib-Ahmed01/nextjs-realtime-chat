import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { IdValidator } from '@/lib/validations/validate-id';
import { getServerSession } from 'next-auth';

// remove from incoming friend requests
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { id: userIdToRemove } = IdValidator.parse(body);

    // check if they are already friends
    const isAlreadyFriends = await db.sismember(
      `user:${session.user.id}:friends`,
      userIdToRemove
    );

    if (isAlreadyFriends) {
      return new Response('You are already friends', { status: 400 });
    }

    // check if user is present in incoming friend requests
    const isUserInIncomingFriendRequests = await db.sismember(
      `user:${session.user.id}:incoming_friend_requests`,
      userIdToRemove
    );

    if (!isUserInIncomingFriendRequests) {
      return new Response('User not in incoming friend requests', {
        status: 400,
      });
    }

    // remove from incoming friend requests
    await db.srem(
      `user:${session.user.id}:incoming_friend_requests`,
      userIdToRemove
    );

    return new Response('Friend request removed', { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response('There was an error removing friend request', {
      status: 500,
    });
  }
}
