import React, { useState, useEffect, useCallback } from 'react';
import { HistoryEntry, HistoryFilters } from '../types';
import { gasService } from '../services/gasService';
import { formatPhoneNumberForDisplay } from '../utils/formatters';
import { HISTORY_PAGE_SIZE } from '../constants';
import SkeletonLoader from '../components/SkeletonLoader';

const HistoryPage: React.FC = () => {
  const initialFilters: HistoryFilters = {
    operator: '',
    phoneNumber: '',
    start: '',
    end: '',
  };
  const [filters, setFilters] = useState<HistoryFilters>(initialFilters);
  const [searchTrigger, setSearchTrigger] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const fetchHistoryData = useCallback(async (currentPage: number, currentFilters: HistoryFilters) => {
    setIsLoading(true);
    try {
      const results = await gasService.fetchHistory(currentFilters, currentPage);
      setHistory(results);
      setHasNextPage(results.length === HISTORY_PAGE_SIZE);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchHistoryData(page, filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTrigger]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    setSearchTrigger(t => t + 1);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-700 mb-6">送信履歴</h1>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end p-4 bg-slate-50/70 rounded-lg border border-slate-200">
          <div>
            <label htmlFor="operator-filter" className="block text-sm font-medium text-slate-600 mb-1">担当名</label>
            <input type="text" id="operator-filter" name="operator" value={filters.operator} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
          <div>
            <label htmlFor="phoneNumber-filter" className="block text-sm font-medium text-slate-600 mb-1">電話番号</label>
            <input type="text" id="phoneNumber-filter" name="phoneNumber" value={filters.phoneNumber} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-slate-600 mb-1">開始日</label>
            <input type="date" id="start-date" name="start" value={filters.start} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-slate-600 mb-1">終了日</label>
            <input type="date" id="end-date" name="end" value={filters.end} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
          <button onClick={handleSearch} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">検索</button>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">送信日時</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">担当名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">電話番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">送信内容</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">clientTag</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                  <SkeletonLoader columns={6} rows={5} />
              ) : history.length > 0 ? (
                history.map((entry, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(entry.timestamp).toLocaleString('ja-JP')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{entry.operator}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatPhoneNumberForDisplay(entry.phoneNumber)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500" style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} title={entry.message}>{entry.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{entry.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{entry.clientTag}</td>
                  </tr>
                ))
              ) : (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">該当する履歴はありません。</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1 || isLoading}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            前へ
          </button>
          <span className="text-sm text-slate-500">ページ {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNextPage || isLoading}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            次へ
          </button>
        </div>
      </div>
    </>
  );
};

export default HistoryPage;