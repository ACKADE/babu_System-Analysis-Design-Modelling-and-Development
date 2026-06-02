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

  return (
    <div className="max-w-lg mx-auto page-enter">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>个人中心</h1>

      <div
        className="rounded-[3px] p-5 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>基本信息</h2>
        <div className="text-sm space-y-2" style={{ color: 'var(--color-ink-light)' }}>
          <p>邮箱：{user?.email}</p>
          <p>角色：{user?.role}</p>
        </div>
      </div>

      <div
        className="rounded-[3px] p-5 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>修改用户名</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field flex-1"
          />
          <button
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
            className="btn-primary text-sm"
          >
            保存
          </button>
        </div>
        {nameMsg && (
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: nameMsg.includes('失败') ? 'var(--color-terra)' : 'var(--color-sage)' }}
          >
            {nameMsg}
          </p>
        )}
      </div>

      <div
        className="rounded-[3px] p-5"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>修改密码</h2>
        <div className="space-y-3">
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="旧密码"
            className="input-field"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="新密码（至少6位）"
            className="input-field"
          />
          <button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || newPassword.length < 6}
            className="btn-primary w-full"
            style={{ background: 'var(--color-ink)' }}
          >
            修改密码
          </button>
        </div>
        {passwordMsg && (
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: passwordMsg.includes('失败') ? 'var(--color-terra)' : 'var(--color-sage)' }}
          >
            {passwordMsg}
          </p>
        )}
      </div>
    </div>
  );
}
