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
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LogoUpload } from "@/components/admin/logo-upload"
import { toast } from "sonner"

// Схема валидации
const offerFormSchema = z.object({
  // Основное
  name: z.string().min(2, "Название должно быть от 2 символов"),
  slug: z.string().min(2, "Slug должен быть от 2 символов").regex(/^[a-z0-9-]+$/, "Только строчные буквы, цифры и дефисы"),
  logo: z.string().optional().or(z.literal("")),
  rating: z.number().min(0).max(5),
  
  // Условия займа
  minAmount: z.number().min(100, "Минимум 100 ₽"),
  maxAmount: z.number().min(1000, "Минимум 1000 ₽"),
  minTerm: z.number().min(1, "Минимум 1 день"),
  maxTerm: z.number().min(1, "Минимум 1 день"),
  baseRate: z.number().min(0, "Минимум 0%"),
  firstLoanRate: z.number().optional(),
  decisionTime: z.number().min(0),
  approvalRate: z.number().min(0).max(100),
  
  // Особенности
  badCreditOk: z.boolean(),
  noCalls: z.boolean(),
  roundTheClock: z.boolean(),
  minAge: z.number().min(18),
  
  // SEO
  metaTitle: z.string().max(60).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  customDescription: z.string().optional().or(z.literal("")),
  
  // Партнёрка
  affiliateUrl: z.string().optional().or(z.literal("")),
  
  // Отображение
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isPopular: z.boolean(),
  showOnHomepage: z.boolean(),
  sortOrder: z.number().min(0).max(100),
  status: z.enum(["draft", "published", "archived"]),
})

type OfferFormValues = z.infer<typeof offerFormSchema>

const featureOptions = [
  { value: "first_loan_zero", label: "Первый займ под 0%" },
  { value: "prolongation", label: "Пролонгация" },
  { value: "early_repayment", label: "Досрочное погашение" },
  { value: "online_approval", label: "Онлайн одобрение" },
  { value: "one_document", label: "Один документ" },
  { value: "loyalty_program", label: "Программа лояльности" },
  { value: "no_hidden_fees", label: "Без скрытых комиссий" },
]

const payoutMethodOptions = [
  { value: "card", label: "На карту" },
  { value: "cash", label: "Наличными" },
  { value: "bank_account", label: "На счёт" },
  { value: "yoomoney", label: "ЮMoney" },
  { value: "qiwi", label: "QIWI" },
  { value: "contact", label: "Contact" },
  { value: "golden_crown", label: "Золотая Корона" },
]

export default function NewOfferPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState(false)
  const [features, setFeatures] = React.useState<string[]>([])
  const [payoutMethods, setPayoutMethods] = React.useState<string[]>(["card"])

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      rating: 4.5,
      minAmount: 1000,
      maxAmount: 30000,
      minTerm: 7,
      maxTerm: 30,
      baseRate: 0.8,
      firstLoanRate: 0,
      decisionTime: 5,
      approvalRate: 90,
      badCreditOk: true,
      noCalls: true,
      roundTheClock: false,
      minAge: 18,
      metaTitle: "",
      metaDescription: "",
      customDescription: "",
      affiliateUrl: "",
      isFeatured: false,
      isNew: false,
      isPopular: false,
      showOnHomepage: true,
      sortOrder: 10,
      status: "draft",
    },
  })

  // Автогенерация slug из названия
  const nameValue = form.watch("name")
  React.useEffect(() => {
    if (nameValue && !form.getValues("slug")) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      form.setValue("slug", slug)
    }
  }, [nameValue, form])

  const onSubmit = async (data: OfferFormValues) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          features,
          payoutMethods,
          documents: ["passport"],
          logo: data.logo || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || "Failed to create offer")
      }

      const offer = await response.json()
      
      toast.success("Оффер создан", {
        description: `Оффер "${data.name}" успешно добавлен`,
      })
      
      router.push("/admin/offers")
    } catch (error) {
      toast.error("Ошибка создания", {
        description: error instanceof Error ? error.message : "Не удалось создать оффер",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFeature = (value: string) => {
    setFeatures(prev => 
      prev.includes(value) 
        ? prev.filter(f => f !== value)
        : [...prev, value]
    )
  }

  const togglePayoutMethod = (value: string) => {
    setPayoutMethods(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value)
        : [...prev, value]
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/offers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Новый оффер</h1>
            <p className="text-muted-foreground">
              Добавление новой МФО в базу
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/offers">Отмена</Link>
          </Button>
          <Button 
            size="sm" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Создать оффер
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Основное</TabsTrigger>
              <TabsTrigger value="terms">Условия</TabsTrigger>
              <TabsTrigger value="features">Особенности</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Основное */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                  <CardDescription>
                    Название и базовые параметры оффера
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Логотип</FormLabel>
                        <FormControl>
                          <LogoUpload
                            value={field.value}
                            onChange={field.onChange}
                          />
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
                          <FormControl>
                            <Input placeholder="Займер" {...field} />
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
                          <FormLabel>URL Slug *</FormLabel>
                          <FormControl>
                            <Input placeholder="zaymer" {...field} />
                          </FormControl>
                          <FormDescription>
                            /mfo/{field.value || "slug"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
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

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Статус</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Черновик</SelectItem>
                              <SelectItem value="published">Опубликован</SelectItem>
                              <SelectItem value="archived">Архив</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="affiliateUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Партнёрская ссылка</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
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
                          <FormLabel>Процент одобрения</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Отображение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="text-sm">Рекомендуемый</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="text-sm">Новый</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="text-sm">Популярный</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showOnHomepage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="text-sm">Показывать на главной</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Условия */}
            <TabsContent value="terms" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Условия займа</CardTitle>
                  <CardDescription>
                    Сумма, срок и процентная ставка
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="baseRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ставка (% / день)</FormLabel>
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
                          <FormLabel>Первый займ (% / день)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              placeholder="0 = под 0%"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            0 = первый займ бесплатно
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="decisionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время решения (минуты)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0 = мгновенно"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Требования</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="minAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Минимальный возраст</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">лет</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="badCreditOk"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Плохая КИ — OK</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noCalls"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Без звонков</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roundTheClock"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-sm">Круглосуточно</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Особенности */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Особенности оффера</CardTitle>
                  <CardDescription>
                    Выберите подходящие опции
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map(feature => (
                      <Badge
                        key={feature.value}
                        variant={features.includes(feature.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFeature(feature.value)}
                      >
                        {features.includes(feature.value) && (
                          <span className="mr-1">✓</span>
                        )}
                        {feature.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Способы получения</CardTitle>
                  <CardDescription>
                    Как клиент может получить деньги
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {payoutMethodOptions.map(method => (
                      <Badge
                        key={method.value}
                        variant={payoutMethods.includes(method.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePayoutMethod(method.value)}
                      >
                        {payoutMethods.includes(method.value) && (
                          <span className="mr-1">✓</span>
                        )}
                        {method.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO настройки</CardTitle>
                  <CardDescription>
                    Мета-теги для поисковых систем
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Займ в ${form.watch("name") || "МФО"} под 0% — Онлайн на карту`}
                            {...field} 
                          />
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
                            rows={3}
                            placeholder={`Получите займ в ${form.watch("name") || "МФО"}...`}
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

                  <FormField
                    control={form.control}
                    name="customDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание для сайта</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4}
                            placeholder="Описание оффера для страницы..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
