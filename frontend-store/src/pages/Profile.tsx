import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user, login: updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const profileMutation = useMutation({
    mutationFn: () => authApi.updateProfile(name),
    onSuccess: (res) => {
      setNameMsg(res.data.message || '修改成功');
      const accessToken = sessionStorage.getItem('accessToken') || '';
      const refreshToken = sessionStorage.getItem('refreshToken') || '';
      updateUser(res.data.user, accessToken, refreshToken);
    },
    onError: (err: any) => setNameMsg(err.response?.data?.message || '修改失败'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.updatePassword(oldPassword, newPassword),
    onSuccess: (res) => {
      setPasswordMsg(res.data.message || '修改成功');
      setOldPassword('');
      setNewPassword('');
    },
    onError: (err: any) => setPasswordMsg(err.response?.data?.message || '修改失败'),
  });

  const cardStyle = {
    background: 'var(--color-slate-900)',
    border: '1px solid var(--color-slate-800)',
    borderRadius: 'var(--radius-card)',
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ marginBottom: '1.25rem' }}>个人中心</h1>

      <div className="p-5 mb-4" style={cardStyle}>
        <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>基本信息</h2>
        <div className="text-xs space-y-2" style={{ color: 'var(--color-slate-400)' }}>
          <p>邮箱：{user?.email}</p>
          <p>角色：{user?.role}</p>
        </div>
      </div>

      <div className="p-5 mb-4" style={cardStyle}>
        <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>修改用户名</h2>
        <div className="flex gap-2">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="input-field flex-1"
          />
          <button
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
            className="btn-primary text-xs"
          >
            保存
          </button>
        </div>
        {nameMsg && (
          <p
            className="mt-2 text-xs font-medium"
            style={{ color: nameMsg.includes('失败') ? 'var(--color-red-soft)' : 'var(--color-emerald)' }}
          >
            {nameMsg}
          </p>
        )}
      </div>

      <div className="p-5" style={cardStyle}>
        <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>修改密码</h2>
        <div className="space-y-3">
          <input
            type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            placeholder="旧密码" className="input-field"
          />
          <input
            type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            placeholder="新密码（至少6位）" className="input-field"
          />
          <button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || newPassword.length < 6}
            className="btn-primary w-full"
            style={{ background: 'var(--color-slate-200)', color: 'var(--color-slate-900)' }}
          >
            修改密码
          </button>
        </div>
        {passwordMsg && (
          <p
            className="mt-2 text-xs font-medium"
            style={{ color: passwordMsg.includes('失败') ? 'var(--color-red-soft)' : 'var(--color-emerald)' }}
          >
            {passwordMsg}
          </p>
        )}
      </div>
    </div>
  );
}
