'use client';

import * as React from 'react';
import { Search, X, Clock, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Suggestion {
  id: string;
  text: string;
  icon?: React.ReactNode;
  category?: string;
  url?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

// Утилита debounce
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Демо подсказки
const DEMO_SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'Займ на карту', category: 'Популярное', url: '/zaimy/na-kartu', icon: <TrendingUp className="h-4 w-4 text-primary" /> },
  { id: '2', text: 'Займ без отказа', category: 'Популярное', url: '/zaimy/bez-otkaza', icon: <TrendingUp className="h-4 w-4 text-primary" /> },
  { id: '3', text: 'Займ без процентов', category: 'Популярное', url: '/zaimy/bez-procentov', icon: <TrendingUp className="h-4 w-4 text-primary" /> },
  { id: '4', text: 'Займ с плохой КИ', category: 'Рекомендуем', url: '/zaimy/bez-proverki-ki' },
  { id: '5', text: 'Срочный займ онлайн', category: 'Рекомендуем', url: '/zaimy/onlain' },
];

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchBar({ placeholder = 'Поиск займов...', className }: SearchBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [mounted, setMounted] = React.useState(false);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Загрузка истории из localStorage (только на клиенте)
  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Закрытие при клике вне
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Сохранение в историю
  const saveToHistory = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)]
      .slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  // Удаление из истории
  const removeFromHistory = (searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(q => q !== searchQuery);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  // Очистка истории
  const clearHistory = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  // Debounced поиск
  const debouncedSearch = React.useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        // Имитация поиска
        setTimeout(() => {
          const filtered = DEMO_SUGGESTIONS.filter(s => 
            s.text.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSuggestions(filtered);
          setIsLoading(false);
        }, 200);
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  // Выбор подсказки
  const selectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    saveToHistory(suggestion.text);
    setIsOpen(false);
    if (suggestion.url) {
      router.push(suggestion.url);
    }
  };

  // Выбор из истории
  const selectRecent = (searchQuery: string) => {
    setQuery(searchQuery);
    saveToHistory(searchQuery);
    setIsOpen(false);
    // Поиск по сайту
    router.push(`/sravnit?q=${encodeURIComponent(searchQuery)}`);
  };

  // Отправка поиска
  const handleSearch = () => {
    if (query.trim()) {
      saveToHistory(query.trim());
      setIsOpen(false);
      router.push(`/sravnit?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Клавиатурная навигация
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      const totalItems = suggestions.length + recentSearches.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (selectedIndex < recentSearches.length) {
              selectRecent(recentSearches[selectedIndex]);
            } else {
              selectSuggestion(suggestions[selectedIndex - recentSearches.length]);
            }
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, recentSearches, selectedIndex, query]);

  // Подсветка совпадений
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
        : part
    );
  };

  const shouldShowDropdown = mounted && isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div 
        className={cn(
          'flex items-center gap-2 rounded-full border transition-all duration-300',
          'bg-background/80 backdrop-blur-md',
          isOpen 
            ? 'w-64 md:w-80 border-primary shadow-md' 
            : 'w-9 md:w-9 border-border hover:border-primary/50',
          'overflow-hidden'
        )}
      >
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-primary transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
            
            {query && (
              <button
                onClick={() => setQuery('')}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div className={cn(
          'absolute top-full right-0 mt-2 w-72 md:w-80',
          'bg-background/95 backdrop-blur-lg',
          'border border-border rounded-lg shadow-lg',
          'max-h-80 overflow-y-auto',
          'animate-in fade-in slide-in-from-top-2 duration-200',
          'z-50'
        )}>
          {/* Загрузка */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Поиск...</span>
            </div>
          )}

          {/* Недавние поиски */}
          {!isLoading && query.length < 2 && recentSearches.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Недавние</span>
                <button 
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Очистить
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => selectRecent(search)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    selectedIndex === index && 'bg-accent'
                  )}
                >
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{search}</span>
                  <button
                    onClick={(e) => removeFromHistory(search, e)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </>
          )}

          {/* Подсказки */}
          {!isLoading && suggestions.length > 0 && (
            <>
              <div className="px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Результаты</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => selectSuggestion(suggestion)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    selectedIndex === recentSearches.length + index && 'bg-accent'
                  )}
                >
                  {suggestion.icon || <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <span className="flex-1 text-sm truncate">{highlightMatch(suggestion.text, query)}</span>
                  <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                </button>
              ))}
            </>
          )}

          {/* Нет результатов */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Ничего не найдено по запросу "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
