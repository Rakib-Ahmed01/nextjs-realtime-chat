import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { MessageValidator } from '@/lib/validations/message';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { chatId, text } = (await req.json()) as {
      text: string;
      chatId: string;
    };
    const [userId1, userId2] = chatId.split('--');
    const recieverId = userId1 === session.user.id ? userId2 : userId1;

    if (userId1 !== session.user.id && userId2 !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // check if they are friends
    const isAlreadyFriends = await db.sismember(
      `user:${userId1}:friends`,
      userId2
    );

    if (!isAlreadyFriends) {
      return new Response('You are not friends', { status: 401 });
    }

    const timestamp = Date.now();

    const message: Message = {
      text: text,
      senderId: session.user.id,
      id: nanoid(),
      recieverId,
      timestamp,
    };
    console.log({ message });

    const validatedMessage = MessageValidator.parse(message);

    await db.zadd(
      `chat:${chatId}:messages`,
      timestamp,
      JSON.stringify(validatedMessage)
    );

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
