export interface SendFormData {
  operator: string;
  phoneNumber: string;
  freeText: string;
}

export interface Template {
  title: string;
  default_content: string;
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
}

export interface GasErrorResponse {
  api?: {
    responseMessage?: string;
    code?: string;
  }
  code?: string;
  message?: string;
}
