"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Loader2,
  AlertTriangle,
  FileText,
  Rocket,
  Archive,
  Wand2,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LogoUpload } from "@/components/admin/logo-upload"
import { generateOfferMetadata } from "@/lib/seo/templates"
import { toast } from "sonner"

const featureLabels: Record<string, string> = {
  first_loan_zero: "Первый займ под 0%",
  no_overpayments: "Без переплат",
  prolongation: "Пролонгация",
  early_repayment: "Досрочное погашение",
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

interface OfferData {
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
  status: "draft" | "published" | "archived"
  isFeatured: boolean
  isNew: boolean
  isPopular: boolean
  affiliateUrl: string
  customDescription?: string
  metaTitle?: string
  metaDescription?: string
  showOnHomepage: boolean
  sortOrder: number
  syncStatus: string
  syncSource?: string
  lastSync: string
  requiresReview: boolean
  reviewReason?: string
  views: number
  clicks: number
  conversions: number
  apiData?: {
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
}

const offerFormSchema = z.object({
  name: z.string().min(2, "Название должно быть от 2 символов"),
  slug: z.string().min(2, "Slug должен быть от 2 символов").regex(/^[a-z0-9-]+$/, "Только строчные буквы, цифры и дефисы"),
  logo: z.string().optional().or(z.literal("")),
  rating: z.number().min(0).max(5),
  customDescription: z.string().optional().or(z.literal("")),
  metaTitle: z.string().max(60).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  affiliateUrl: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isPopular: z.boolean(),
  showOnHomepage: z.boolean(),
  sortOrder: z.number().min(0).max(100),
  status: z.enum(["draft", "published", "archived"]),
  // Редактируемые поля из API
  psk: z.number().min(0).max(1000).optional(),
  minAmount: z.number().min(100).optional(),
  maxAmount: z.number().min(100).optional(),
  minTerm: z.number().min(1).optional(),
  maxTerm: z.number().min(1).optional(),
  baseRate: z.number().min(0).optional(),
  firstLoanRate: z.number().min(0).optional(),
  decisionTime: z.number().min(0).optional(),
  approvalRate: z.number().min(0).max(100).optional(),
})

type OfferFormValues = z.infer<typeof offerFormSchema>

export default function OfferEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = React.useState<string>("")
  const [offer, setOffer] = React.useState<OfferData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isFormReady, setIsFormReady] = React.useState(false)
  
  React.useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])
  
  // Сброс флага ready при смене ID оффера
  React.useEffect(() => {
    if (id) {
      setIsFormReady(false)
    }
  }, [id])

  React.useEffect(() => {
    if (!id) return
    
    const fetchOffer = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/offers?id=${id}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setOffer(data[0])
        } else if (data.id) {
          setOffer(data)
        }
      } catch (error) {
        toast.error("Ошибка загрузки оффера")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffer()
  }, [id])

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      rating: 4.5,
      customDescription: "",
      metaTitle: "",
      metaDescription: "",
      affiliateUrl: "",
      isFeatured: false,
      isNew: false,
      isPopular: false,
      showOnHomepage: true,
      sortOrder: 10,
      status: "draft",
      psk: undefined,
      minAmount: 1000,
      maxAmount: 30000,
      minTerm: 7,
      maxTerm: 30,
      baseRate: 0.8,
      firstLoanRate: undefined,
      decisionTime: 5,
      approvalRate: 90,
    },
  })

  // Сброс формы только при первом получении данных оффера
  React.useEffect(() => {
    if (offer && !isFormReady) {
      form.reset({
        name: offer.name,
        slug: offer.slug,
        logo: offer.logo || "",
        rating: offer.rating,
        customDescription: offer.customDescription || "",
        metaTitle: offer.metaTitle || "",
        metaDescription: offer.metaDescription || "",
        affiliateUrl: offer.affiliateUrl || "",
        isFeatured: offer.isFeatured,
        isNew: offer.isNew,
        isPopular: offer.isPopular,
        showOnHomepage: offer.showOnHomepage,
        sortOrder: offer.sortOrder,
        status: offer.status,
        psk: offer.psk ?? undefined,
        minAmount: offer.minAmount,
        maxAmount: offer.maxAmount,
        minTerm: offer.minTerm,
        maxTerm: offer.maxTerm,
        baseRate: offer.baseRate,
        firstLoanRate: offer.firstLoanRate ?? undefined,
        decisionTime: offer.decisionTime,
        approvalRate: offer.approvalRate,
      })
      setIsFormReady(true)
    }
  }, [offer, form, isFormReady])

  const onSubmit = async (data: OfferFormValues) => {
    if (!id) return
    
    // Normalize data - editorNote -> customDescription
    const normalizedData = {
      ...data,
      logo: data.logo || "",
      customDescription: data.customDescription || (data as any).editorNote || "",
      editorNote: undefined,
    }
    delete (normalizedData as any).editorNote
    
    console.log("Saving offer - logo:", normalizedData.logo)
    console.log("Saving offer - full data:", normalizedData)
    setIsSaving(true)
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData),
      })

      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error("API error:", error)
        throw new Error(error.error || error.details || "Failed to save")
      }

      const result = await response.json()
      console.log("Saved successfully:", result)
      
      toast.success("Сохранено", {
        description: `Оффер "${data.name}" обновлён`,
      })
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Ошибка сохранения", {
        description: error instanceof Error ? error.message : "Не удалось сохранить",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!offer && id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Оффер не найден</p>
        <Button asChild>
          <Link href="/admin/offers">Вернуться к списку</Link>
        </Button>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    draft: { label: "Черновик", icon: FileText, color: "text-yellow-600" },
    published: { label: "Опубликован", icon: Rocket, color: "text-green-600" },
    archived: { label: "Архив", icon: Archive, color: "text-gray-500" },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/offers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {offer?.logo && (
              <img src={offer.logo} alt={offer.name} className="w-10 h-10 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{offer?.name}</h1>
              <p className="text-muted-foreground">
                ID: {id} • Источник: {offer?.syncSource || "Manual"}
              </p>
            </div>
          </div>
        </div>
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
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                  </SelectContent>
                </Select>
              )
            }}
          />
          <Button size="sm" type="submit" form="offer-form" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>

      {offer?.requiresReview && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <div className="font-medium text-orange-800">Требуется проверка</div>
              <div className="text-sm text-orange-600">{offer.reviewReason}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form id="offer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general">Основное</TabsTrigger>
                  <TabsTrigger value="terms">Условия</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="affiliate">Партнёрка</TabsTrigger>
                  <TabsTrigger value="display">Отображение</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Логотип и название</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название МФО *</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Slug *</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Рейтинг</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
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
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Описание для сайта</FormLabel>
                            <FormControl><Textarea rows={3} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="terms" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Условия займа</CardTitle>
                      <CardDescription>Редактируемые параметры кредитного предложения</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="psk"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ПСК (% годовых)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="365.0"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                              <FormLabel>Ставка (% в день)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
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
                              <FormLabel>Ставка первый займ (% в день)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0 для бесплатного"
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
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
                          name="decisionTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Время решения (мин)</FormLabel>
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
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>SEO настройки</CardTitle>
                          <CardDescription>Мета-теги для поисковых систем</CardDescription>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            if (!offer) return;
                            
                            const metadata = generateOfferMetadata({
                              name: offer.name,
                              slug: offer.slug,
                              minAmount: offer.minAmount,
                              maxAmount: offer.maxAmount,
                              minTerm: offer.minTerm,
                              maxTerm: offer.maxTerm,
                              baseRate: offer.baseRate,
                              firstLoanRate: offer.firstLoanRate,
                              psk: offer.psk,
                              decisionTime: offer.decisionTime,
                              approvalRate: offer.approvalRate,
                              customDescription: offer.customDescription,
                            });
                            
                            form.setValue('metaTitle', metadata.title);
                            form.setValue('metaDescription', metadata.description);
                            
                            toast.success('SEO-метатеги сгенерированы', {
                              description: 'Проверьте и отредактируйте при необходимости',
                            });
                          }}
                        >
                          <Wand2 className="h-4 w-4" />
                          Сгенерировать
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Meta Title</FormLabel>
                              <span className="text-xs text-muted-foreground">
                                {field.value?.length || 0}/60
                              </span>
                            </div>
                            <FormControl><Input {...field} placeholder="Займ в {BRAND} — до {AMOUNT} руб. под 0%" /></FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Рекомендуется 50-60 символов</span>
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
                            <div className="flex items-center justify-between">
                              <FormLabel>Meta Description</FormLabel>
                              <span className="text-xs text-muted-foreground">
                                {field.value?.length || 0}/160
                              </span>
                            </div>
                            <FormControl><Textarea rows={3} {...field} placeholder="Срочный займ на карту до {AMOUNT} руб. за {MINUTES} минут..." /></FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Рекомендуется 150-160 символов</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="affiliate" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Партнёрские настройки</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="affiliateUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Партнёрская ссылка</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input {...field} />
                                {field.value && (
                                  <Button type="button" variant="outline" size="icon" asChild>
                                    <a href={field.value} target="_blank" rel="noopener">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg bg-muted p-4">
                        <div className="text-sm font-medium mb-3">Статистика</div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Просмотры</div>
                            <div className="font-medium">{offer?.views?.toLocaleString() || 0}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Клики</div>
                            <div className="font-medium">{offer?.clicks?.toLocaleString() || 0}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Конверсии</div>
                            <div className="font-medium">{offer?.conversions || 0}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="display" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Настройки отображения</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <FormField control={form.control} name="isFeatured" render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Рекомендуемый</FormLabel>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="isNew" render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Новый</FormLabel>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="isPopular" render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Популярный</FormLabel>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="showOnHomepage" render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Показывать на главной</FormLabel>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        {/* API Data */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Данные API</CardTitle>
                <Badge variant="outline" className="text-xs">Read Only</Badge>
              </div>
              <CardDescription>{offer?.syncSource || "Manual"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Синхронизация</span>
                <span className="font-medium">
                  {offer?.lastSync ? new Date(offer.lastSync).toLocaleString("ru-RU") : "—"}
                </span>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Сумма</span>
                  <span className="font-medium">{offer?.minAmount?.toLocaleString()} – {offer?.maxAmount?.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Срок</span>
                  <span className="font-medium">{offer?.minTerm}–{offer?.maxTerm} дней</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ставка</span>
                  <span className="font-medium">{offer?.baseRate}% / день</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Первый займ</span>
                  <span className="font-medium">{offer?.firstLoanRate === 0 ? "Под 0%" : `${offer?.firstLoanRate}%`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Решение</span>
                  <span className="font-medium">{offer?.apiData?.decisionTime === 0 ? "Мгновенно" : `${offer?.apiData?.decisionTime || 5} мин`}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {offer?.apiData?.features && (
            <Card>
              <CardHeader><CardTitle className="text-base">Особенности</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {offer.apiData.features.map(feature => (
                    <Badge key={feature} variant="secondary">{featureLabels[feature] || feature}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {offer?.apiData?.payoutMethods && (
            <Card>
              <CardHeader><CardTitle className="text-base">Способы получения</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {offer.apiData.payoutMethods.map(method => (
                    <Badge key={method} variant="outline">{payoutMethodLabels[method] || method}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
