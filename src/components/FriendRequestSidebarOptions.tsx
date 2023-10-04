import { User } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

interface FriendRequestSidebarOptionsProps {}

const FriendRequestSidebarOptions: FC<
  FriendRequestSidebarOptionsProps
> = () => {
  return (
    <Link
      href={'/dashboard/requests'}
      className="flex gap-3 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group rounded-md p-2 text-sm font-semibold leading-6"
    >
      <span className="text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </span>
      <span className="truncate">Friend Requests</span>
    </Link>
  );
};

export default FriendRequestSidebarOptions;
