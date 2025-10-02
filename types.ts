export interface SendFormData {
  operator: string;
  phoneNumber: string;
  freeText: string;
}

export interface Template {
  title: string;
  default_content: string;
}

export interface AdminTemplate {
  id: number;
  title: string;
  content: string;
  active: boolean;
  order: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Operator {
  name: string;
}

export interface HistoryEntry {
  timestamp: string;
  operator: string;
  phoneNumber: string;
  message: string;
  status: 'success' | 'fail';
  clientTag: string;
}

export interface HistoryFilters {
  operator: string;
  phoneNumber: string;
  start: string;
  end: string;
  days?: number;
}

export interface HistoryResponse {
  data: HistoryEntry[];
  meta?: {
    lookbackDays?: number;
  };
}

export interface GasErrorResponse {
  api?: {
    responseMessage?: string;
    code?: string;
  }
  code?: string;
  message?: string;
}
