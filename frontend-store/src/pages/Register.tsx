import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function Register() {
  const { lang, t, setLang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({ name, email, password, role: 'ADMIN' }),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      login(user, accessToken, refreshToken);
      if (res.status === 200) {
        setSuccessMsg(res.data.message);
      }
      setTimeout(() => navigate('/', { replace: true }), 800);
    },
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
              {t('auth.createAccount')}
            </h1>
            <p className="text-xs mt-2" style={{ color: 'var(--color-slate-500)' }}>
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {successMsg && (
            <div
              className="p-3 rounded-[4px] mb-5 text-xs font-medium"
              style={{ background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)' }}
            >
              {successMsg}
            </div>
          )}
          {registerMutation.isError && (
            <div
              className="p-3 rounded-[4px] mb-5 text-xs font-medium"
              style={{ background: 'var(--color-red-bg)', color: 'var(--color-red-soft)' }}
            >
              {(registerMutation.error as any)?.response?.data?.message || t('auth.registerFailed')}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>{t('auth.username')}</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" required autoComplete="name"
              />
            </div>
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
                className="input-field" required minLength={6} autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full">
              {registerMutation.isPending ? t('auth.registering') : t('auth.register')}
            </button>
          </form>
          <p className="mt-5 text-center text-xs" style={{ color: 'var(--color-slate-500)' }}>
            {t('auth.hasAccount')}<Link to="/login" style={{ color: 'var(--color-amber)' }} className="hover:opacity-70 font-medium">{t('auth.loginNow')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
