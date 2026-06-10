import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
  const { lang, t, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const NAV_ITEMS = [
    { path: '/', label: t('nav.dashboard'), match: (p: string) => p === '/' },
    { path: '/products', label: t('nav.products'), match: (p: string) => p === '/products' || p.startsWith('/products/') },
    { path: '/orders', label: t('nav.orders'), match: (p: string) => p === '/orders' || p.startsWith('/orders/') },
    { path: '/profile', label: t('nav.profile'), match: (p: string) => p === '/profile' },
  ];

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/login');
  };

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  const currentNavLabel = NAV_ITEMS.find((i) => i.match(location.pathname))?.label || '';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-slate-950)' }}>
      <aside
        className="w-52 shrink-0 flex flex-col border-r"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)' }}
      >
        <div className="px-5 py-4">
          <Link
            to="/"
            className="text-base tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-slate-100)' }}
          >
            {t('nav.title')}
          </Link>
        </div>
        {isLoggedIn && (
          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = item.match(location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-[4px] text-sm transition-colors duration-100"
                  style={{
                    color: active ? 'var(--color-amber)' : 'var(--color-slate-400)',
                    background: active ? 'var(--color-amber-bg)' : 'transparent',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
        {isLoggedIn && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--color-slate-800)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--color-slate-400)' }}>{user?.name}</div>
            <button
              onClick={handleLogout}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-slate-500)' }}
            >
              {t('nav.logout')}
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-12 flex items-center justify-between px-6 border-b shrink-0"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-slate-500)' }}>
            {currentNavLabel}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--color-slate-500)' }}>
              {user?.name}
            </span>
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
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
        </header>
        <main className="flex-1 p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
