import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/', label: '仪表盘', match: (p: string) => p === '/' },
  { path: '/products', label: '商品管理', match: (p: string) => p === '/products' || p.startsWith('/products/') },
  { path: '/orders', label: '订单管理', match: (p: string) => p === '/orders' || p.startsWith('/orders/') },
  { path: '/profile', label: '个人中心', match: (p: string) => p === '/profile' },
];

export function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/login');
  };

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
            商店管理
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
              退出登录
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
            {NAV_ITEMS.find((i) => i.match(location.pathname))?.label || ''}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-slate-500)' }}>
            {user?.name}
          </span>
        </header>
        <main className="flex-1 p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
