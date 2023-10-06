import FriendRequest from '@/components/FriendRequests';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseJSON } from '@/lib/parseJSON';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface RequestsProps {}

const Requests: FC<RequestsProps> = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return notFound();
  }

  // ids of the user's friend requests
  const friendRequestIds = await db.smembers(
    `user:${session?.user.id}:incoming_friend_requests`
  );

  const incomingFriendRequests = await Promise.all(
    friendRequestIds.map(async (senderId) => {
      const sender = await db.get(`user:${senderId}`);
      const parsedSender = parseJSON(sender);

      return {
        senderId,
        senderEmail: parsedSender.email as string,
      };
    })
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-4xl mb-8">Friend Requests</h1>
      <div className="flex flex-col gap-4">
        <FriendRequest
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default Requests;
