import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { HiLink } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-10 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
            <HiLink className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">WebLinks</h1>
            <p className="text-sm text-gray-500 mt-1">Your personal web library, organized.</p>
          </div>
        </div>

        <div className="w-full border-t border-gray-100" />

        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-gray-700">Sign in to continue</p>

          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold text-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            ) : (
              <FcGoogle className="text-2xl flex-shrink-0" />
            )}
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg w-full text-center border border-red-100">
              {error}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          By signing in, you agree to our terms of service.
          <br />Your bookmarks are private and synced to your account.
        </p>
      </div>
    </div>
  );
}
