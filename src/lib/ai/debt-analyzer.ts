/**
 * AI Debt Analysis Utilities
 * Использует z-ai-web-dev-sdk для AI-анализа
 */

import ZAI from 'z-ai-web-dev-sdk';

// Типы для анализа долгов
export interface DebtInput {
  id: string;
  name: string;
  creditor?: string;
  amount: number;
  interestRate: number;
  monthlyPayment?: number;
  remainingAmount?: number;
  type: 'mfo' | 'bank' | 'credit_card' | 'personal';
  status: 'active' | 'overdue' | 'paid';
  dueDate?: Date;
}

export interface DebtAnalysisResult {
  plan: string;
  method: 'snowball' | 'avalanche';
  recommendations: string[];
  consolidationOpportunity: boolean;
  monthlySavings: number;
  totalInterestSaved: number;
  payoffOrder: Array<{
    debtId: string;
    debtName: string;
    priority: number;
    reason: string;
  }>;
}

export interface DefaultPrediction {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  prediction: string;
  recommendations: string[];
}

export interface RefinanceOption {
  offerId: string;
  name: string;
  currentRate: number;
  newRate: number;
  monthlySaving: number;
  totalSaving: number;
  approvalChance: number; // 0-100
  requirements: string[];
}

export interface CreditHealthScore {
  score: number; // 300-850
  level: 'poor' | 'fair' | 'good' | 'excellent';
  metrics: {
    paymentDiscipline: number;
    debtLoad: number;
    creditHistory: number;
    creditMix: number;
    creditUtilization: number;
    newCredit: number;
    accountAge: number;
    totalDebt: number;
    incomeToDebt: number;
    savingsRate: number;
  };
  recommendations: string[];
}

// Инициализация AI клиента
async function getAIClient() {
  try {
    const zai = await ZAI.create();
    return zai;
  } catch (error) {
    console.error('[AI] Failed to initialize ZAI client:', error);
    return null;
  }
}

// Парсинг JSON из ответа AI
function parseAIResponse<T>(response: string, fallback: T): T {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
  } catch (error) {
    console.error('[AI] Failed to parse JSON response:', error);
  }
  return fallback;
}

/**
 * 1. Анализ долгов и создание плана погашения
 */
export async function analyzeDebts(
  debts: DebtInput[],
  monthlyIncome: number
): Promise<DebtAnalysisResult> {
  const zai = await getAIClient();
  
  const fallback: DebtAnalysisResult = {
    plan: 'Рекомендуется погашать долги методом снежного кома: начните с наименьшего долга.',
    method: 'snowball',
    recommendations: ['Составьте бюджет', 'Приоритизируйте долги по размеру'],
    consolidationOpportunity: debts.length > 2,
    monthlySavings: 0,
    totalInterestSaved: 0,
    payoffOrder: debts.map((d, i) => ({
      debtId: d.id,
      debtName: d.name,
      priority: i + 1,
      reason: 'Стандартный приоритет',
    })),
  };

  if (!zai) {
    return calculateDebtAnalysisLocally(debts, monthlyIncome);
  }

  try {
    const debtsJson = JSON.stringify(debts.map(d => ({
      name: d.name,
      amount: d.amount,
      rate: d.interestRate,
      type: d.type,
      status: d.status,
      monthly: d.monthlyPayment,
    })));

    const systemPrompt = `Ты — финансовый AI-эксперт по управлению долгами.
Анализируй данные и давай конкретные рекомендации на русском языке.
Отвечай ТОЛЬКО в формате JSON без markdown:
{
  "plan": "детальный план погашения на русском",
  "method": "snowball или avalanche",
  "recommendations": ["рекомендация 1", "рекомендация 2"],
  "consolidationOpportunity": true или false,
  "monthlySavings": число,
  "totalInterestSaved": число,
  "payoffOrder": [{"debtId": "id", "debtName": "название", "priority": 1, "reason": "причина"}]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: `Анализируй долги: ${debtsJson}. Ежемесячный доход: ${monthlyIncome} руб.` }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    return parseAIResponse(responseText, fallback);
  } catch (error) {
    console.error('[AI] analyzeDebts error:', error);
    return calculateDebtAnalysisLocally(debts, monthlyIncome);
  }
}

/**
 * Локальный расчёт анализа долгов (fallback)
 */
function calculateDebtAnalysisLocally(
  debts: DebtInput[],
  monthlyIncome: number
): DebtAnalysisResult {
  const activeDebts = debts.filter(d => d.status !== 'paid');
  
  // Метод снежного кома - сортируем по размеру
  const sortedDebts = [...activeDebts].sort((a, b) => a.amount - b.amount);
  
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.amount, 0);
  const avgRate = activeDebts.reduce((sum, d) => sum + d.interestRate, 0) / activeDebts.length || 0;
  const monthlyPayments = activeDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
  
  // Проверка возможности консолидации
  const consolidationOpportunity = activeDebts.length >= 2 && avgRate > 20;
  
  // Расчёт экономии при консолидации
  const avgNewRate = 15; // Средняя ставка при консолидации
  const monthlySavings = consolidationOpportunity 
    ? Math.round(monthlyPayments * (avgRate - avgNewRate) / 100)
    : 0;

  return {
    plan: `Рекомендуется метод снежного кома: начните с погашения "${sortedDebts[0]?.name}" (${sortedDebts[0]?.amount} руб.). После погашения первого долга направьте освободившиеся средства на следующий.`,
    method: 'snowball',
    recommendations: [
      'Выделите фиксированную сумму на погашение долгов каждый месяц',
      'Начните с наименьшего долга для быстрой победы',
      'Рассмотрите возможность консолидации',
      'Избегайте новых кредитов до погашения текущих',
    ],
    consolidationOpportunity,
    monthlySavings,
    totalInterestSaved: monthlySavings * 12,
    payoffOrder: sortedDebts.map((d, i) => ({
      debtId: d.id,
      debtName: d.name,
      priority: i + 1,
      reason: i === 0 ? 'Наименьшая сумма для быстрого погашения' : 'Следующий по размеру',
    })),
  };
}

/**
 * 2. Предиктор дефолта
 */
export async function predictDefault(
  debts: DebtInput[],
  monthlyIncome: number,
  paymentHistory: Array<{ onTime: boolean; date: Date }> = []
): Promise<DefaultPrediction> {
  const zai = await getAIClient();
  
  // Локальный расчёт как fallback
  const fallback = calculateDefaultRiskLocally(debts, monthlyIncome, paymentHistory);
  
  if (!zai) {
    return fallback;
  }

  try {
    const data = {
      debts: debts.map(d => ({ amount: d.amount, rate: d.interestRate, type: d.type, status: d.status })),
      income: monthlyIncome,
      onTimePayments: paymentHistory.filter(p => p.onTime).length,
      latePayments: paymentHistory.filter(p => !p.onTime).length,
    };

    const systemPrompt = `Ты — AI-эксперт по кредитному риску.
Оцени риск дефолта заёмщика. Отвечай ТОЛЬКО JSON:
{
  "riskScore": число от 0 до 100,
  "riskLevel": "low" или "medium" или "high" или "critical",
  "factors": [{"name": "название", "impact": "positive/negative/neutral", "description": "описание"}],
  "prediction": "прогноз на русском",
  "recommendations": ["рекомендация 1"]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: `Данные заёмщика: ${JSON.stringify(data)}` }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    return parseAIResponse(responseText, fallback);
  } catch (error) {
    console.error('[AI] predictDefault error:', error);
    return fallback;
  }
}

function calculateDefaultRiskLocally(
  debts: DebtInput[],
  monthlyIncome: number,
  paymentHistory: Array<{ onTime: boolean; date: Date }>
): DefaultPrediction {
  const activeDebts = debts.filter(d => d.status === 'active' || d.status === 'overdue');
  const overdueDebts = debts.filter(d => d.status === 'overdue');
  const mfoDebts = debts.filter(d => d.type === 'mfo');
  
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.amount, 0);
  const monthlyPayments = activeDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
  const debtToIncome = monthlyIncome > 0 ? (monthlyPayments / monthlyIncome) * 100 : 100;
  
  // Расчёт риска
  let riskScore = 20; // Базовый риск
  
  // Факторы увеличения риска
  if (overdueDebts.length > 0) riskScore += overdueDebts.length * 15;
  if (mfoDebts.length > 1) riskScore += mfoDebts.length * 10;
  if (debtToIncome > 50) riskScore += 20;
  if (debtToIncome > 70) riskScore += 15;
  
  // История платежей
  const latePayments = paymentHistory.filter(p => !p.onTime).length;
  if (latePayments > 0) riskScore += Math.min(latePayments * 5, 25);
  
  riskScore = Math.min(100, Math.max(0, riskScore));
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore < 30) riskLevel = 'low';
  else if (riskScore < 50) riskLevel = 'medium';
  else if (riskScore < 75) riskLevel = 'high';
  else riskLevel = 'critical';

  const factors = [
    { name: 'Долговая нагрузка', impact: debtToIncome > 50 ? 'negative' : 'positive', description: `${debtToIncome.toFixed(0)}% от дохода` },
    { name: 'МФО-займы', impact: mfoDebts.length > 0 ? 'negative' : 'positive', description: `${mfoDebts.length} активных` },
    { name: 'Просрочки', impact: overdueDebts.length > 0 ? 'negative' : 'positive', description: `${overdueDebts.length} просроченных` },
  ];

  return {
    riskScore,
    riskLevel,
    factors,
    prediction: riskLevel === 'low' 
      ? 'Риск дефолта минимальный. Продолжайте соблюдать платёжную дисциплину.'
      : riskLevel === 'medium'
      ? 'Умеренный риск. Рекомендуется оптимизировать расходы и увеличить платежи.'
      : riskLevel === 'high'
      ? 'Высокий риск дефолта. Необходимо принять срочные меры по реструктуризации долгов.'
      : 'Критический риск! Требуется немедленная консультация с финансовым специалистом.',
    recommendations: [
      'Составьте детальный бюджет',
      'Рассмотрите реструктуризацию долгов',
      'Избегайте новых кредитов',
      'Обратитесь за консультацией к кредитному брокеру',
    ],
  };
}

/**
 * 3. Поиск предложений рефинансирования
 */
export async function findRefinanceOptions(
  debts: DebtInput[],
  creditScore: number = 650
): Promise<RefinanceOption[]> {
  const zai = await getAIClient();
  
  const fallback = calculateRefinanceOptionsLocally(debts, creditScore);
  
  if (!zai) {
    return fallback;
  }

  try {
    const systemPrompt = `Ты — AI-эксперт по рефинансированию кредитов.
Найди лучшие предложения рефинансирования. Отвечай ТОЛЬКО JSON массивом:
[{
  "offerId": "уникальный id",
  "name": "название банка/продукта",
  "currentRate": текущая ставка,
  "newRate": новая ставка,
  "monthlySaving": экономия в месяц,
  "totalSaving": общая экономия,
  "approvalChance": шанс одобрения 0-100,
  "requirements": ["требование 1"]
}]`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: `Долги: ${JSON.stringify(debts)}. Кредитный рейтинг: ${creditScore}` }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const parsed = parseAIResponse(responseText, fallback);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error('[AI] findRefinanceOptions error:', error);
    return fallback;
  }
}

function calculateRefinanceOptionsLocally(
  debts: DebtInput[],
  creditScore: number
): RefinanceOption[] {
  const activeDebts = debts.filter(d => d.status === 'active');
  if (activeDebts.length === 0) return [];
  
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.amount, 0);
  const avgRate = activeDebts.reduce((sum, d) => sum + d.interestRate, 0) / activeDebts.length;
  
  // Базовые предложения рефинансирования
  const baseOffers = [
    { name: 'Сбербанк Рефинансирование', rate: 13.9 },
    { name: 'Альфа-Банк Объединение', rate: 14.5 },
    { name: 'Тинькофф Рефинансирование', rate: 12.9 },
    { name: 'ВТБ Объединение кредитов', rate: 14.0 },
  ];

  return baseOffers.map((offer, i) => {
    const monthlyPayment = (totalDebt * (avgRate / 100 / 12)) / (1 - Math.pow(1 + avgRate / 100 / 12, -36));
    const newMonthlyPayment = (totalDebt * (offer.rate / 100 / 12)) / (1 - Math.pow(1 + offer.rate / 100 / 12, -36));
    const monthlySaving = Math.max(0, monthlyPayment - newMonthlyPayment);
    
    // Шанс одобрения зависит от кредитного рейтинга
    let approvalChance = Math.min(95, creditScore / 850 * 100 - 10);
    if (creditScore < 600) approvalChance -= 20;
    if (activeDebts.some(d => d.type === 'mfo')) approvalChance -= 15;
    approvalChance = Math.max(10, Math.min(95, approvalChance));

    return {
      offerId: `refinance-${i + 1}`,
      name: offer.name,
      currentRate: avgRate,
      newRate: offer.rate,
      monthlySaving: Math.round(monthlySaving),
      totalSaving: Math.round(monthlySaving * 36),
      approvalChance: Math.round(approvalChance),
      requirements: [
        'Паспорт РФ',
        'Подтверждение дохода',
        'Стаж работы от 3 месяцев',
        creditScore < 650 ? 'Повышенный первоначальный взнос' : '',
      ].filter(Boolean),
    };
  });
}

/**
 * 4. Кредитный брокер - чат
 */
export async function chatWithBroker(
  message: string,
  context: {
    debts: DebtInput[];
    creditScore?: number;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<string> {
  const zai = await getAIClient();
  
  const fallbackResponse = `Я могу помочь вам с вопросами по кредитам и долгам. 
Вот несколько советов:
1. Приоритизируйте погашение долгов с высокой ставкой
2. Рассмотрите возможность консолидации
3. Ведите переговоры с кредиторами о реструктуризации
4. Изучите свои права как заёмщика`;

  if (!zai) {
    return fallbackResponse;
  }

  try {
    const systemPrompt = `Ты — виртуальный кредитный брокер, AI-помощник.
Помогаешь заёмщикам управлять долгами, вести переговоры с кредиторами.
Отвечай на русском языке, кратко и по делу.
Давай конкретные советы и примеры.

Твои возможности:
- Анализ финансовой ситуации
- Рекомендации по погашению долгов
- Помощь в составлении писем в банки/МФО
- Разъяснение прав заёмщика
- Стратегии переговоров с кредиторами`;

    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      { role: 'assistant', content: systemPrompt },
    ];

    // Добавляем историю
    if (context.history) {
      context.history.forEach(h => {
        messages.push({ role: h.role, content: h.content });
      });
    }

    // Добавляем контекст долгов
    if (context.debts.length > 0) {
      messages.push({
        role: 'user',
        content: `Мои долги: ${JSON.stringify(context.debts.map(d => ({ name: d.name, amount: d.amount, rate: d.interestRate })))}`
      });
      messages.push({
        role: 'assistant',
        content: 'Понял, проанализировал ваши долги. Готов помочь!'
      });
    }

    messages.push({ role: 'user', content: message });

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });

    return completion.choices[0]?.message?.content || fallbackResponse;
  } catch (error) {
    console.error('[AI] chatWithBroker error:', error);
    return fallbackResponse;
  }
}

/**
 * 5. Оценка кредитного здоровья
 */
export async function calculateCreditHealth(
  debts: DebtInput[],
  monthlyIncome: number,
  paymentHistory: Array<{ onTime: boolean; date: Date }> = [],
  accountAge: number = 12 // месяцев
): Promise<CreditHealthScore> {
  const zai = await getAIClient();
  
  const fallback = calculateCreditHealthLocally(debts, monthlyIncome, paymentHistory, accountAge);
  
  if (!zai) {
    return fallback;
  }

  try {
    const data = {
      totalDebt: debts.reduce((sum, d) => sum + d.amount, 0),
      activeDebts: debts.filter(d => d.status === 'active').length,
      types: [...new Set(debts.map(d => d.type))],
      onTimePayments: paymentHistory.filter(p => p.onTime).length,
      latePayments: paymentHistory.filter(p => !p.onTime).length,
      income: monthlyIncome,
      accountAge,
    };

    const systemPrompt = `Ты — AI-эксперт по кредитному скорингу.
Оцени кредитное здоровье заёмщика по 10 параметрам. Отвечай ТОЛЬКО JSON:
{
  "score": число 300-850,
  "level": "poor" или "fair" или "good" или "excellent",
  "metrics": {
    "paymentDiscipline": 0-100,
    "debtLoad": 0-100,
    "creditHistory": 0-100,
    "creditMix": 0-100,
    "creditUtilization": 0-100,
    "newCredit": 0-100,
    "accountAge": 0-100,
    "totalDebt": 0-100,
    "incomeToDebt": 0-100,
    "savingsRate": 0-100
  },
  "recommendations": ["рекомендация 1"]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: `Данные: ${JSON.stringify(data)}` }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    return parseAIResponse(responseText, fallback);
  } catch (error) {
    console.error('[AI] calculateCreditHealth error:', error);
    return fallback;
  }
}

function calculateCreditHealthLocally(
  debts: DebtInput[],
  monthlyIncome: number,
  paymentHistory: Array<{ onTime: boolean; date: Date }>,
  accountAge: number
): CreditHealthScore {
  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.amount, 0);
  const monthlyPayments = activeDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
  
  // Платёжная дисциплина
  const onTimePayments = paymentHistory.filter(p => p.onTime).length;
  const totalPayments = paymentHistory.length || 1;
  const paymentDiscipline = (onTimePayments / totalPayments) * 100;
  
  // Долговая нагрузка
  const debtLoad = monthlyIncome > 0 
    ? Math.max(0, 100 - (monthlyPayments / monthlyIncome) * 100)
    : 50;
  
  // Кредитная история
  const creditHistory = Math.min(100, accountAge * 3);
  
  // Кредитный микс
  const uniqueTypes = new Set(debts.map(d => d.type));
  const creditMix = Math.min(100, uniqueTypes.size * 25);
  
  // Использование кредита
  const creditUtilization = 80; // Упрощённо
  
  // Новые кредиты
  const newCredit = activeDebts.length > 3 ? 60 : 80;
  
  // Возраст аккаунтов
  const accountAgeScore = Math.min(100, accountAge * 2);
  
  // Общий долг (инвертированный)
  const totalDebtScore = Math.max(0, 100 - totalDebt / 100000);
  
  // Доход к долгу
  const incomeToDebt = monthlyIncome > 0 
    ? Math.max(0, 100 - (totalDebt / (monthlyIncome * 12)) * 50)
    : 50;
  
  // Норма сбережений (упрощённо)
  const savingsRate = 60;

  // Общий скоринг
  const metrics = {
    paymentDiscipline,
    debtLoad,
    creditHistory,
    creditMix,
    creditUtilization,
    newCredit,
    accountAge: accountAgeScore,
    totalDebt: totalDebtScore,
    incomeToDebt,
    savingsRate,
  };

  const avgMetric = Object.values(metrics).reduce((a, b) => a + b, 0) / 10;
  const score = Math.round(300 + (avgMetric / 100) * 550); // 300-850
  
  let level: 'poor' | 'fair' | 'good' | 'excellent';
  if (score < 550) level = 'poor';
  else if (score < 650) level = 'fair';
  else if (score < 750) level = 'good';
  else level = 'excellent';

  const recommendations: string[] = [];
  if (paymentDiscipline < 80) recommendations.push('Улучшите платёжную дисциплину - платите вовремя');
  if (debtLoad < 50) recommendations.push('Снизьте долговую нагрузку');
  if (creditMix < 50) recommendations.push('Диверсифицируйте кредитный портфель');
  if (accountAge < 24) recommendations.push('Не закрывайте старые кредитные счета');
  if (recommendations.length === 0) recommendations.push('Продолжайте поддерживать хорошую кредитную историю');

  return { score, level, metrics, recommendations };
}

export type {
  DebtInput,
  DebtAnalysisResult,
  DefaultPrediction,
  RefinanceOption,
  CreditHealthScore,
};
