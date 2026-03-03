export interface CreateUserPayload {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
