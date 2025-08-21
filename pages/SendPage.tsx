import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SendFormData, Template, Operator } from '../types';
import { gasService } from '../services/gasService';
import { cleanPhoneNumber } from '../utils/formatters';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import PhonePreview from '../components/PhonePreview';
import Toast from '../components/Toast';

type ToastState = {
  message: string;
  type: 'success' | 'error';
};

const SendPage: React.FC = () => {
  const initialFormState: SendFormData = {
    operator: '',
    phoneNumber: '',
    freeText: '',
  };

  const [formData, setFormData] = useState<SendFormData>(initialFormState);
  const [selectedTemplateValue, setSelectedTemplateValue] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState({ templates: true, operators: true });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [fetchedTemplates, fetchedOperators] = await Promise.all([
          gasService.fetchTemplates(),
          gasService.fetchOperators()
        ]);
        setTemplates(fetchedTemplates);
        setOperators(fetchedOperators);
      } catch (error) {
        if (error instanceof Error) {
            setToast({ message: error.message, type: 'error' });
        }
      } finally {
        setIsLoading({ templates: false, operators: false });
      }
    };
    loadInitialData();
  }, []);
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
        setPhoneError(null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOperatorChange = (value: string) => {
    setFormData((prev) => ({ ...prev, operator: value }));
  };

  const handleTemplateSelect = (value: string) => {
    setSelectedTemplateValue(value);
    setFormData((prev) => ({...prev, freeText: value}));
  };
  
  const resetForm = useCallback(() => {
    setFormData(prev => ({
      operator: prev.operator, // Keep operator name
      phoneNumber: '',
      freeText: '',
    }));
    setSelectedTemplateValue('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.operator) {
        showToast('担当名を選択してください。', 'error');
        return;
    }
    const phoneNumber = cleanPhoneNumber(formData.phoneNumber);
    if (!phoneNumber) {
        showToast('送信先電話番号を入力してください。', 'error');
        return;
    }
    if (!formData.freeText) {
        showToast('メッセージ内容を入力してください。', 'error');
        return;
    }
    
    setIsModalOpen(true);
  };
  
  const handleConfirmSend = async () => {
    setIsSending(true);
    setPhoneError(null); // Reset phone error on new attempt
    try {
        const cleanedPhoneNumber = cleanPhoneNumber(formData.phoneNumber);
        await gasService.sendMessage({
            operator: formData.operator,
            phoneNumber: cleanedPhoneNumber,
            message: formData.freeText,
        });
        
        setIsModalOpen(false);
        showToast('送信成功しました', 'success');
        setSendingStatus('success');
        
        // Delay form reset to allow animation to play with content
        setTimeout(() => {
            resetForm();
            setSendingStatus('idle');
        }, 1800);

    } catch (error) {
        setIsModalOpen(false); // Close modal on failure
        setSendingStatus('fail');
        
        const rawErrorMessage = error instanceof Error ? error.message : '送信に失敗しました。時間をおいて再度お試しください。';
        let displayErrorMessage = rawErrorMessage;

        // Translate specific known error messages
        if (rawErrorMessage.toLowerCase().includes('invalid phonenumber')) {
            displayErrorMessage = '電話番号の形式が正しくありません。';
        }
        
        showToast(displayErrorMessage, 'error');
        
        // If the error is about the phone number, highlight the field
        if (rawErrorMessage.toLowerCase().includes('phone')) {
            setPhoneError(displayErrorMessage);
            phoneInputRef.current?.focus();
        }

        setTimeout(() => setSendingStatus('idle'), 1800);
    } finally {
        setIsSending(false);
    }
  };

  const templateOptions = templates.map(t => ({ value: t.default_content, label: t.title }));
  const operatorOptions = operators.map(o => ({ value: o.name, label: o.name }));

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-slate-700 mb-6">個別送信</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl">
        {/* Left Column: Form */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="operator" className="block text-sm font-medium text-slate-600 mb-1">担当名</label>
              <SearchableSelect
                options={operatorOptions}
                value={formData.operator}
                onChange={handleOperatorChange}
                placeholder={isLoading.operators ? '読み込み中...' : '担当者を検索または選択'}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-600 mb-1">送信先電話番号</label>
              <input
                ref={phoneInputRef}
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out ${phoneError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}`}
                required
                autoComplete="off"
                aria-invalid={!!phoneError}
                aria-describedby={phoneError ? "phone-error" : undefined}
              />
              {phoneError && <p id="phone-error" className="text-sm text-red-600 mt-1">{phoneError}</p>}
              <p className="text-xs text-slate-500 mt-1">国内形式（090...）または国際形式（+8180...）で入力</p>
            </div>
            <div>
              <label htmlFor="template" className="block text-sm font-medium text-slate-600 mb-1">定型文</label>
              <SearchableSelect
                options={templateOptions}
                value={selectedTemplateValue}
                onChange={handleTemplateSelect}
                placeholder={isLoading.templates ? '読み込み中...' : '定型文を検索または選択して挿入'}
              />
            </div>
            <div>
              <label htmlFor="freeText" className="block text-sm font-medium text-slate-600 mb-1">自由文</label>
              <textarea
                id="freeText"
                name="freeText"
                value={formData.freeText}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
                placeholder="定型文を選択するか、ここに直接メッセージを入力"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 ease-in-out"
              >
                送信内容を確認
              </button>
            </div>
          </form>
        </div>
        
        {/* Right Column: Preview */}
        <div className="hidden lg:flex items-center justify-center">
            <PhonePreview phoneNumber={formData.phoneNumber} message={formData.freeText} status={sendingStatus} />
        </div>

      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSend}
        title="送信内容の確認"
        isConfirming={isSending}
      >
        <div className="space-y-4">
            <div>
                <p className="font-semibold text-slate-500">担当名:</p>
                <p className="text-slate-800 font-medium">{formData.operator}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-500">送信先電話番号:</p>
                <p className="text-slate-800 font-medium">{cleanPhoneNumber(formData.phoneNumber)}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-500">送信内容プレビュー:</p>
                <p className="text-slate-800 whitespace-pre-wrap bg-slate-100 p-3 rounded-md border border-slate-200">{formData.freeText}</p>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default SendPage;