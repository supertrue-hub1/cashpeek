"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  Search, 
  ArrowLeft, 
  CreditCard,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/layout/theme-provider"

// Анимированные плавающие элементы
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
      
      {/* Декоративные линии */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

// Анимированный счётчик
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const duration = 1500
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(easeOut * value))
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  return <span>{displayValue}</span>
}

// Глитч-эффект для текста
function GlitchText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute inset-0 text-primary/50 animate-pulse"
        style={{ 
          clipPath: 'inset(0 0 50% 0)',
          transform: 'translate(-2px, 0)',
        }}
        aria-hidden="true"
      >
        {children}
      </span>
      <span 
        className="absolute inset-0 text-destructive/50"
        style={{ 
          clipPath: 'inset(50% 0 0 0)',
          transform: 'translate(2px, 0)',
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
}

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background text-foreground p-4">
        <FloatingElements />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-2xl"
        >
          {/* Логотип */}
          <motion.div 
            variants={itemVariants}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">
                cash<span className="text-primary">peek</span>
              </span>
            </Link>
          </motion.div>

          {/* 404 с анимацией */}
          <motion.div 
            variants={itemVariants}
            className="relative mb-6"
          >
            <h1 className="text-[8rem] md:text-[12rem] font-bold leading-none tracking-tighter select-none">
              <GlitchText>
                <AnimatedNumber value={404} />
              </GlitchText>
            </h1>
            
            {/* Декоративная подсветка */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Заголовок */}
          <motion.h2 
            variants={itemVariants}
            className="text-2xl md:text-3xl font-semibold mb-4"
          >
            Страница не найдена
          </motion.h2>

          {/* Описание */}
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
          >
            Похоже, эта страница отправилась в отпуск. 
            Давайте вернёмся к поиску лучших займов!
          </motion.p>

          {/* Кнопки действий */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="min-w-[180px] group">
              <Link href="/">
                <Home className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                На главную
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="min-w-[180px] group">
              <Link href="/sravnit">
                <Search className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Сравнить займы
              </Link>
            </Button>
          </motion.div>

          {/* Дополнительные ссылки */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <Link 
              href="/blog" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Блог
            </Link>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <Link 
              href="/cabinet" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Личный кабинет
            </Link>
          </motion.div>

          {/* Кнопка "Назад" */}
          <motion.div 
            variants={itemVariants}
            className="mt-8"
          >
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться назад
            </Button>
          </motion.div>
        </motion.div>

        {/* Декоративный градиент снизу */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      </div>
    </ThemeProvider>
  )
}
