
import { GAS_URL, HISTORY_PAGE_SIZE } from '../constants';
import { HistoryEntry, HistoryFilters, GasErrorResponse } from '../types';

export const gasService = {
  fetchTemplates: async (): Promise<string[]> => {
    try {
      // Using POST to bypass potential CORS issues with GET requests on Google Apps Script
      const response = await fetch(`${GAS_URL}?action=templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.templates)) {
        return data.templates;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw new Error('通信エラーが発生しました。ネットワークをご確認ください。');
    }
  },

  sendMessage: async (payload: { operator: string; phoneNumber: string; message: string }): Promise<void> => {
    try {
      const response = await fetch(`${GAS_URL}?action=send`, {
        method: 'POST',
        // Using text/plain avoids a CORS preflight request.
        // The GAS backend is expected to parse the stringified JSON from the post body.
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: GasErrorResponse = await response.json().catch(() => ({}));
        if (errorData.api?.code === 'DUPLICATE_1MIN') {
            throw new Error('同一宛先＋同一本文は1分以内に送信できません。');
        }
        if (errorData.api?.responseMessage) {
            throw new Error(errorData.api.responseMessage);
        }
        throw new Error('送信に失敗しました。時間をおいて再度お試しください。');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('通信エラーが発生しました。ネットワークをご確認ください。');
    }
  },

  fetchHistory: async (filters: HistoryFilters, page: number): Promise<HistoryEntry[]> => {
    try {
      const params = new URLSearchParams({
        action: 'history',
        page: page.toString(),
        pageSize: HISTORY_PAGE_SIZE.toString(),
      });
      if (filters.operator) params.append('operator', filters.operator);
      if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
      if (filters.start) params.append('start', filters.start);
      if (filters.end) params.append('end', filters.end);
      
      // Using POST to bypass potential CORS issues with GET requests on Google Apps Script
      const response = await fetch(`${GAS_URL}?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.history)) {
        return data.history;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw new Error('通信エラーが発生しました。ネットワークをご確認ください。');
    }
  },
};
