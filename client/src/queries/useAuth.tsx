import authApiRequest from '@/apiRequests/auth';
import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.clientLogin,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.clientLogout,
  });
};
