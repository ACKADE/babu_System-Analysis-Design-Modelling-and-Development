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

  return (
    <div className="max-w-lg mx-auto page-enter">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('profile.title')}</h1>

      <div
        className="rounded-[3px] p-5 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>{t('profile.basicInfo')}</h2>
        <div className="text-sm space-y-2" style={{ color: 'var(--color-ink-light)' }}>
          <p>{t('profile.emailLabel')}{user?.email}</p>
          <p>{t('profile.roleLabel')}{user?.role}</p>
        </div>
      </div>

      <div
        className="rounded-[3px] p-5 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>{t('profile.changeName')}</h2>
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
            {t('common.save')}
          </button>
        </div>
        {nameMsg && (
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: isFailed(nameMsg) ? 'var(--color-terra)' : 'var(--color-sage)' }}
          >
            {nameMsg}
          </p>
        )}
      </div>

      <div
        className="rounded-[3px] p-5"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>{t('profile.changePassword')}</h2>
        <div className="space-y-3">
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t('profile.oldPassword')}
            className="input-field"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('profile.newPassword')}
            className="input-field"
          />
          <button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || newPassword.length < 6}
            className="btn-primary w-full"
            style={{ background: 'var(--color-ink)' }}
          >
            {t('profile.passwordBtn')}
          </button>
        </div>
        {passwordMsg && (
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: isFailed(passwordMsg) ? 'var(--color-terra)' : 'var(--color-sage)' }}
          >
            {passwordMsg}
          </p>
        )}
      </div>
    </div>
  );
}
