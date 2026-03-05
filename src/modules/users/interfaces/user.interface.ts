export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string | null;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
