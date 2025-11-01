import React, { useState } from 'react';
import * as auth from '../services/authService';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = isLogin
        ? await auth.login(email, password)
        : await auth.register(email, password);
      onAuthSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col p-4">
        <main className="flex-grow flex flex-col items-center justify-center">
            <div className="flex items-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mr-4 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-200 tracking-wide">
                    Vendor Threat Intelligence Analyzer
                </h1>
            </div>

            <div className="w-full max-w-md bg-[#161b22] p-8 rounded-lg border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
                {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            
            {error && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-2 rounded-md mb-4 text-sm" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                    disabled={isLoading}
                />
                </div>
                <div>
                {/* FIX: Removed invalid 'a' property from label element. */}
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                    disabled={isLoading}
                />
                </div>
                <div>
                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                    ) : (
                    isLogin ? 'Sign In' : 'Register'
                    )}
                </button>
                </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                }}
                className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2"
                >
                {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
            </div>
        </main>
        <footer className="text-center p-4 flex-shrink-0">
            <p className="text-xs text-gray-600 font-mono">
                Threat Intelligence concept by Khalid Lakdawala
            </p>
        </footer>
    </div>
  );
};