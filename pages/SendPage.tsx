import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SendFormData, Template, Operator } from '../types';
import { gasService } from '../services/gasService';
import { cleanPhoneNumber } from '../utils/formatters';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import PhonePreview from '../components/PhonePreview';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

type ToastState = {
  message: string;
  type: 'success' | 'error';
};

const sumaeruNumbers = [
  { label: 'ストエネ販路', value: '050-5785-7954' },
  { label: 'イタンジ', value: '050-5785-7963' },
  { label: 'スマサポ すま直 ベンダー', value: '050-5785-7964' },
  { label: 'NNE', value: '050-5785-8000' },
];

const SendPage: React.FC = () => {
  const { mode } = useAuth();

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
  const [selectedSumaeruNumber, setSelectedSumaeruNumber] = useState<string>('');
  const [showSumaeruRadioButtons, setShowSumaeruRadioButtons] = useState<boolean>(false);


  const mmkTemplates: Template[] = [
    {
      title: '天然水決済',
      default_content: `■プレミアムウォーターマイページ■\nhttps://premium-water.net/mypage/\n\nログインＩＤ：a{phoneNumber}\nパスワード：{phoneNumber}a`
    },
    // ... other hardcoded templates (definitions remain but are not used for mmk/kmk)
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading({ templates: true, operators: true });
      try {
        const fetchedOperators = await gasService.fetchOperators();
        setOperators(fetchedOperators);

        if (mode === 'mmk' || mode === 'kmk') {
          const fetchedTemplates = await gasService.fetchSheetTemplates(mode);
          setTemplates(fetchedTemplates);
        } else if (mode === 'normal') {
          const fetchedTemplates = await gasService.fetchTemplates();
          setTemplates(fetchedTemplates);
        } else { // master mode
          setTemplates([]);
        }
      } catch (error) {
        if (error instanceof Error) {
            setToast({ message: error.message, type: 'error' });
        }
      } finally {
        setIsLoading({ templates: false, operators: false });
      }
    };
    loadInitialData();
  }, [mode]);
  
  // Update message content when phone number, template, or sumaeru number changes
  useEffect(() => {
    if (selectedTemplateValue) {
        const cleanedPhone = cleanPhoneNumber(formData.phoneNumber);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}/${mm}/${dd}`;

        const newContent = selectedTemplateValue
          .replace(/{phoneNumber}/g, cleanedPhone || '{phoneNumber}')
          .replace(/{sumaeruNumber}/g, selectedSumaeruNumber || '{sumaeruNumber}')
          .replace(/{operator}/g, formData.operator || '{operator}')
          .replace(/{today}/g, todayStr);
        setFormData(prev => ({ ...prev, freeText: newContent }));
    }
  }, [formData.phoneNumber, formData.operator, selectedTemplateValue, selectedSumaeruNumber]);


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
    if (mode === 'mmk' || mode === 'kmk') {
      const needsSumaeruNumber = value.includes('{sumaeruNumber}');
      setShowSumaeruRadioButtons(needsSumaeruNumber);
      if (!needsSumaeruNumber) {
        setSelectedSumaeruNumber('');
      }
    }
  };
  
  const handleSumaeruNumberChange = (newNumber: string) => {
    setSelectedSumaeruNumber(newNumber);
  };

  const resetForm = useCallback(() => {
    setFormData(prev => ({
      operator: prev.operator, // Keep operator name
      phoneNumber: '',
      freeText: '',
    }));
    setSelectedTemplateValue('');
    setShowSumaeruRadioButtons(false);
    setSelectedSumaeruNumber('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'master') {
        showToast('マスターモードでは送信できません。', 'error');
        return;
    }
    if (!formData.operator) {
        showToast('担当名を選択してください。', 'error');
        return;
    }
    const phoneNumber = cleanPhoneNumber(formData.phoneNumber);
    if (!phoneNumber) {
        showToast('送信先電話番号を入力してください。', 'error');
        return;
    }
    if ((mode === 'mmk' || mode === 'kmk') && showSumaeruRadioButtons && !selectedSumaeruNumber) {
        showToast('株式会社すまえるの電話番号を選択してください。', 'error');
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
        
        setTimeout(() => {
            resetForm();
            setSendingStatus('idle');
        }, 1800);

    } catch (error) {
        setIsModalOpen(false);
        setSendingStatus('fail');
        
        const rawErrorMessage = error instanceof Error ? error.message : '送信に失敗しました。時間をおいて再度お試しください。';
        let displayErrorMessage = rawErrorMessage;

        if (rawErrorMessage.toLowerCase().includes('invalid phonenumber')) {
            displayErrorMessage = '電話番号の形式が正しくありません。';
        }
        
        showToast(displayErrorMessage, 'error');
        
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
  const isMasterMode = mode === 'master';

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-slate-700 mb-6">
        {mode === 'mmk' ? 'MMKモード' : mode === 'kmk' ? 'KMKモード' : mode === 'master' ? '管理モード（送信不可）' : '個別送信'}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl">
        <div className={`bg-white p-6 sm:p-8 rounded-lg shadow-md ${isMasterMode ? 'opacity-50 pointer-events-none' : ''}`}>
          {isMasterMode && <div className="absolute inset-0 z-10 flex items-center justify-center"><p className="text-xl font-bold text-slate-600 bg-slate-200/80 p-4 rounded-lg">管理モードでは送信できません</p></div>}
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
            
            {(mode === 'mmk' || mode === 'kmk') && showSumaeruRadioButtons && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-slate-600 mb-2">株式会社すまえる 電話番号</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                  {sumaeruNumbers.map((item) => (
                    <label key={item.value} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-slate-200 transition-colors">
                      <input
                        type="radio"
                        name="sumaeruNumber"
                        value={item.value}
                        checked={selectedSumaeruNumber === item.value}
                        onChange={(e) => handleSumaeruNumberChange(e.target.value)}
                        className="h-4 w-4 text-cyan-600 border-slate-400 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
                disabled={isMasterMode}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                送信内容を確認
              </button>
            </div>
          </form>
        </div>
        
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
