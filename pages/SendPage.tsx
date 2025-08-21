
import React, { useState, useEffect, useCallback } from 'react';
import { SendFormData } from '../types';
import { gasService } from '../services/gasService';
import Modal from '../components/Modal';

const SendPage: React.FC = () => {
  const initialFormState: SendFormData = {
    operator: '',
    phoneNumber: '',
    template: '',
    freeText: '',
  };

  const [formData, setFormData] = useState<SendFormData>(initialFormState);
  const [templates, setTemplates] = useState<string[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [finalMessage, setFinalMessage] = useState<string>('');

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const fetchedTemplates = await gasService.fetchTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
  }, [initialFormState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.operator) {
        alert('担当名を入力してください。');
        return;
    }
    if (!formData.phoneNumber) {
        alert('送信先電話番号を入力してください。');
        return;
    }
    if (!formData.template && !formData.freeText) {
        alert('定型文または自由文のいずれかを入力してください。');
        return;
    }
    
    let message = '';
    const hasTemplate = formData.template.trim() !== '';
    const hasFreeText = formData.freeText.trim() !== '';

    if (hasTemplate && hasFreeText) {
        message = `【定型文】\n${formData.template}\n\n【自由文】\n${formData.freeText}`;
    } else if (hasTemplate) {
        message = formData.template;
    } else if (hasFreeText) {
        message = formData.freeText;
    }
    setFinalMessage(message);
    setIsModalOpen(true);
  };
  
  const handleConfirmSend = async () => {
    setIsSending(true);
    try {
        await gasService.sendMessage({
            operator: formData.operator,
            phoneNumber: formData.phoneNumber,
            message: finalMessage,
        });
        alert('送信成功しました');
        setIsModalOpen(false);
        resetForm();
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        } else {
            alert('送信に失敗しました。時間をおいて再度お試しください。');
        }
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">SMS送信</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">担当名</label>
          <input
            type="text"
            id="operator"
            name="operator"
            value={formData.operator}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">送信先電話番号</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 transition duration-150 ease-in-out"
            required
          />
          <p className="text-xs text-gray-500 mt-1">国内形式（090...）または国際形式（+8180...）で入力</p>
        </div>
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">定型文</label>
          <select
            id="template"
            name="template"
            value={formData.template}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 transition duration-150 ease-in-out bg-white"
          >
            <option value="">{isLoadingTemplates ? '読み込み中...' : '選択してください'}</option>
            {templates.map((t, index) => <option key={index} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="freeText" className="block text-sm font-medium text-gray-700 mb-1">自由文</label>
          <textarea
            id="freeText"
            name="freeText"
            value={formData.freeText}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-150 ease-in-out"
          >
            送信
          </button>
        </div>
      </form>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSend}
        title="送信内容の確認"
        isConfirming={isSending}
      >
        <div className="space-y-4">
            <div>
                <p className="font-semibold text-gray-600">担当名:</p>
                <p className="text-gray-800">{formData.operator}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-600">送信先電話番号:</p>
                <p className="text-gray-800">{formData.phoneNumber}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-600">送信内容プレビュー:</p>
                <p className="text-gray-800 whitespace-pre-wrap bg-gray-100 p-3 rounded-md">{finalMessage}</p>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default SendPage;
