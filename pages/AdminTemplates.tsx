import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gasService } from '../services/gasService';
import { AdminTemplate } from '../types';
import AdminTemplateEditor from '../components/AdminTemplateEditor';
import Toast from '../components/Toast';
import SkeletonLoader from '../components/SkeletonLoader';

type ToastState = { message: string; type: 'success' | 'error' };

const AdminTemplatesPage: React.FC = () => {
    const { mode } = useAuth();
    const [activeTab, setActiveTab] = useState<'mmk' | 'kmk'>('mmk');
    const [templates, setTemplates] = useState<AdminTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const adminPass = sessionStorage.getItem('adminPass') || '';

    const loadTemplates = useCallback(async () => {
        if (mode !== 'master') return;
        setIsLoading(true);
        try {
            const data = await gasService.fetchAdminTemplates(activeTab);
            setTemplates(data);
        } catch (error) {
            setToast({ message: error instanceof Error ? error.message : 'Failed to load templates.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, mode]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    if (mode !== 'master') {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">アクセス権がありません</h1>
                <p className="text-slate-600 mt-2">このページはマスターモードでのみ利用可能です。</p>
                <NavLink to="/" className="mt-4 inline-block px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">送信ページへ戻る</NavLink>
            </div>
        );
    }
    
    const handleSaveTemplate = async (templateData: { id?: number; title: string; content: string; active: boolean; updatedBy: string }) => {
        if (!adminPass) {
            setToast({ message: '管理者パスワードが見つかりません（masterで再ログインしてください）。', type: 'error' });
            return;
        }
        try {
            await gasService.upsertTemplate({
                ...templateData,
                adminPass,
                mode: activeTab,
            });
            setToast({ message: 'テンプレートを保存しました。', type: 'success' });
            setIsEditorOpen(false);
            setEditingTemplate(null);
            await loadTemplates();
        } catch (error: any) {
            const msg = error?.message === 'ADMIN_REQUIRED' 
                ? '管理者パスワードが無効です（＜基礎パス＞+master を再入力）。' 
                : (error?.message || '保存に失敗しました。');
            setToast({ message: msg, type: 'error' });
        }
    };

    const handleToggleActive = async (template: AdminTemplate) => {
        if (!adminPass) {
            setToast({ message: '管理者パスワードが見つかりません。', type: 'error' });
            return;
        }
        try {
            await gasService.toggleTemplate({
                adminPass,
                mode: activeTab,
                id: template.id,
                active: !template.active,
            });
            setToast({ message: 'ステータスを更新しました。', type: 'success' });
            await loadTemplates();
        } catch (error) {
            setToast({ message: error instanceof Error ? error.message : '更新に失敗しました。', type: 'error' });
        }
    };
    
    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        if (!adminPass) {
            setToast({ message: '管理者パスワードが見つかりません。', type: 'error' });
            return;
        }

        const newTemplates = [...templates];
        const item = newTemplates[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newTemplates.length) return;
        
        [newTemplates[index], newTemplates[swapIndex]] = [newTemplates[swapIndex], newTemplates[index]];
        
        const orders = newTemplates.map((t, i) => ({ id: t.id, order: i + 1 }));
        
        // Optimistic update
        setTemplates(newTemplates.map((t, i) => ({...t, order: i+1})));

        try {
            await gasService.reorderTemplates({ adminPass, mode: activeTab, orders });
            setToast({ message: '並び順を更新しました。', type: 'success' });
        } catch (error) {
            setToast({ message: error instanceof Error ? error.message : '並び順の更新に失敗しました。', type: 'error' });
            await loadTemplates(); // Revert on failure
        }
    };

    const filteredTemplates = templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const updatedByDefault = localStorage.getItem('admin.updatedBy') || '';

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-2xl font-bold text-slate-700 mb-4">定型文管理</h1>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                    <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
                        <button onClick={() => setActiveTab('mmk')} className={`px-4 py-1 rounded-md text-sm font-medium ${activeTab === 'mmk' ? 'bg-white text-cyan-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}>MMK</button>
                        <button onClick={() => setActiveTab('kmk')} className={`px-4 py-1 rounded-md text-sm font-medium ${activeTab === 'kmk' ? 'bg-white text-cyan-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}>KMK</button>
                    </div>
                     <div className="flex items-center space-x-4">
                        <input type="text" placeholder="タイトルで検索..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        <button onClick={() => { setEditingTemplate(null); setIsEditorOpen(true); }} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">新規追加</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">有効</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">タイトル</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">更新日</th>
                                 <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">更新者</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                           {isLoading ? <SkeletonLoader rows={5} columns={5} /> : filteredTemplates.map((t, index) => (
                                <tr key={t.id}>
                                    <td className="px-4 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.active ? '有効' : '無効'}</span></td>
                                    <td className="px-4 py-4 text-sm text-slate-800 font-medium">{t.title}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500">{t.updatedAt ? new Date(t.updatedAt).toLocaleString('ja-JP') : 'N/A'}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500">{t.updatedBy}</td>
                                    <td className="px-4 py-4 text-sm font-medium space-x-2 flex items-center">
                                        <button onClick={() => { setEditingTemplate(t); setIsEditorOpen(true); }} className="text-cyan-600 hover:text-cyan-800">編集</button>
                                        <button onClick={() => handleToggleActive(t)} className="text-slate-500 hover:text-slate-700">{t.active ? '無効化' : '有効化'}</button>
                                        <button onClick={() => handleReorder(index, 'up')} disabled={index === 0} className="disabled:opacity-20">↑</button>
                                        <button onClick={() => handleReorder(index, 'down')} disabled={index === templates.length - 1} className="disabled:opacity-20">↓</button>
                                    </td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminTemplateEditor
                isOpen={isEditorOpen}
                onClose={() => { setIsEditorOpen(false); setEditingTemplate(null); }}
                onSave={handleSaveTemplate}
                initialData={editingTemplate}
                updatedByDefault={updatedByDefault}
            />
        </>
    );
};

export default AdminTemplatesPage;
