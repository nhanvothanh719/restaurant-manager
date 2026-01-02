import accountApiRequest from '@/apiRequests/account';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: accountApiRequest.currentUserProfile,
  });
};
