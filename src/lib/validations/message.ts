import { z } from 'zod';

export const MessageValidator = z.object({
  id: z.string({}),
  text: z.string({}),
  senderId: z.string({}),
  recieverId: z.string({}),
  timestamp: z.number({}),
});

export const MessageValidatorArray = z.array(MessageValidator);

export type Message = z.infer<typeof MessageValidator>;
