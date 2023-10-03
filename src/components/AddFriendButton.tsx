'use client';

import { addFriendValidator } from '@/lib/validations/add-friend';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Button from './ui/Button';

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const addFriend = async (email: string) => {
    setIsLoading(true);

    try {
      const { email: validatedEmail } = addFriendValidator.parse({ email });
      await axios.post('/api/friends/add', { email: validatedEmail });
      setShowSuccessState(true);
    } catch (error) {
      setShowSuccessState(false);
      if (error instanceof z.ZodError) {
        setError('email', {
          message: error.issues[0].message,
        });
        return;
      }

      if (error instanceof AxiosError) {
        setError('email', {
          message: error.response?.data,
        });
        return;
      }

      toast.error('Failed to add friend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form className="max-w-sm" onSubmit={handleSubmit(handleAddFriend)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by Email
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register('email')}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button isLoading={isLoading}>Add</Button>
      </div>
      {errors.email ? (
        <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      ) : null}
      {showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">
          Friend request successfully sent!
        </p>
      ) : null}
    </form>
  );
};

export default AddFriendButton;
