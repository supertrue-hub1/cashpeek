'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, CreditCard, Scale, Sun, Moon, ChevronDown, Smartphone, CreditCard as CardIcon, CheckCircle, AlertCircle, Percent, LogOut, User, Home, Users, Clock, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/auth-modal';
import { SearchBar } from '@/components/search-bar';

interface HeaderProps {
  className?: string;
}

const navLinks = [
  { href: '/sravnit', label: 'Сравнить', icon: Scale },
];

// Первая колонка меню Займы
const loansSubMenuColumn1 = [
  { href: '/zaimy', label: 'Все займы', icon: Smartphone },
  { href: '/zaimy/na-kartu', label: 'На карту', icon: CardIcon },
  { href: '/zaimy/bez-otkaza', label: 'Без отказа', icon: CheckCircle },
  { href: '/zaimy/bez-proverki-ki', label: 'С плохой КИ', icon: AlertCircle },
  { href: '/zaimy/bez-procentov', label: 'Без процентов', icon: Percent },
];

// Вторая колонка меню Займы
const loansSubMenuColumn2 = [
  { href: '/zaimy/bez-raboty', label: 'Безработным', icon: Users },
  { href: '/zaimy/dlya-pensionerov', label: 'Пенсионерам', icon: CreditCard },
  { href: '/zaimy/onlain', label: 'Онлайн срочно', icon: Clock },
  { href: '/zaimy/studentam', label: 'Студентам', icon: GraduationCap },
  { href: '/zaimy/na-dlitelnyy-srok', label: 'На длительный срок', icon: Calendar },
];

// Simple theme toggle button
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
        aria-label="Переключить тему"
      >
        <Sun className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
      aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
}

export function Header({ className }: HeaderProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loansMenuOpen, setLoansMenuOpen] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const loansMenuRef = React.useRef<HTMLDivElement>(null);

  const handleCabinetClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full',
          'bg-background/80 backdrop-blur-md',
          'border-b border-border',
          className
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm transition-shadow group-hover:shadow-md">
              <CreditCard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              cash<span className="text-primary">peek</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-8">
            {/* Главная */}
            <a
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Главная
            </a>
            
            {/* Loans Dropdown с hover */}
            <div 
              className="relative"
              ref={loansMenuRef}
              onMouseEnter={() => setLoansMenuOpen(true)}
              onMouseLeave={() => setLoansMenuOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:text-primary outline-none">
                Займы
                <ChevronDown className={`h-4 w-4 transition-transform ${loansMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Content - Two Columns */}
              {loansMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="w-[420px] rounded-xl border border-border bg-background shadow-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Первая колонка */}
                      <div className="space-y-0.5">
                        {loansSubMenuColumn1.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer text-sm"
                          >
                            <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-foreground">{item.label}</span>
                          </a>
                        ))}
                      </div>
                      
                      {/* Вторая колонка */}
                      <div className="space-y-0.5">
                        {loansSubMenuColumn2.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer text-sm"
                          >
                            <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-foreground">{item.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
                
            {/* Other nav links */}
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <SearchBar />
            <ThemeToggle />
            
            {session ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                title="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setAuthModalOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Войти
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <SearchBar />
            <ThemeToggle />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-md md:hidden">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {/* Главная */}
                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <Home className="h-4 w-4 text-primary" />
                  Главная
                </a>
                
                {/* Divider */}
                <div className="my-2 border-t border-border" />
                
                {/* Loans submenu header */}
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Займы
                </div>
                {loansSubMenuColumn1.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </a>
                ))}
                {loansSubMenuColumn2.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </a>
                ))}
                
                {/* Divider */}
                <div className="my-2 border-t border-border" />
                
                {/* Other nav links */}
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                {session ? (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full border-border text-foreground hover:bg-accent"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Войти
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        callbackUrl="/cabinet"
      />
    </>
  );
}
