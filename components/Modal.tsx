import React from 'react';
import Spinner from './Spinner';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  isConfirming?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children, isConfirming = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} disabled={isConfirming} className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="mt-4 text-slate-600">
          {children}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
          >
            {isConfirming && <Spinner />}
            送信
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;