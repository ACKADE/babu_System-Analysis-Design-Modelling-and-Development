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
        <div
          className="rounded-[4px] p-6"
          style={{ background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
        >
          <div className="text-center mb-6">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-slate-100)' }}>
              注册商店账号
            </h1>
            <p className="text-xs mt-2" style={{ color: 'var(--color-slate-500)' }}>
              创建管理员账户
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
              {(registerMutation.error as any)?.response?.data?.message || '注册失败'}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>用户名</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" required autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>邮箱</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" required autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>密码</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" required minLength={6} autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full">
              {registerMutation.isPending ? '注册中...' : '注册'}
            </button>
          </form>
          <p className="mt-5 text-center text-xs" style={{ color: 'var(--color-slate-500)' }}>
            已有账号？<Link to="/login" style={{ color: 'var(--color-amber)' }} className="hover:opacity-70 font-medium">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
