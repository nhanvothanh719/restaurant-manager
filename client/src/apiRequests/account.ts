import http from '@/lib/http';
import {
  AccountResType,
  UpdateMeBodyType,
} from '@/schemaValidations/account.schema';

const accountApiRequest = {
  currentUserProfile: () => http.get<AccountResType>('/accounts/me'),
  updateCurrentUserProfile: (body: UpdateMeBodyType) =>
    http.put<AccountResType>('/accounts/me', body),
};

export default accountApiRequest;
