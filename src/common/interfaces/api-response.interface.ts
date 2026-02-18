export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: string;
}
