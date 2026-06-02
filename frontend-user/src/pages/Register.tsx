import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({ name, email, password, role: 'USER' }),
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
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>创建账户</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-muted)' }}>注册即可开始购物</p>
        </div>

        {successMsg && (
          <div
            className="p-3 rounded-[3px] mb-5 text-sm font-medium"
            style={{ background: 'var(--color-sage-bg)', color: 'var(--color-sage)' }}
          >
            {successMsg}
          </div>
        )}
        {registerMutation.isError && (
          <div
            className="p-3 rounded-[3px] mb-5 text-sm font-medium"
            style={{ background: 'var(--color-terra-bg)', color: 'var(--color-terra)' }}
          >
            {(registerMutation.error as any)?.response?.data?.message || '注册失败'}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>用户名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
              autoComplete="name"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="btn-primary w-full"
          >
            {registerMutation.isPending ? '注册中...' : '注册'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
          已有账号？<Link to="/login" style={{ color: 'var(--color-terra)' }} className="hover:opacity-70 font-medium">立即登录</Link>
        </p>
      </div>
    </div>
  );
}
