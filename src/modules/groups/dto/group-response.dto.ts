export interface GroupResponse {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  balanceSummary?: {
    totalOwed: number;
    totalOwing: number;
    netBalance: number;
  };
}
