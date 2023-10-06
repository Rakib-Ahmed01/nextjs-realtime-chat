import { z } from 'zod';

export const addFriendValidator = z.object({
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
      required_error: 'Email is required',
    })
    .email({
      message: 'Invalid email',
    }),
});

