"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
  Save, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle,
  Rocket,
  FileText,
  Archive,
  Eye,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { generateFromTemplate, getAvailableTemplates, type SeoTemplateData } from "@/lib/admin/seo-generator"
import { LogoUpload } from "@/components/admin/logo-upload"

// Схема валидации
const offerFormSchema = z.object({
  name: z.string().min(2, "Название должно быть от 2 символов"),
  slug: z.string().min(2, "Slug должен быть от 2 символов").regex(/^[a-z0-9-]+$/, "Только строчные буквы, цифры и дефисы"),
  logo: z.string().optional().or(z.literal("")),
  rating: z.number().min(0).max(5),
  
  // Условия займа
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  minTerm: z.number().min(0).optional(),
  maxTerm: z.number().min(0).optional(),
  baseRate: z.number().min(0).optional(),
  firstLoanRate: z.number().min(0).optional(),
  psk: z.number().min(0).optional(), // ПСК в % годовых
  decisionTime: z.number().min(0).optional(),
  approvalRate: z.number().min(0).max(100).optional(),
  minAge: z.number().min(18).max(100).optional(),
  
  // Особенности
  badCreditOk: z.boolean().optional(),
  noCalls: z.boolean().optional(),
  roundTheClock: z.boolean().optional(),
  
  editorNote: z.string().optional(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isPopular: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
  metaTitle: z.string().max(60, "Максимум 60 символов").optional().or(z.literal("")),
  metaDescription: z.string().max(160, "Максимум 160 символов").optional().or(z.literal("")),
  customDescription: z.string().optional().or(z.literal("")),
  affiliateUrl: z.string().optional().or(z.literal("")),
  showOnHomepage: z.boolean(),
  sortOrder: z.number().min(0).max(100),
})

type OfferFormValues = z.infer<typeof offerFormSchema>

interface AdminOffer {
  id: string
  name: string
  slug: string
  logo?: string
  rating: number
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  baseRate: number
  firstLoanRate?: number
  psk?: number
  decisionTime: number
  approvalRate: number
  minAge: number
  badCreditOk: boolean
  noCalls: boolean
  roundTheClock: boolean
  status: "draft" | "published" | "archived"
  isFeatured: boolean
  isNew: boolean
  isPopular: boolean
  affiliateUrl: string
  editorNote?: string
  customDescription?: string
  metaTitle?: string
  metaDescription?: string
  showOnHomepage: boolean
  sortOrder: number
  syncStatus: "synced" | "pending" | "error"
  syncSource: string
  lastSync: string
  requiresReview: boolean
  reviewReason?: string
  views: number
  clicks: number
  conversions: number
  tags?: string[]
  features?: string[]
  payoutMethods?: string[]
  documents?: string[]
}

const featureLabels: Record<string, string> = {
  first_loan_zero: "Первый займ под 0%",
  no_overpayments: "Без переплат",
  prolongation: "Пролонгация",
  early_repayment: "Досрочное погашение",
  no_hidden_fees: "Без скрытых комиссий",
  online_approval: "Онлайн одобрение",
  one_document: "Один документ",
  loyalty_program: "Программа лояльности",
}

const payoutMethodLabels: Record<string, string> = {
  card: "На карту",
  cash: "Наличными",
  bank_account: "На счёт",
  yoomoney: "ЮMoney",
  qiwi: "QIWI",
  contact: "Contact",
  golden_crown: "Золотая Корона",
}

interface OfferEditDialogProps {
  offer: AdminOffer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: OfferFormValues) => Promise<void>
}

export function OfferEditDialog({ offer, open, onOpenChange, onSave }: OfferEditDialogProps) {
  const [activeTab, setActiveTab] = React.useState("general")
  const [generatedDescription, setGeneratedDescription] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const isNewOffer = !offer
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: offer?.name || "",
      slug: offer?.slug || "",
      logo: offer?.logo || "",
      rating: offer?.rating || 4.5,
      minAmount: offer?.minAmount || 1000,
      maxAmount: offer?.maxAmount || 30000,
      minTerm: offer?.minTerm || 1,
      maxTerm: offer?.maxTerm || 30,
      baseRate: offer?.baseRate || 0.8,
      firstLoanRate: offer?.firstLoanRate ?? 0,
      psk: offer?.psk ?? (offer?.baseRate ? offer.baseRate * 365 : 292),
      decisionTime: offer?.decisionTime || 5,
      approvalRate: offer?.approvalRate || 90,
      minAge: offer?.minAge || 18,
      badCreditOk: offer?.badCreditOk ?? true,
      noCalls: offer?.noCalls ?? true,
      roundTheClock: offer?.roundTheClock ?? false,
      editorNote: offer?.editorNote || "",
      isFeatured: offer?.isFeatured || false,
      isNew: offer?.isNew || false,
      isPopular: offer?.isPopular || false,
      status: offer?.status || "draft",
      metaTitle: offer?.metaTitle || "",
      metaDescription: offer?.metaDescription || "",
      customDescription: offer?.customDescription || "",
      affiliateUrl: offer?.affiliateUrl || "",
      showOnHomepage: offer?.showOnHomepage ?? true,
      sortOrder: offer?.sortOrder || 10,
    },
  })

  // Обновляем форму при смене оффера или открытии
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: offer?.name || "",
        slug: offer?.slug || "",
        logo: offer?.logo || "",
        rating: offer?.rating || 4.5,
        minAmount: offer?.minAmount || 1000,
        maxAmount: offer?.maxAmount || 30000,
        minTerm: offer?.minTerm || 1,
        maxTerm: offer?.maxTerm || 30,
        baseRate: offer?.baseRate || 0.8,
        firstLoanRate: offer?.firstLoanRate ?? 0,
        psk: offer?.psk ?? (offer?.baseRate ? offer.baseRate * 365 : 292),
        decisionTime: offer?.decisionTime || 5,
        approvalRate: offer?.approvalRate || 90,
        minAge: offer?.minAge || 18,
        badCreditOk: offer?.badCreditOk ?? true,
        noCalls: offer?.noCalls ?? true,
        roundTheClock: offer?.roundTheClock ?? false,
        editorNote: offer?.editorNote || "",
        isFeatured: offer?.isFeatured || false,
        isNew: offer?.isNew || false,
        isPopular: offer?.isPopular || false,
        status: offer?.status || "draft",
        metaTitle: offer?.metaTitle || "",
        metaDescription: offer?.metaDescription || "",
        customDescription: offer?.customDescription || "",
        affiliateUrl: offer?.affiliateUrl || "",
        showOnHomepage: offer?.showOnHomepage ?? true,
        sortOrder: offer?.sortOrder || 10,
      })
      setGeneratedDescription(null)
      setActiveTab("general")
    }
  }, [offer, form, open])

  const onSubmit = async (data: OfferFormValues) => {
    setIsSaving(true)
    try {
      if (onSave) {
        console.log("Calling onSave callback")
        await onSave(data)
      } else {
        // Fallback: save directly via API
        const method = isNewOffer ? 'POST' : 'PUT'
        const url = isNewOffer 
          ? '/api/offers' 
          : `/api/offers/${offer.id}`
        
        console.log(`${method} ${url}`, data)
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API error:", errorData)
          throw new Error(errorData.error || 'Failed to save')
        }
        
        const savedOffer = await response.json()
        console.log("API save successful", savedOffer)
        
        toast.success(isNewOffer ? "Оффер создан" : "Изменения сохранены", {
          description: isNewOffer 
            ? `Оффер "${data.name}" успешно создан` 
            : `Оффер "${data.name}" успешно обновлён`,
        })
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Ошибка сохранения", {
        description: error instanceof Error ? error.message : "Не удалось сохранить изменения",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // SEO Template Generation
  const handleGenerateDescription = (templateKey: string) => {
    const formData = form.getValues()
    const offerName = formData.name || "МФО"
    
    const templateData: SeoTemplateData = {
      name: offerName,
      minAmount: formData.minAmount || 1000,
      maxAmount: formData.maxAmount || 30000,
      minTerm: formData.minTerm || 1,
      maxTerm: formData.maxTerm || 30,
      baseRate: formData.baseRate || 0.8,
      firstLoanRate: formData.firstLoanRate,
      decisionTime: formData.decisionTime || 5,
      approvalRate: formData.approvalRate || 90,
      features: [],
      badCreditOk: formData.badCreditOk,
      roundTheClock: formData.roundTheClock,
    }

    const generated = generateFromTemplate(templateKey as keyof ReturnType<typeof getAvailableTemplates>[number] extends never ? never : "description" | "shortDescription" | "metaTitle" | "metaDescription" | "benefits", templateData)
    
    if (templateKey === "description" || templateKey === "shortDescription") {
      form.setValue("customDescription", generated)
      toast.success("Описание сгенерировано", {
        description: "Шаблон применён к полю описания",
      })
    } else if (templateKey === "metaTitle") {
      form.setValue("metaTitle", generated)
    } else if (templateKey === "metaDescription") {
      form.setValue("metaDescription", generated)
    }
    
    setGeneratedDescription(generated)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Скопировано в буфер обмена")
  }

  // Если оффер не передан - показываем заглушку для нового оффера
  const displayOffer = offer || {
    id: "new",
    name: "Новый оффер",
    slug: "",
    logo: undefined,
    rating: 4.5,
    minAmount: 1000,
    maxAmount: 30000,
    minTerm: 1,
    maxTerm: 30,
    baseRate: 0.8,
    firstLoanRate: undefined,
    psk: undefined,
    decisionTime: 5,
    approvalRate: 90,
    minAge: 18,
    badCreditOk: true,
    noCalls: true,
    roundTheClock: false,
    status: "draft" as const,
    isFeatured: false,
    isNew: false,
    isPopular: false,
    affiliateUrl: "",
    editorNote: undefined,
    customDescription: undefined,
    metaTitle: undefined,
    metaDescription: undefined,
    showOnHomepage: true,
    sortOrder: 10,
    syncStatus: "pending" as const,
    syncSource: "Manual",
    lastSync: new Date().toISOString(),
    requiresReview: false,
    reviewReason: undefined,
    views: 0,
    clicks: 0,
    conversions: 0,
    features: [],
    payoutMethods: [],
    documents: [],
  }

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    draft: { label: "Черновик", icon: FileText, color: "text-yellow-600" },
    published: { label: "Опубликован", icon: Rocket, color: "text-green-600" },
    archived: { label: "Архив", icon: Archive, color: "text-gray-500" },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {displayOffer.logo ? (
                <img src={displayOffer.logo} alt={displayOffer.name} className="w-12 h-12 rounded-lg object-contain" />
              ) : (
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                  displayOffer.requiresReview 
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-2 ring-orange-400" 
                    : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                }`}>
                  {displayOffer.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl">
                  {isNewOffer ? "Создание нового оффера" : displayOffer.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {isNewOffer ? (
                    <Badge variant="outline" className="text-xs">
                      Новый оффер
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs">
                        ID: {displayOffer.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {displayOffer.syncSource}
                      </Badge>
                    </>
                  )}
                  {displayOffer.requiresReview && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Requires Review
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Статус публикации */}
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => {
                  const currentStatus = statusConfig[field.value]
                  const StatusIcon = currentStatus.icon
                  return (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`w-[150px] ${currentStatus.color}`}>
                        <StatusIcon className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-yellow-600" />
                            <span>Черновик</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-green-600" />
                            <span>Опубликован</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="archived">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-gray-500" />
                            <span>Архив</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </div>
          </div>
          
          {displayOffer.requiresReview && displayOffer.reviewReason && (
            <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">Требуется проверка:</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                {displayOffer.reviewReason}
              </p>
            </div>
          )}
          
          <DialogDescription className="mt-2">
            {isNewOffer ? "Заполните данные для создания нового оффера" : "Редактирование оффера и SEO-параметров"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("Form validation errors:", errors)
            toast.error("Ошибка валидации", {
              description: Object.keys(errors).map(key => `${key}: ${errors[key]?.message}`).join(", ")
            })
          })}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Основное</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="affiliate">Партнёрка</TabsTrigger>
                  <TabsTrigger value="api">API данные</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[calc(90vh-280px)]">
                <div className="p-6 pt-2">
                  {/* Основное */}
                  <TabsContent value="general" className="space-y-4 mt-0">
                    <div className="grid gap-4">
                      {/* Логотип */}
                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Логотип</FormLabel>
                            <FormControl>
                              <LogoUpload value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название МФО</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Используется в URL: /mfo/{field.value}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Рейтинг</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sortOrder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Сортировка</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      {/* Условия займа */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Условия займа</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="minAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Мин. сумма (₽)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="maxAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Макс. сумма (₽)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="minTerm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Мин. срок (дней)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="maxTerm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Макс. срок (дней)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="baseRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ставка (%/день)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="firstLoanRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Первый займ (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>0 = бесплатно</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="psk"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ПСК (% годовых)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Полная стоимость кредита. Автоматически: {((form.watch("baseRate") || 0) * 365).toFixed(0)}%
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="decisionTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Решение (мин)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="approvalRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Одобрение (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="minAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Мин. возраст</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Особенности */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Особенности</h4>
                        
                        <FormField
                          control={form.control}
                          name="badCreditOk"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Плохая КИ</FormLabel>
                                <FormDescription className="text-xs">
                                  Одобряют с плохой кредитной историей
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="noCalls"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Без звонков</FormLabel>
                                <FormDescription className="text-xs">
                                  Не звонят клиентам
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="roundTheClock"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Круглосуточно</FormLabel>
                                <FormDescription className="text-xs">
                                  Работает 24/7
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="editorNote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Примечание редактора</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={2}
                                placeholder="Ваши заметки об оффере..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="showOnHomepage"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Выводить на главной</FormLabel>
                                <FormDescription className="text-xs">
                                  Показывать на главной странице
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Рекомендуемый</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isNew"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Новый</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isPopular"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Популярный</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* SEO */}
                  <TabsContent value="seo" className="space-y-4 mt-0">
                    {/* SEO Generator */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">SEO Генератор</span>
                          </div>
                          <Badge variant="outline" className="text-xs">AI</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("description")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Описание
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("shortDescription")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Краткое
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("metaTitle")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Meta Title
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("metaDescription")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Meta Desc
                        </Button>
                      </CardContent>
                    </Card>

                    <FormField
                      control={form.control}
                      name="customDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание для сайта</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4}
                              placeholder="Сгенерируйте или введите описание..."
                              {...field}
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Отображается на странице оффера</span>
                            <span>{field.value?.length || 0} символов</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} />
                              {field.value && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => copyToClipboard(field.value || "")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Рекомендуется 50-60 символов</span>
                            <span className={field.value && field.value.length > 60 ? "text-red-500" : ""}>
                              {field.value?.length || 0}/60
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Рекомендуется 150-160 символов</span>
                            <span className={field.value && field.value.length > 160 ? "text-red-500" : ""}>
                              {field.value?.length || 0}/160
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Партнёрка */}
                  <TabsContent value="affiliate" className="space-y-4 mt-0">
                    <FormField
                      control={form.control}
                      name="affiliateUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Партнёрская ссылка</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} />
                              <Button type="button" variant="outline" size="icon" asChild>
                                <a href={field.value} target="_blank" rel="noopener">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <div className="text-sm font-medium">Статистика</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Просмотры</div>
                          <div className="font-medium">{(displayOffer.views ?? 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Клики</div>
                          <div className="font-medium">{(displayOffer.clicks ?? 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Конверсии</div>
                          <div className="font-medium">{displayOffer.conversions ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* API данные */}
                  <TabsContent value="api" className="space-y-4 mt-0">
                    <div className="rounded-lg bg-muted/50 border p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Read Only</Badge>
                          <span className="text-sm text-muted-foreground">
                            Данные из {displayOffer.syncSource}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(displayOffer.lastSync).toLocaleString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Сумма</span>
                            <span className="font-medium">
                              {displayOffer.minAmount?.toLocaleString()} – {displayOffer.maxAmount?.toLocaleString()} ₽
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Срок</span>
                            <span className="font-medium">
                              {displayOffer.minTerm}–{displayOffer.maxTerm} дней
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ставка</span>
                            <span className="font-medium">{displayOffer.baseRate}% / день</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Первый займ</span>
                            <span className="font-medium">
                              {displayOffer.firstLoanRate === 0 ? "Под 0%" : `${displayOffer.firstLoanRate}%`}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Решение</span>
                            <span className="font-medium">
                              {displayOffer.decisionTime === 0 ? "Мгновенно" : `${displayOffer.decisionTime} мин`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Одобрение</span>
                            <span className="font-medium">{displayOffer.approvalRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Мин. возраст</span>
                            <span className="font-medium">{displayOffer.minAge} лет</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sync Status</span>
                            <Badge variant={displayOffer.syncStatus === "synced" ? "default" : "secondary"} className="text-xs">
                              {displayOffer.syncStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {displayOffer.features && displayOffer.features.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-2">Особенности</div>
                          <div className="flex flex-wrap gap-2">
                            {displayOffer.features.map(feature => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {featureLabels[feature] || feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {displayOffer.payoutMethods && displayOffer.payoutMethods.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-2">Способы получения</div>
                          <div className="flex flex-wrap gap-2">
                            {displayOffer.payoutMethods.map(method => (
                              <Badge key={method} variant="outline" className="text-xs">
                                {payoutMethodLabels[method] || method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="p-6 pt-4 border-t">
              <div className="flex items-center gap-2 mr-auto">
                {form.watch("status") === "draft" && (
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Черновик — не виден на сайте
                  </Badge>
                )}
                {form.watch("status") === "published" && (
                  <Badge variant="default" className="bg-green-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Опубликован — виден на сайте
                  </Badge>
                )}
                {form.watch("status") === "archived" && (
                  <Badge variant="secondary" className="gap-1">
                    <Archive className="h-3 w-3" />
                    Архив — не виден на сайте
                  </Badge>
                )}
              </div>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
