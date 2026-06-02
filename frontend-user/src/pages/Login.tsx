import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Login() {
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
    onError: (err: any) => setForgotMsg(err.response?.data?.message || '操作失败'),
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>欢迎回来</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-muted)' }}>登录您的账户以继续购物</p>
        </div>

        {loginMutation.isError && (
          <div
            className="p-3 rounded-[3px] mb-5 text-sm font-medium"
            style={{ background: 'var(--color-terra-bg)', color: 'var(--color-terra)' }}
          >
            {(loginMutation.error as any)?.response?.data?.message || '登录失败'}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>邮箱</label>
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>密码</label>
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
            {loginMutation.isPending ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm space-y-2">
          <p style={{ color: 'var(--color-ink-muted)' }}>
            还没有账号？<Link to="/register" style={{ color: 'var(--color-terra)' }} className="hover:opacity-70 font-medium">立即注册</Link>
          </p>
          <p>
            <button
              onClick={() => setShowForgot(!showForgot)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              忘记密码？
            </button>
          </p>
        </div>

        {showForgot && (
          <div
            className="mt-4 p-4 rounded-[3px]"
            style={{ background: 'var(--color-paper-warm)' }}
          >
            <p className="text-sm mb-3" style={{ color: 'var(--color-ink-light)' }}>
              输入注册邮箱，密码将重置为 123456
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="input-field flex-1"
              />
              <button
                onClick={() => forgotMutation.mutate()}
                disabled={forgotMutation.isPending}
                className="btn-primary text-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                重置
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
