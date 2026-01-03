import http from '@/lib/http';
import {
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  UpdateMeBodyType,
} from '@/schemaValidations/account.schema';

const accountApiRequest = {
  currentUserProfile: () => http.get<AccountResType>('/accounts/me'),
  updateCurrentUserProfile: (body: UpdateMeBodyType) =>
    http.put<AccountResType>('/accounts/me', body),
  changePassword: (body: ChangePasswordBodyType) =>
    http.put<AccountResType>('accounts/change-password', body),
  clientChangePasswordV2: (body: ChangePasswordV2BodyType) =>
    http.put<ChangePasswordV2ResType>('api/accounts/change-password-v2', body, {
      baseUrl: '',
    }),
  serverChangePasswordV2: (
    accessToken: string,
    body: ChangePasswordV2BodyType
  ) =>
    http.put<ChangePasswordV2ResType>('accounts/change-password-v2', body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};

export default accountApiRequest;
