import { type TransactionKind } from "./enums";

export type Transaction = {
  id: number;
  kind: TransactionKind;
  pointsCollected: number;
  createdAt: string;
  userId: string;
};
