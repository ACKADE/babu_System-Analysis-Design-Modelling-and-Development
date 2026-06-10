import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      login(user, accessToken, refreshToken);
      navigate(from, { replace: true });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(forgotEmail),
    onSuccess: (res) => setForgotMsg(res.data.message),
    onError: (err: any) => setForgotMsg(err.response?.data?.message || t('common.error')),
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>{t('auth.welcomeBack')}</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-muted)' }}>{t('auth.loginSubtitle')}</p>
        </div>

        {loginMutation.isError && (
          <div
            className="p-3 rounded-[3px] mb-5 text-sm font-medium"
            style={{ background: 'var(--color-terra-bg)', color: 'var(--color-terra)' }}
          >
            {(loginMutation.error as any)?.response?.data?.message || t('auth.loginFailed')}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-primary w-full"
          >
            {loginMutation.isPending ? t('auth.signingIn') : t('auth.login')}
          </button>
        </form>

        <div className="mt-5 text-center text-sm space-y-2">
          <p style={{ color: 'var(--color-ink-muted)' }}>
            {t('auth.noAccount')}<Link to="/register" style={{ color: 'var(--color-terra)' }} className="hover:opacity-70 font-medium">{t('auth.registerNow')}</Link>
          </p>
          <p>
            <button
              onClick={() => setShowForgot(!showForgot)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              {t('auth.forgotPassword')}
            </button>
          </p>
        </div>

        {showForgot && (
          <div
            className="mt-4 p-4 rounded-[3px]"
            style={{ background: 'var(--color-paper-warm)' }}
          >
            <p className="text-sm mb-3" style={{ color: 'var(--color-ink-light)' }}>
              {t('auth.forgotHint')}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder={t('auth.forgotPlaceholder')}
                className="input-field flex-1"
              />
              <button
                onClick={() => forgotMutation.mutate()}
                disabled={forgotMutation.isPending}
                className="btn-primary text-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                {t('auth.reset')}
              </button>
            </div>
            {forgotMsg && (
              <p className="mt-2 text-sm font-medium" style={{ color: 'var(--color-sage)' }}>{forgotMsg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
