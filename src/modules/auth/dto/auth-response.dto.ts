export type AuthUserPayload = {
  id: string;
  name: string;
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
