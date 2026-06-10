import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function Profile() {
  const { t } = useLanguage();
  const { user, login: updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const profileMutation = useMutation({
    mutationFn: () => authApi.updateProfile(name),
    onSuccess: (res) => {
      setNameMsg(res.data.message || t('profile.updateSuccess'));
      const accessToken = sessionStorage.getItem('accessToken') || '';
      const refreshToken = sessionStorage.getItem('refreshToken') || '';
      updateUser(res.data.user, accessToken, refreshToken);
    },
    onError: (err: any) => setNameMsg(err.response?.data?.message || t('profile.updateFailed')),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.updatePassword(oldPassword, newPassword),
    onSuccess: (res) => {
      setPasswordMsg(res.data.message || t('profile.updateSuccess'));
      setOldPassword('');
      setNewPassword('');
    },
    onError: (err: any) => setPasswordMsg(err.response?.data?.message || t('profile.updateFailed')),
  });

  const isFailed = (msg: string) => msg && (msg.includes('失败') || msg.includes('Failed') || msg.includes('failed'));

  const cardStyle = {
    background: 'var(--color-slate-900)',
    border: '1px solid var(--color-slate-800)',
    borderRadius: 'var(--radius-card)',
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ marginBottom: '1.25rem' }}>{t('profile.title')}</h1>

      <div className="p-5 mb-4" style={cardStyle}>
        <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>{t('profile.basicInfo')}</h2>
        <div className="text-xs space-y-2" style={{ color: 'var(--color-slate-400)' }}>
          <p>{t('profile.emailLabel')}{user?.email}</p>
          <p>{t('profile.roleLabel')}{user?.role}</p>
        </div>
      </div>

      <div className="p-5 mb-4" style={cardStyle}>
        <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>{t('profile.changeName')}</h2>
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
            {t('common.save')}
          </button>
        </div>
        {nameMsg && (
          <p
            className="mt-2 text-xs font-medium"
            style={{ color: isFailed(nameMsg) ? 'var(--color-red-soft)' : 'var(--color-emerald)' }}
          >
            {nameMsg}
          </p>
        )}
      </div>

      <div className="p-5" style={cardStyle}>
        <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>{t('profile.changePassword')}</h2>
        <div className="space-y-3">
          <input
            type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t('profile.oldPassword')} className="input-field"
          />
          <input
            type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('profile.newPassword')} className="input-field"
          />
          <button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || newPassword.length < 6}
            className="btn-primary w-full"
            style={{ background: 'var(--color-slate-200)', color: 'var(--color-slate-900)' }}
          >
            {t('profile.passwordBtn')}
          </button>
        </div>
        {passwordMsg && (
          <p
            className="mt-2 text-xs font-medium"
            style={{ color: isFailed(passwordMsg) ? 'var(--color-red-soft)' : 'var(--color-emerald)' }}
          >
            {passwordMsg}
          </p>
        )}
      </div>
    </div>
  );
}
