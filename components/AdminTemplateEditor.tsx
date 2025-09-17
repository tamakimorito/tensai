import React, { useState, useEffect } from 'react';
import { AdminTemplate } from '../types';
import Spinner from './Spinner';

interface AdminTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<AdminTemplate, 'id' | 'order'> & { id?: number }) => Promise<void>;
  initialData?: AdminTemplate | null;
}

const Placeholders = [
    '{phoneNumber}', '{sumaeruNumber}', '{operator}', '{today}'
];

const AdminTemplateEditor: React.FC<AdminTemplateEditorProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setActive(initialData.active);
    } else {
      setTitle('');
      setContent('');
      setActive(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title || !content) {
      alert('タイトルと内容は必須です。');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        title,
        content,
        active,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : '保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + placeholder + text.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">{initialData ? '定型文を編集' : '定型文を新規作成'}</h3>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="template-title" className="block text-sm font-medium text-slate-600 mb-1">タイトル</label>
            <input
              type="text"
              id="template-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="template-content" className="block text-sm font-medium text-slate-600 mb-1">内容</label>
            <textarea
              id="template-content"
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">プレースホルダ</label>
            <div className="flex flex-wrap gap-2">
                {Placeholders.map(p => (
                    <button key={p} onClick={() => insertPlaceholder(p)} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-mono rounded-md hover:bg-slate-300 transition-colors">
                        {p}
                    </button>
                ))}
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="template-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
            />
            <label htmlFor="template-active" className="ml-2 block text-sm text-slate-700">有効にする</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50">キャンセル</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 flex items-center">
            {isSaving && <Spinner />}
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTemplateEditor;
