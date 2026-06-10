import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { cartApi, type CartItem } from '../api/cart';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
  const { lang, t, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getAll,
    enabled: isLoggedIn,
  });
  const cartCount = cartItems?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen flex flex-col paper-texture" style={{ background: 'var(--color-paper)' }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-sm"
        style={{
          background: 'rgba(250, 247, 242, 0.92)',
          boxShadow: 'var(--shadow-nav)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
          >
            {t('nav.title')}
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              {t('nav.products')}
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/cart" className={`nav-link relative ${isActive('/cart') ? 'active' : ''}`}>
                  {t('nav.cart')}
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-2 -right-3.5 text-white text-[11px] rounded-full flex items-center justify-center font-medium"
                      style={{ background: 'var(--color-terra)', minWidth: '18px', height: '18px', lineHeight: '18px' }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
                  {t('nav.myOrders')}
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-sm cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {user?.name}
                  <span className="ml-0.5 text-[10px] align-middle" style={{ color: 'var(--color-ink-muted)' }}>▼</span>
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 rounded-[3px] py-1 z-50"
                    style={{
                      background: 'white',
                      boxShadow: 'var(--shadow-card-hover)',
                      border: '1px solid var(--color-paper-dark)',
                    }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--color-ink-light)' }}
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--color-terra)' }}
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-terra)' }}
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center text-[11px] font-semibold tracking-wide uppercase rounded-[3px] px-2.5 py-1 transition-all duration-200 select-none"
              style={{
                color: 'var(--color-ink)',
                border: '1px solid var(--color-ink-light)',
                background: 'var(--color-paper-warm)',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--color-terra)';
                e.currentTarget.style.background = 'var(--color-terra)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-ink)';
                e.currentTarget.style.borderColor = 'var(--color-ink-light)';
                e.currentTarget.style.background = 'var(--color-paper-warm)';
              }}
              title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-5 py-8 w-full page-enter">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center" style={{ borderColor: 'var(--color-paper-dark)' }}>
        <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{t('footer.copyright')} &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
