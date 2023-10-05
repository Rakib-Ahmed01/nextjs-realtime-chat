import FriendRequest from '@/components/FriendRequests';
import { fetchFromRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
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
  const friendRequestIds = (await fetchFromRedis(
    'smembers',
    `user:${session?.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    friendRequestIds.map(async (senderId) => {
      const sender = (await fetchFromRedis('get', `user:${senderId}`)) as Pick<
        User,
        'email' | 'id'
      >;

      return {
        senderId,
        senderEmail: sender.email,
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
