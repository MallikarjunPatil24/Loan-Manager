import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Coins, 
  FilePlus, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  User,
  CreditCard
} from 'lucide-react';

const BankLogo = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 8L112 28V68C112 96 92 116 64 124C36 116 16 68 16 68V28L64 8Z" fill="#1A2B4A" stroke="#D4A017" strokeWidth="6"/>
    <path d="M40 90V65C40 63.8954 40.8954 63 42 63H52C53.1046 63 54 63.8954 54 65V90" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round"/>
    <path d="M60 90V45C60 43.8954 60.8954 43 62 43H72C73.1046 43 74 43.8954 74 45V90" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round"/>
    <path d="M80 90V25C80 23.8954 80.8954 23 82 23H92C93.1046 23 94 23.8954 94 25V90" stroke="#D4A017" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <>{children}</>;

  const isManager = user.role === 'bank_manager';

  const customerLinks = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Loans', path: '/customer/loans', icon: Coins },
    { name: 'Apply for Loan', path: '/customer/apply', icon: FilePlus },
  ];

  const managerLinks = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Loan Requests', path: '/manager/loans', icon: Coins },
  ];

  const navigation = isManager ? managerLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-brand-navy text-slate-100 z-30`}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-950/40 border-b border-slate-800">
            <BankLogo className="h-6 w-6 mr-2.5" />
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight text-white">Unnati Loans</h1>
              <p className="text-[10px] text-brand-gold font-medium tracking-wide uppercase">Services Portal</p>
            </div>
          </div>
          
          <nav className="mt-6 flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-brand-gold text-slate-950 shadow-md font-semibold'
                      : 'text-slate-300 hover:bg-brand-navyLight hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 flex border-t border-slate-800 p-4 bg-slate-950/20">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <div className="bg-brand-navyLight p-1.5 rounded-full text-brand-gold">
                  <User className="h-4 w-4" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex flex-col flex-1 md:pl-64">
        <header className="sticky top-0 z-20 flex-shrink-0 flex h-16 bg-white border-b border-slate-200 justify-between items-center px-4 md:px-6 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-1.5 md:hidden">
            <BankLogo className="h-5 w-5" />
            <span className="font-display font-bold text-sm text-brand-navy">Unnati Loans</span>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 capitalize">
              Role: {user.role.replace('_', ' ')}
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-brand-navy text-slate-100">
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-950/40 border-b border-slate-800">
                <BankLogo className="h-6 w-6 mr-2.5" />
                <div>
                  <h1 className="font-display font-bold text-sm tracking-tight text-white">Unnati Loans</h1>
                  <p className="text-[10px] text-brand-gold font-medium uppercase">Services Portal</p>
                </div>
              </div>

              <nav className="mt-6 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-lg ${
                        isActive
                          ? 'bg-brand-gold text-slate-950 font-semibold'
                          : 'text-slate-300 hover:bg-brand-navyLight hover:text-white'
                      }`}
                    >
                      <Icon className="mr-4 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex-shrink-0 flex border-t border-slate-800 p-4 bg-slate-950/20">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center">
                    <div className="bg-brand-navyLight p-1.5 rounded-full text-brand-gold">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-white">{user.full_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-400 p-2 rounded-lg"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
