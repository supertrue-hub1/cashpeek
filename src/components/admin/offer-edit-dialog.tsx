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

// Схема валидации
const offerFormSchema = z.object({
  name: z.string().min(2, "Название должно быть от 2 символов"),
  slug: z.string().min(2, "Slug должен быть от 2 символов").regex(/^[a-z0-9-]+$/, "Только строчные буквы, цифры и дефисы"),
  rating: z.number().min(0).max(5),
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

interface ApiData {
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  baseRate: number
  firstLoanRate: number
  decisionTime: number
  approvalRate: number
  payoutMethods: string[]
  features: string[]
  badCreditOk: boolean
  noCalls: boolean
  roundTheClock: boolean
  minAge: number
  documents: string[]
}

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
  status: "draft" | "published" | "archived"
  isFeatured: boolean
  isNew: boolean
  isPopular: boolean
  affiliateUrl: string
  editorNote?: string
  customDescription?: string
  syncStatus: "synced" | "pending" | "error"
  syncSource: string
  lastSync: string
  requiresReview: boolean
  reviewReason?: string
  views: number
  clicks: number
  conversions: number
  tags?: string[]
  apiData?: ApiData
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
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: offer?.name || "",
      slug: offer?.slug || "",
      rating: offer?.rating || 4.5,
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

  // Обновляем форму при смене оффера
  React.useEffect(() => {
    if (offer) {
      form.reset({
        name: offer.name,
        slug: offer.slug,
        rating: offer.rating,
        editorNote: offer.editorNote || "",
        isFeatured: offer.isFeatured,
        isNew: offer.isNew,
        isPopular: offer.isPopular,
        status: offer.status,
        metaTitle: offer.metaTitle || "",
        metaDescription: offer.metaDescription || "",
        customDescription: offer.customDescription || "",
        affiliateUrl: offer.affiliateUrl,
        showOnHomepage: offer.showOnHomepage ?? true,
        sortOrder: offer.sortOrder || 10,
      })
      setGeneratedDescription(null)
      setActiveTab("general")
    }
  }, [offer, form])

  const onSubmit = async (data: OfferFormValues) => {
    console.log("Form onSubmit called with data:", data)
    setIsSaving(true)
    try {
      if (onSave) {
        console.log("Calling onSave callback")
        await onSave(data)
      } else {
        // Fallback: save directly via API
        if (offer) {
          console.log("Saving via API, offer ID:", offer.id)
          const response = await fetch(`/api/offers/${offer.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("API error:", errorData)
            throw new Error(errorData.error || 'Failed to save')
          }
          
          console.log("API save successful")
        }
        toast.success("Изменения сохранены", {
          description: `Оффер "${data.name}" успешно обновлён`,
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
    if (!offer) return
    
    const templateData: SeoTemplateData = {
      name: offer.name,
      minAmount: offer.minAmount,
      maxAmount: offer.maxAmount,
      minTerm: offer.minTerm,
      maxTerm: offer.maxTerm,
      baseRate: offer.baseRate,
      firstLoanRate: offer.firstLoanRate,
      decisionTime: offer.apiData?.decisionTime || offer.minTerm,
      approvalRate: offer.apiData?.approvalRate || 90,
      features: offer.apiData?.features,
      badCreditOk: offer.apiData?.badCreditOk,
      roundTheClock: offer.apiData?.roundTheClock,
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

  if (!offer) return null

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
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                offer.requiresReview 
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-2 ring-orange-400" 
                  : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
              }`}>
                {offer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl">{offer.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    ID: {offer.id}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {offer.syncSource}
                  </Badge>
                  {offer.requiresReview && (
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
          
          {offer.requiresReview && offer.reviewReason && (
            <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">Требуется проверка:</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                {offer.reviewReason}
              </p>
            </div>
          )}
          
          <DialogDescription className="mt-2">
            Редактирование оффера и SEO-параметров
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
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("description")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Описание
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("shortDescription")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Краткое
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateDescription("metaTitle")}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Meta Title
                        </Button>
                        <Button 
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
                          <div className="font-medium">{offer.views.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Клики</div>
                          <div className="font-medium">{offer.clicks.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Конверсии</div>
                          <div className="font-medium">{offer.conversions}</div>
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
                            Данные из {offer.syncSource}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(offer.lastSync).toLocaleString("ru-RU", {
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
                              {offer.minAmount.toLocaleString()} – {offer.maxAmount.toLocaleString()} ₽
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Срок</span>
                            <span className="font-medium">
                              {offer.minTerm}–{offer.maxTerm} дней
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ставка</span>
                            <span className="font-medium">{offer.baseRate}% / день</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Первый займ</span>
                            <span className="font-medium">
                              {offer.firstLoanRate === 0 ? "Под 0%" : `${offer.firstLoanRate}%`}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Решение</span>
                            <span className="font-medium">
                              {offer.apiData?.decisionTime === 0 ? "Мгновенно" : `${offer.apiData?.decisionTime || 5} мин`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Одобрение</span>
                            <span className="font-medium">{offer.apiData?.approvalRate || 90}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Мин. возраст</span>
                            <span className="font-medium">{offer.apiData?.minAge || 18} лет</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sync Status</span>
                            <Badge variant={offer.syncStatus === "synced" ? "default" : "secondary"} className="text-xs">
                              {offer.syncStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {offer.apiData?.features && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-2">Особенности</div>
                          <div className="flex flex-wrap gap-2">
                            {offer.apiData.features.map(feature => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {featureLabels[feature] || feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {offer.apiData?.payoutMethods && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-2">Способы получения</div>
                          <div className="flex flex-wrap gap-2">
                            {offer.apiData.payoutMethods.map(method => (
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
