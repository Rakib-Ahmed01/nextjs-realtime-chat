import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { db } from '@/lib/db';
import { parseJSON } from '@/lib/parseJSON';
import { getCurrentUser } from '@/lib/session';
import { MessageValidatorArray } from '@/lib/validations/message';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface ChatProps {
  params: {
    chatId: string;
  };
}

const getPreviousMessages = async (chatId: string) => {
  try {
    const result = await db.zrange(`chat:${chatId}:messages`, 0, -1);
    const messages = result
      .map((message) => JSON.parse(message) as Message)
      .reverse();
    return MessageValidatorArray.parse(messages);
  } catch (error) {
    notFound();
  }
};

const Chat: FC<ChatProps> = async ({ params: { chatId } }) => {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const [userId1, userId2] = chatId.split('--');

  if (userId1 !== user.id && userId2 !== user.id) {
    notFound();
  }

  const chatPartnerId = userId1 === user.id ? userId2 : userId1;
  const chatPartnerString = await db.get(`user:${chatPartnerId}`);

  if (!chatPartnerString) {
    notFound();
  }

  const chatPartner = parseJSON<User>(chatPartnerString);
  const previousMessages = await getPreviousMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-3rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill={true}
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className="rounded-full w-8 sm:w-12 h-8 sm:h-12"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages
        messages={previousMessages}
        sessionId={user.id}
        sessionImg={user.image}
        chatId={chatId}
        chatPartner={chatPartner}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  );
};

export default Chat;
