
export interface SendFormData {
  operator: string;
  phoneNumber: string;
  template: string;
  freeText: string;
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
}
