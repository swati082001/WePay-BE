export type AuthUserPayload = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
}
