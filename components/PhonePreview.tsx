import React from 'react';

interface PhonePreviewProps {
  phoneNumber: string;
  message: string;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ phoneNumber, message }) => {
  return (
    <div className="w-80 h-[580px] bg-white border-8 border-slate-800 rounded-4xl shadow-2xl overflow-hidden flex flex-col">
      {/* Notch */}
      <div className="w-full h-6 bg-slate-800 flex justify-center items-center">
          <div className="w-1/2 h-2 bg-slate-900 rounded-b-lg"></div>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-slate-200 bg-slate-50">
        <p className="text-center font-semibold text-slate-700">{phoneNumber || '電話番号'}</p>
      </div>

      {/* Message Area */}
      <div className="flex-grow p-4 flex flex-col justify-end bg-slate-100/50">
        <div className="flex justify-end mb-2">
            <div className="bg-cyan-500 text-white rounded-2xl rounded-br-lg p-3 max-w-xs break-words">
                <p>{message || 'メッセージがここに表示されます...'}</p>
            </div>
        </div>
      </div>
      
      {/* Input bar */}
      <div className="flex-shrink-0 p-2 border-t border-slate-200 bg-slate-50 flex items-center">
        <div className="flex-grow h-9 bg-slate-200 rounded-full"></div>
        <div className="ml-2 w-8 h-8 rounded-full bg-cyan-500"></div>
      </div>
    </div>
  );
};

export default PhonePreview;