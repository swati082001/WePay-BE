export interface ExpenseSplitResponse {
  userId: string;
  amountOwed: number;
}

export interface ExpenseResponse {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitType: 'equal' | 'exact' | 'percentage';
  splits: ExpenseSplitResponse[];
  createdAt: Date;
  updatedAt: Date;
}
