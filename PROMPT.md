Ты — Senior Next.js разработчик. Твоя задача — создать современный, адаптивный компонент поиска для Header (шапки сайта) с расширенным функционалом.

Контекст
Проект использует Next.js 16+ (App Router), TypeScript, Tailwind CSS, shadcn/ui и Lucide React для иконок.

Технические требования
Директива
Компонент должен быть клиентским ('use client'), так как требуется интерактивность.

Дизайн (Modern UI)
Стиль "Expanding Search": по умолчанию видна только иконка лупы. При клике поле плавно расширяется до активного состояния.
Эффекты:
backdrop-blur-md (матовое стекло)
shadow-sm hover:shadow-md (мягкие тени)
Плавные transition-all duration-300 ease-out
Цветовая схема: поддерживай dark mode (классы dark:)
Скругление: rounded-full для контейнера, rounded-lg для dropdown с подсказками
Функционал (Базовый)
Открытие/закрытие поля поиска по клику на иконку
Закрытие при клике вне области компонента (useRef + useEffect)
Кнопка "Очистить" (крестик) — появляется при наличии текста
Кнопка "Закрыть" — появляется когда поле пустое
Поддержка клавиатуры: Escape для закрытия
⭐ Расширенные фичи
1. Debounce поиска
// Используй useCallback + setTimeout для debounceconst debouncedSearch = useCallback(  debounce((query: string) => {    if (onSearchChange && query.length >= 2) {      onSearchChange(query);    }  }, 300), // 300ms задержка  [onSearchChange]);// Вызов при изменении inputconst handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {  const value = e.target.value;  setQuery(value);  debouncedSearch(value);};// Утилита debouncefunction debounce<T extends (...args: unknown[]) => void>(  fn: T,  delay: number): (...args: Parameters<T>) => void {  let timeoutId: NodeJS.Timeout;  return (...args: Parameters<T>) => {    clearTimeout(timeoutId);    timeoutId = setTimeout(() => fn(...args), delay);  };}
2. Подсказки (Suggestions/Autocomplete)interface Suggestion {
  id: string;
  text: string;
  icon?: React.ReactNode;      // Иконка (товар, категория, история)
  category?: string;           // Категория подсказки
  url?: string;                // Ссылка для навигации
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSearchChange?: (query: string) => void;  // Вызывается при каждом изменении (debounced)
  suggestions?: Suggestion[];                 // Внешние подсказки
  recentSearches?: string[];                  // История поиска
  isLoading?: boolean;                        // Состояние загрузки
  className?: string;
}┌─────────────────────────────────────────┐
│ 🔍 [_______ноутбук_______] ✕          ✕ │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🕐 ноутбук asus        (История)       │  ← Недавние поиски
│  🕐 ноутбук gaming      (История)       │
├─────────────────────────────────────────┤
│  🔍 ноутбук asus rog    (Предложение)   │  ← Подсказки
│  🔍 ноутбук apple macbook               │
│  🔍 ноутбук hp pavilion                 │
├─────────────────────────────────────────┤
│  📂 Ноутбуки           → Перейти        │  ← Категория
│  🏷️ Ноутбуки Apple     → 156 товаров    │  ← Товары
└─────────────────────────────────────────┘
const [selectedIndex, setSelectedIndex] = useState(-1);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
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
        if (selectedIndex >= 0) {
          e.preventDefault();
          selectItem(selectedIndex);
        }
        break;
      case 'Escape':
        handleClose();
        break;
    }
  };
  // ...
}, [isOpen, suggestions, recentSearches, selectedIndex]); Навигация по подсказкам клавиатурой{isLoading && (
  <div className="flex items-center gap-2 p-3 text-muted-foreground">
    <Loader2 className="size-4 animate-spin" />
    <span className="text-sm">Поиск...</span>
  </div>
)}// Группировка по категориям
const groupedSuggestions = suggestions.reduce((acc, item) => {
  const category = item.category || 'Результаты';
  if (!acc[category]) acc[category] = [];
  acc[category].push(item);
  return acc;
}, {} as Record<string, Suggestion[]>);

// Рендер
{Object.entries(groupedSuggestions).map(([category, items]) => (
  <div key={category}>
    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
      {category}
    </div>
    {items.map((item) => (
      <SuggestionItem key={item.id} {...item} />
    ))}
  </div>
))}// LocalStorage для истории
const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

const saveToHistory = (query: string) => {
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  const recent = stored ? JSON.parse(stored) : [];
  const updated = [query, ...recent.filter((q: string) => q !== query)]
    .slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  setRecentSearches(updated);
};

const removeFromHistory = (query: string) => {
  const updated = recentSearches.filter(q => q !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  setRecentSearches(updated);
};

const clearHistory = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  setRecentSearches([]);
};const MIN_SEARCH_LENGTH = 2;

const shouldShowSuggestions = query.length >= MIN_SEARCH_LENGTH;Адаптивность
Десктоп (md и выше):
Inline expanding search
Dropdown под полем ввода
Мобильные (ниже md):
Полноэкранный overlay
Подсказки занимают весь экран
Touch-friendly элементы (min-h-11)
Props интерфейс (полный)interface SearchBarProps {
  // Основные
  placeholder?: string;
  
  // Callbacks
  onSearch?: (query: string) => void;           // Enter или клик на поиск
  onSearchChange?: (query: string) => void;     // При изменении (debounced)
  onSelectSuggestion?: (suggestion: Suggestion) => void;
  
  // Данные
  suggestions?: Suggestion[];
  recentSearches?: string[];
  
  // Состояние
  isLoading?: boolean;
  debounceMs?: number;          // Задержка debounce (default: 300)
  minSearchLength?: number;     // Мин. символов (default: 2)
  maxRecentSearches?: number;   // Макс. история (default: 5)
  
  // Фичи
  showRecentSearches?: boolean;        // Показывать историю (default: true)
  persistRecentSearches?: boolean;     // Сохранять в localStorage (default: true)
  highlightMatches?: boolean;          // Подсветка совпадений (default: true)
  
  // Стилизация
  className?: string;
  dropdownClassName?: string;
}src/
├── components/
│   ├── SearchBar.tsx          # Основной компонент
│   ├── SearchBarDropdown.tsx  # Dropdown с подсказками
│   ├── SuggestionItem.tsx     # Элемент подсказки
│   └── Header.tsx             # Header с поиском
├── hooks/
│   └── useSearch.ts           # Хук с debounce, историей и т.д.
└── lib/
    └── search-utils.ts        # Утилиты (debounce, highlight)interface SearchBarProps {
  // Основные
  placeholder?: string;
  
  // Callbacks
  onSearch?: (query: string) => void;           // Enter или клик на поиск
  onSearchChange?: (query: string) => void;     // При изменении (debounced)
  onSelectSuggestion?: (suggestion: Suggestion) => void;
  
  // Данные
  suggestions?: Suggestion[];
  recentSearches?: string[];
  
  // Состояние
  isLoading?: boolean;
  debounceMs?: number;          // Задержка debounce (default: 300)
  minSearchLength?: number;     // Мин. символов (default: 2)
  maxRecentSearches?: number;   // Макс. история (default: 5)
  
  // Фичи
  showRecentSearches?: boolean;        // Показывать историю (default: true)
  persistRecentSearches?: boolean;     // Сохранять в localStorage (default: true)
  highlightMatches?: boolean;          // Подсветка совпадений (default: true)
  
  // Стилизация
  className?: string;
  dropdownClassName?: string;
}src/
├── components/
│   ├── SearchBar.tsx          # Основной компонент
│   ├── SearchBarDropdown.tsx  # Dropdown с подсказками
│   ├── SuggestionItem.tsx     # Элемент подсказки
│   └── Header.tsx             # Header с поиском
├── hooks/
│   └── useSearch.ts           # Хук с debounce, историей и т.д.
└── lib/
    └── search-utils.ts        # Утилиты (debounce, highlight)
    /* Dropdown */
.search-dropdown {
  @apply absolute top-full left-0 right-0 mt-2;
  @apply bg-white/95 dark:bg-neutral-900/95;
  @apply backdrop-blur-lg;
  @apply border border-neutral-200/50 dark:border-neutral-700/50;
  @apply rounded-lg shadow-lg;
  @apply max-h-80 overflow-y-auto;
  @apply animate-in fade-in slide-in-from-top-2 duration-200;
}

/* Элемент подсказки */
.suggestion-item {
  @apply flex items-center gap-3 px-3 py-2;
  @apply cursor-pointer;
  @apply hover:bg-neutral-100 dark:hover:bg-neutral-800;
  @apply transition-colors;
}

/* Выбранный элемент */
.suggestion-item.selected {
  @apply bg-neutral-100 dark:bg-neutral-800;
}

/* Подсветка совпадения */
.highlight-match {
  @apply font-semibold text-primary;
}

/* Категория */
.suggestion-category {
  @apply text-xs text-muted-foreground bg-muted/50;
  @apply px-3 py-1.5 uppercase tracking-wide;
}Демо-страница
Обнови src/app/page.tsx:

Header с поиском
Демо-данные подсказок (массив объектов)
История поиска из localStorage
Индикатор загрузки (имитация API)
Отображение выбранного результата
Пример использования// В родительском компоненте
const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
const [isLoading, setIsLoading] = useState(false);

const handleSearchChange = async (query: string) => {
  setIsLoading(true);
  // Имитация API запроса
  const results = await fetchSuggestions(query);
  setSuggestions(results);
  setIsLoading(false);
};

<SearchBar
  placeholder="Поиск товаров..."
  onSearch={handleSearch}
  onSearchChange={handleSearchChange}
  suggestions={suggestions}
  isLoading={isLoading}
  showRecentSearches={true}
  persistRecentSearches={true}
  highlightMatches={true}
/>Важно
НЕ пиши тесты
НЕ создавай дополнительные роуты
Используй существующие компоненты shadcn/ui (Button, Input, ScrollArea, Separator)Убедись что все анимации плавные