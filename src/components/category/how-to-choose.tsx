'use client';

import * as React from 'react';
import { CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { HowToChooseStep } from '@/lib/category/category-config';

interface HowToChooseProps {
  steps: HowToChooseStep[];
  title?: string;
}

export function HowToChoose({ steps, title = 'Как выбрать займ' }: HowToChooseProps) {
  return (
    <section className="py-10 bg-muted border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.step} className="relative bg-background border-border overflow-hidden group hover:shadow-md transition-shadow">
              {/* Номер шага */}
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {step.step}
              </div>
              
              <CardContent className="pt-10 pb-4 px-4">
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                
                {step.tip && (
                  <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-primary font-medium">{step.tip}</span>
                  </div>
                )}
              </CardContent>

              {/* Стрелка к следующему шагу (кроме последнего) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-primary/30" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
