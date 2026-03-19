'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    icon?: string;
  }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'experience',
    question: 'Брали ли вы раньше микрозаймы?',
    options: [
      { value: 'newbie', label: 'Нет, это первый раз', icon: '🌱' },
      { value: 'experienced', label: 'Да, уже брал(а)', icon: '✅' },
    ],
  },
  {
    id: 'urgency',
    question: 'Как быстро нужны деньги?',
    options: [
      { value: 'urgent', label: 'Очень срочно', icon: '⚡' },
      { value: 'normal', label: 'Могу подождать', icon: '⏰' },
    ],
  },
  {
    id: 'priority',
    question: 'Что для вас важнее?',
    options: [
      { value: 'speed', label: 'Скорость одобрения', icon: '🚀' },
      { value: 'rate', label: 'Низкая ставка', icon: '💰' },
    ],
  },
];

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: Record<string, string>) => void;
}

export function Quiz({ isOpen, onClose, onComplete }: QuizProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  
  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const isFirstStep = currentStep === 0;
  
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    if (isLastStep) {
      // Завершаем квиз
      const finalAnswers = { ...answers, [currentQuestion.id]: value };
      onComplete(finalAnswers);
      onClose();
    } else {
      // Переходим к следующему вопросу
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    }
  };
  
  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 pb-4 border-b">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
                
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                {/* Title */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Персонализация
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Вопрос {currentStep + 1} из {QUESTIONS.length}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Question */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-foreground mb-6">
                      {currentQuestion.question}
                    </h3>
                    
                    {/* Options */}
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option.value)}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 rounded-xl border-2',
                            'transition-all duration-200 text-left',
                            answers[currentQuestion.id] === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          )}
                        >
                          {option.icon && (
                            <span className="text-2xl">{option.icon}</span>
                          )}
                          <span className="font-medium text-foreground">
                            {option.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Footer */}
              <div className="p-6 pt-0 flex items-center justify-between border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Пропустить
                </Button>
                
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Назад
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
