import accountApiRequest from '@/apiRequests/account';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: accountApiRequest.currentUserProfile,
  });
};

export const useUpdateCurrentUserProfileMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateCurrentUserProfile,
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.clientChangePasswordV2,
  });
};
