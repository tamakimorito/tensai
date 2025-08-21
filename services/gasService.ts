import { GAS_URL, HISTORY_PAGE_SIZE, PASSWORD_SHEET_URL, OPERATORS_SHEET_URL } from '../constants';
import { HistoryEntry, HistoryFilters, GasErrorResponse, Template, Operator } from '../types';

// Helper to parse CSV text from Google Sheets
const parseCsv = (text: string): string[][] => {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    // This is a simple CSV parser; it may not handle all edge cases (e.g., quotes in fields).
    return line.slice(1, -1).split('","');
  });
};

export const gasService = {
  fetchPassword: async (): Promise<string> => {
    try {
      const response = await fetch(PASSWORD_SHEET_URL);
      if (!response.ok) throw new Error('Network error fetching password.');
      const text = await response.text();
      // The response for a single cell is like `"password"\n`
      const password = text.trim().slice(1, -1);
      return password;
    } catch (error) {
      console.error('Failed to fetch password:', error);
      throw new Error('パスワードの取得に失敗しました。');
    }
  },

  fetchOperators: async (): Promise<Operator[]> => {
    try {
        const response = await fetch(OPERATORS_SHEET_URL);
        if (!response.ok) throw new Error('Network error fetching operators.');
        const text = await response.text();
        const rows = parseCsv(text);
        // Skip header row (first row) and filter out any empty rows
        return rows.slice(1)
            .filter(row => row[0] && row[0].trim() !== '')
            .map(row => ({ name: row[0].trim() }));
    } catch (error) {
        console.error('Failed to fetch operators:', error);
        throw new Error('担当者リストの取得に失敗しました。');
    }
  },

  fetchTemplates: async (): Promise<Template[]> => {
    try {
      const response = await fetch(`${GAS_URL}?action=templates`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && data.api && Array.isArray(data.api.templates)) {
        return data.api.templates;
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
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      // GAS Web Apps often return a 200 OK status even for application-level errors.
      // Therefore, we must inspect the JSON body to determine the true outcome.
      const responseData = await response.json().catch(() => {
          // If JSON parsing fails, it's likely a server-side issue or network problem.
          throw new Error(`サーバーからの応答が不正です。ステータス: ${response.status}`);
      });

      // The provided GAS script uses an `ok: false` property in the JSON body to signal errors.
      if (responseData.ok === false) {
          // Extract the most specific error message available.
          const apiMessage = responseData.api?.responseMessage;
          const gasMessage = responseData.message;

          // The GAS script handles duplicate submissions with a specific code and message.
          if (responseData.code === 'DUPLICATE_1MIN') {
              throw new Error(gasMessage || '同一宛先＋同一本文は1分以内に送信できません。');
          }
          
          // Prioritize the message from the underlying SMS API, then the GAS message.
          const errorMessage = apiMessage || gasMessage || '送信に失敗しました。';
          throw new Error(errorMessage);
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
      
      const response = await fetch(`${GAS_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw new Error('通信エラーが発生しました。ネットワークをご確認ください。');
    }
  },
};