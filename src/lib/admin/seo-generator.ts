export interface SeoTemplateData {
  name: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  baseRate: number
  firstLoanRate?: number | null
  decisionTime: number
  approvalRate: number
  features?: string[]
  badCreditOk?: boolean
  roundTheClock?: boolean
}

const featureLabels: Record<string, string> = {
  first_loan_zero: "первый займ под 0%",
  no_overpayments: "без переплат",
  prolongation: "пролонгация",
  early_repayment: "досрочное погашение",
  no_hidden_fees: "без скрытых комиссий",
  online_approval: "онлайн одобрение",
  one_document: "только паспорт",
  loyalty_program: "программа лояльности",
}

/**
 * SEO Description Templates
 */
export const SEO_TEMPLATES = {
  description: {
    name: "Описание оффера",
    template: `{{name}} — надёжный сервис онлайн-займов с высоким процентом одобрения ({{approvalRate}}%). Получите от {{minAmount}} до {{maxAmount}} рублей на срок от {{minTerm}} до {{maxTerm}} дней. {{firstLoanZero}}Быстрое решение за {{decisionTime}}. {{features}}.`,
  },
  shortDescription: {
    name: "Краткое описание",
    template: `Займ в {{name}}: от {{minAmount}} до {{maxAmount}} ₽ на {{minTerm}}–{{maxTerm}} дней. {{firstLoanRate}}. Одобрение {{approvalRate}}%.`,
  },
  metaTitle: {
    name: "Meta Title",
    template: `Займ в {{name}} под {{rate}}% — Онлайн на карту | cashpeek`,
  },
  metaDescription: {
    name: "Meta Description",
    template: `Получите займ в {{name}}: от {{minAmount}} до {{maxAmount}} ₽. {{firstLoanZero}}Одобрение {{approvalRate}}%. Оформление онлайн за 5 минут.`,
  },
  benefits: {
    name: "Преимущества",
    template: `✅ Сумма: {{minAmount}}–{{maxAmount}} ₽\n✅ Срок: {{minTerm}}–{{maxTerm}} дней\n✅ Решение: {{decisionTime}}\n✅ Одобрение: {{approvalRate}}%\n{{featuresList}}`,
  },
}

/**
 * Format number with proper Russian localization
 */
function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} млн`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)} тыс`
  }
  return amount.toString()
}

/**
 * Format features list
 */
function formatFeatures(features?: string[]): string {
  if (!features || features.length === 0) return ""
  
  const translatedFeatures = features
    .map(f => featureLabels[f])
    .filter(Boolean)
    .slice(0, 3)
  
  if (translatedFeatures.length === 0) return ""
  
  return `Преимущества: ${translatedFeatures.join(", ")}`
}

/**
 * Format features as bullet list
 */
function formatFeaturesList(features?: string[]): string {
  if (!features || features.length === 0) return ""
  
  const translatedFeatures = features
    .map(f => featureLabels[f])
    .filter(Boolean)
  
  if (translatedFeatures.length === 0) return ""
  
  return translatedFeatures.map(f => `✅ ${f}`).join("\n")
}

/**
 * Generate SEO text from template
 */
export function generateFromTemplate(
  templateKey: keyof typeof SEO_TEMPLATES,
  data: SeoTemplateData
): string {
  const template = SEO_TEMPLATES[templateKey].template

  const replacements: Record<string, string> = {
    "{{name}}": data.name,
    "{{minAmount}}": formatAmount(data.minAmount),
    "{{maxAmount}}": formatAmount(data.maxAmount),
    "{{minTerm}}": data.minTerm.toString(),
    "{{maxTerm}}": data.maxTerm.toString(),
    "{{rate}}": data.baseRate.toString(),
    "{{approvalRate}}": data.approvalRate.toString(),
    "{{decisionTime}}": data.decisionTime === 0 
      ? "мгновенно" 
      : `${data.decisionTime} мин`,
    "{{firstLoanRate}}": data.firstLoanRate === 0 
      ? "Первый займ под 0%" 
      : `Ставка от ${data.baseRate}% в день`,
    "{{firstLoanZero}}": data.firstLoanRate === 0 
      ? "Первый займ под 0% для новых клиентов. " 
      : "",
    "{{features}}": formatFeatures(data.features),
    "{{featuresList}}": formatFeaturesList(data.features),
    "{{roundTheClock}}": data.roundTheClock 
      ? "Работает круглосуточно. " 
      : "",
    "{{badCreditOk}}": data.badCreditOk 
      ? "Одобряют с плохой кредитной историей. " 
      : "",
  }

  let result = template
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder, "g"), value)
  }

  // Clean up multiple spaces
  result = result.replace(/\s+/g, " ").trim()

  return result
}

/**
 * Generate all SEO fields for an offer
 */
export function generateAllSeoFields(data: SeoTemplateData) {
  return {
    description: generateFromTemplate("description", data),
    shortDescription: generateFromTemplate("shortDescription", data),
    metaTitle: generateFromTemplate("metaTitle", data),
    metaDescription: generateFromTemplate("metaDescription", data),
    benefits: generateFromTemplate("benefits", data),
  }
}

/**
 * Get available template names
 */
export function getAvailableTemplates() {
  return Object.entries(SEO_TEMPLATES).map(([key, value]) => ({
    key,
    name: value.name,
  }))
}
