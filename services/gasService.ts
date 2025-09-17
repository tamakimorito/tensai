import { GAS_URL, HISTORY_PAGE_SIZE, PASSWORD_SHEET_URL, OPERATORS_SHEET_URL } from '../constants';
import { HistoryEntry, HistoryFilters, GasErrorResponse, Template, Operator, AdminTemplate } from '../types';

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

      // GAS Web Apps often return a 200 OK status for application-level errors.
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
  
  // New functions for Admin Template Management
  fetchSheetTemplates: async (mode: 'mmk' | 'kmk'): Promise<Template[]> => {
    const response = await fetch(`${GAS_URL}?action=template_list&mode=${mode}`);
    if (!response.ok) throw new Error('テンプレ取得に失敗しました');
    const json = await response.json();
    if (!json.ok || !Array.isArray(json.data)) return [];
    // Only return active templates for the send page, sorted by order
    const activeTemplates = json.data.filter((t: any) => t.active);
    activeTemplates.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return activeTemplates.map((t: any) => ({
      title: String(t.title || ''),
      default_content: String(t.content || ''),
    }));
  },

  fetchAdminTemplates: async (mode: 'mmk' | 'kmk'): Promise<AdminTemplate[]> => {
    const response = await fetch(`${GAS_URL}?action=template_list&mode=${mode}`);
    if (!response.ok) throw new Error('テンプレ取得に失敗しました');
    const json = await response.json();
    if (!json.ok || !Array.isArray(json.data)) return [];
    return json.data.map((t: any) => ({
      id: t.id,
      title: String(t.title || ''),
      content: String(t.content || ''),
      active: Boolean(t.active),
      order: Number(t.order || 0),
      updatedAt: String(t.updatedAt || ''),
      updatedBy: String(t.updatedBy || ''),
    })).sort((a,b) => a.order - b.order);
  },

  upsertTemplate: async (body: { adminPass: string; mode: 'mmk' | 'kmk'; id?: number; title: string; content: string; active?: boolean; order?: number; updatedBy?: string; }): Promise<void> => {
    const response = await fetch(`${GAS_URL}?action=template_upsert`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('テンプレ保存に失敗しました');
    const json = await response.json();
    if (!json.ok) throw new Error(json.message || 'テンプレ保存に失敗しました');
  },

  toggleTemplate: async (body: { adminPass: string; mode: 'mmk' | 'kmk'; id: number; active: boolean; updatedBy: string }): Promise<void> => {
    const response = await fetch(`${GAS_URL}?action=template_toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('有効/無効の更新に失敗しました');
    const json = await response.json();
    if (!json.ok) throw new Error(json.message || '有効/無効の更新に失敗しました');
  },

  reorderTemplates: async (body: { adminPass: string; mode: 'mmk' | 'kmk'; orders: { id: number; order: number; }[]; updatedBy: string }): Promise<void> => {
    const response = await fetch(`${GAS_URL}?action=template_reorder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('並び順の更新に失敗しました');
    const json = await response.json();
    if (!json.ok) throw new Error(json.message || '並び順の更新に失敗しました');
  },
};
