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
  const [selectedSumaeruNumber, setSelectedSumaeruNumber] = useState<string>(sumaeruNumbers[0].value);
  const [showSumaeruRadioButtons, setShowSumaeruRadioButtons] = useState<boolean>(false);


  const mmkTemplates: Template[] = [
    {
      title: '天然水決済',
      default_content: `■プレミアムウォーターマイページ■\nhttps://premium-water.net/mypage/\n\nログインＩＤ：a{phoneNumber}\nパスワード：{phoneNumber}a`
    },
    {
      title: '浄水型決済',
      default_content: `■LOCCAマイページ■\nhttps://locca.premium-water.net/mypage/\n\nログインＩＤ：a{phoneNumber}\nパスワード：{phoneNumber}a`
    },
    {
      title: '決済後追い',
      default_content: `お世話になっております。（株）すまえるです。\n本日はお忙しい中ウォーターサーバーの件ご対応頂き誠に有難う御座いました。\n\n※お客様へお知らせ\nお支払い方法のご登録がまだお済でないようですのでお手数ですが、21：00までにお支払方法のご登録をお忘れないようにお願い致します。\n\nご不明点等御座いましたらお気軽にお問合せ下さい。\n今後とも何卒宜しくお願い致します。\n\n（株）すまえる：{sumaeruNumber}`
    },
    {
      title: 'WTS詳細まとめ(famfit2 レンタル)ver',
      default_content: `https://premium-water.net/pw/tel/39/famfit2/famfit2_a4_250430.pdf\n\nhttps://premium-water.net/feature/category/user-interview/\n\nhttp://s.premium-water.net/LV_GQ3\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'WTS詳細まとめ(アマダナスタンダード 5年プラン)ver',
      default_content: `https://premium-water.net/pw/tel/39/general/amadanaSTD_1698.pdf\n\nhttps://premium-water.net/feature/category/user-interview/\n\nhttp://s.premium-water.net/V9vr8w\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'WTS詳細まとめ(アマダナスタンダード 3年プラン)ver',
      default_content: `http://s.premium-water.net/wo3wdz\n\nhttps://premium-water.net/pw/tel/39/general/amadanaSTD_1698.pdf\n\nhttps://premium-water.net/feature/category/user-interview/\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'WTS詳細まとめ(スリムサーバーⅣ 5年プラン)ver',
      default_content: `http://s.premium-water.net/V9vr8w\n\nhttps://premium-water.net/pw/tel/39/slim4/slim4_a4.pdf\n\nhttps://premium-water.net/feature/category/user-interview/\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'WTS詳細まとめ(スリムサーバーⅣ 3年プラン)ver',
      default_content: `https://premium-water.net/pw/tel/39/slim4/slim4_a4.pdf\n\nhttp://s.premium-water.net/wo3wdz\n\nhttps://premium-water.net/feature/category/user-interview/\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'famfit2 割賦 概要',
      default_content: `https://premium-water.net/pw/tel/39/famfit2/famfit2_a4_250430.pdf\n\nhttps://premium-water.net/pw/tel/39/famfit/famfit_agreement.pdf\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'AURAサーバー 前確後詳細',
      default_content: `※送信専用\n\nhttp://s.premium-water.net/vU_mJ2\nhttps://premium-water.net/pw/tel/39/motto/agreement_hg_2.pdf\n\n株式会社すまえる：{sumaeruNumber}\n\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'MOMクラブ 概要',
      default_content: `http://s.premium-water.net/fL1tYm\n\nhttps://premium-water.net/feature/category/user-interview/\n\nhttps://premium-water.net/pw/tel/39/mom/agreement.pdf\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\nフリーダイヤル：0120-937-032\n携帯電話の方は：0570-020-330\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'リッタ詳細',
      default_content: `※送信専用\nhttps://locca.premium-water.net/prm/tel/litta_leaf_a4.pdf\n\nhttps://locca.premium-water.net/prm/tel/agreement.pdf\n\n株式会社すまえる：{sumaeruNumber}\nご不明点があればお気軽にお問い合わせください\n◆LOCCAお客様専用窓口◆\nフリーダイヤル：0570-026-363\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'Locca Smart 前確後詳細LS',
      default_content: `※送信専用\n\nhttp://s.premium-water.net/8enBDL\nhttps://locca.premium-water.net/prm/tel/agreement.pdf\n\n株式会社すまえる：{sumaeruNumber}\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口\n携帯電話の方は：0570-026-363\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'スリムR2 概要',
      default_content: `https://locca.premium-water.net/prm/tel/39/slim-r2_leaf_a4.pdf\n\nhttps://locca.premium-water.net/prm/tel/agreement.pdf\n\n株式会社すまえる：{sumaeruNumber}\n\nご不明点があればお気軽にお問い合わせください\n◆プレミアムウォーターお客様専用窓口◆\n携帯電話の方：0570-026-363\n受付時間 10:00〜18:00 ※年末年始を除く`
    },
    {
      title: 'クレカ後追い キャリア→クレカ',
      default_content: `【送信専用】プレミアムウォーターお申し込みのお客様へ\n株式会社すまえるです。\n先日はプレミアムウォーターのお申し込みをいただき、誠にありがとうございます。\n\nプレミアムウォーターのマイページでは、\n\n・お水の本数やお届け日の調整\n・ご契約者さま限定のキャンペーンやお得な情報\n\nなどがご利用いただけますので、この機会にぜひご活用ください。\n\n【重要】\n現在「携帯合算払い」でお手続きをいただいておりますが、継続してサービスをご利用いただくため、「クレジットカード払い」へのご変更をおすすめしております。\n※今後、携帯会社のプラン変更や名義変更などによりご利用が一時停止となる場合がございます。\n\nお手続きはマイページから簡単に行えます。お早めのご対応をよろしくお願いいたします。\n\n▼マイページはこちら\n■プレミアムウォーターマイページ■\nhttps://premium-water.net/mypage/\n\nログインＩＤ：a{phoneNumber}\nパスワード：{phoneNumber}a\n\nご不明点はこちらまで株式会社すまえる：{sumaeruNumber}まで`
    },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading({ templates: true, operators: true });
      try {
        const fetchedOperators = await gasService.fetchOperators();
        setOperators(fetchedOperators);

        if (mode === 'mmk') {
          setTemplates(mmkTemplates);
        } else {
          const fetchedTemplates = await gasService.fetchTemplates();
          setTemplates(fetchedTemplates);
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
        const newContent = selectedTemplateValue
          .replace(/{phoneNumber}/g, cleanedPhone)
          .replace(/{sumaeruNumber}/g, selectedSumaeruNumber);
        setFormData(prev => ({ ...prev, freeText: newContent }));
    }
  }, [formData.phoneNumber, selectedTemplateValue, selectedSumaeruNumber]);


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
    if (mode === 'mmk') {
      setShowSumaeruRadioButtons(value.includes('{sumaeruNumber}'));
    }
  };
  
  const handleSumaeruNumberChange = (newNumber: string) => {
    setSelectedSumaeruNumber(newNumber);
    // The useEffect will handle updating the freeText
  };

  const resetForm = useCallback(() => {
    setFormData(prev => ({
      operator: prev.operator, // Keep operator name
      phoneNumber: '',
      freeText: '',
    }));
    setSelectedTemplateValue('');
    setShowSumaeruRadioButtons(false);
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
      <h1 className="text-2xl font-bold text-slate-700 mb-6">
        {mode === 'mmk' ? 'MMKモード' : '個別送信'}
      </h1>
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

            {mode === 'mmk' && showSumaeruRadioButtons && (
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