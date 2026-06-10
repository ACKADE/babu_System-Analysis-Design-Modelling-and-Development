import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function Login() {
  const { lang, t, setLang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      const ok = login(user, accessToken, refreshToken);
      if (!ok) {
        setLocalError(t('auth.adminOnly'));
      } else {
        navigate('/', { replace: true });
      }
    },
    onError: () => setLocalError(''),
  });

  const forgotMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(forgotEmail),
    onSuccess: (res) => setForgotMsg(res.data.message),
    onError: (err: any) => setForgotMsg(err.response?.data?.message || t('common.error')),
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center text-[11px] font-semibold tracking-wide uppercase rounded-[4px] px-2.5 py-1 transition-all duration-200 select-none"
            style={{
              color: 'var(--color-slate-300)',
              border: '1px solid var(--color-slate-600)',
              background: 'var(--color-slate-800)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-slate-950)';
              e.currentTarget.style.borderColor = 'var(--color-amber)';
              e.currentTarget.style.background = 'var(--color-amber)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-slate-300)';
              e.currentTarget.style.borderColor = 'var(--color-slate-600)';
              e.currentTarget.style.background = 'var(--color-slate-800)';
            }}
            title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
        <div
          className="rounded-[4px] p-6"
          style={{ background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
        >
          <div className="text-center mb-6">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-slate-100)' }}>
              {t('auth.title')}
            </h1>
            <p className="text-xs mt-2" style={{ color: 'var(--color-slate-500)' }}>
              {t('auth.subtitle')}
            </p>
          </div>

          {(loginMutation.isError || localError) && (
            <div
              className="p-3 rounded-[4px] mb-5 text-xs font-medium"
              style={{ background: 'var(--color-red-bg)', color: 'var(--color-red-soft)' }}
            >
              {localError || (loginMutation.error as any)?.response?.data?.message || t('auth.loginFailed')}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); setLocalError(''); loginMutation.mutate(); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>{t('auth.email')}</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" required autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>{t('auth.password')}</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" required autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={loginMutation.isPending} className="btn-primary w-full">
              {loginMutation.isPending ? t('auth.signingIn') : t('auth.login')}
            </button>
          </form>

          <div className="mt-5 text-center text-xs space-y-2">
            <p style={{ color: 'var(--color-slate-500)' }}>
              {t('auth.noAccount')}<Link to="/register" style={{ color: 'var(--color-amber)' }} className="hover:opacity-70 font-medium">{t('auth.registerNow')}</Link>
            </p>
            <p>
              <button
                onClick={() => setShowForgot(!showForgot)}
                className="hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-slate-500)' }}
              >
                {t('auth.forgotPassword')}
              </button>
            </p>
          </div>

          {showForgot && (
            <div
              className="mt-4 p-4 rounded-[4px]"
              style={{ background: 'var(--color-slate-850)', border: '1px solid var(--color-slate-800)' }}
            >
              <p className="text-xs mb-3" style={{ color: 'var(--color-slate-400)' }}>
                {t('auth.forgotHint')}
              </p>
              <div className="flex gap-2">
                <input
                  type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={t('auth.forgotPlaceholder')} className="input-field flex-1"
                />
                <button
                  onClick={() => forgotMutation.mutate()}
                  disabled={forgotMutation.isPending}
                  className="btn-primary text-xs"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t('auth.reset')}
                </button>
              </div>
              {forgotMsg && (
                <p className="mt-2 text-xs font-medium" style={{ color: 'var(--color-emerald)' }}>{forgotMsg}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
