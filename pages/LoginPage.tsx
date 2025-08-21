import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    const success = await login(password);
    if (!success) {
      setError('パスワードが正しくありません。');
    }
    setIsLoggingIn(false);
  };

  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-xl p-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">天才リーチ！</h1>
                <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                    SMSスーパー送信システム<br />
                    パスワードはコールセンターすまえるチャットの概要欄に記載。
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password-input" className="sr-only">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon />
                </div>
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
                    placeholder="パスワード"
                    required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn && <Spinner />}
                ログイン
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;