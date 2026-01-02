import http from '@/lib/http';
import { AccountResType } from '@/schemaValidations/account.schema';

const accountApiRequest = {
  currentUserProfile: () => http.get<AccountResType>('/accounts/me'),
};

export default accountApiRequest;
