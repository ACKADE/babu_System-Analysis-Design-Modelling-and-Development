import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { cartApi, type CartItem } from '../api/cart';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
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
            简易商城
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              商品
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/cart" className={`nav-link relative ${isActive('/cart') ? 'active' : ''}`}>
                  购物车
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
                  我的订单
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
                      个人中心
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--color-terra)' }}
                    >
                      退出登录
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
                登录
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-5 py-8 w-full page-enter">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center" style={{ borderColor: 'var(--color-paper-dark)' }}>
        <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>简易商城 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
