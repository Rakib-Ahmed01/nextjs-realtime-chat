'use client';
import axios from 'axios';
import { Check, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import toast from 'react-hot-toast';

interface FriendRequestProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequest: FC<FriendRequestProps> = ({ incomingFriendRequests }) => {
  const [friendRequests, setfriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );
  const router = useRouter();

  const acceptFriend = async (senderId: string) => {
    try {
      await toast.promise(axios.post('/api/friends/accept', { id: senderId }), {
        success: 'Friend request accepted',
        loading: 'Accepting friend request...',
        error: 'Error accepting friend request',
      });
      setfriendRequests(
        friendRequests.filter((request) => request.senderId !== senderId)
      );
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const denyFriend = async (senderId: string) => {
    try {
      await toast.promise(axios.post('/api/friends/deny', { id: senderId }), {
        success: 'Friend request denied',
        loading: 'Denying friend request...',
        error: 'Error denying friend request',
      });
      setfriendRequests(
        friendRequests.filter((request) => request.senderId !== senderId)
      );
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black w-6 h-6" />
            <p className="font-medium text-base">{request.senderEmail}</p>
            <button
              aria-label="accept friend"
              className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => acceptFriend(request.senderId)}
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              aria-label="deny friend"
              className="w-7 h-7 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => denyFriend(request.senderId)}
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequest;
