
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  accountId: string;
  name: string;
  location: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "pending" | "completed";

export interface MaintenanceTask {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  category: string | null;
  dueDate: string;
  estimatedCost: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
export interface CompletionRecord {
  id: string;
  taskId: string | null;
  propertyId: string;
  taskTitle: string;
  completedAt: Date;
  notes: string | null;
  actualCost: string | null;
  createdAt: Date;
}

