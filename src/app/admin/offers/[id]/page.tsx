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
  Eye,
  RefreshCw,
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
import { mockOffers } from "@/data/mock-offers"
import { toast } from "sonner"

// Схема валидации Zod
const offerFormSchema = z.object({
  // SEO данные (редактируемые)
  name: z.string().min(2, "Название должно быть от 2 символов"),
  slug: z.string().min(2, "Slug должен быть от 2 символов").regex(/^[a-z0-9-]+$/, "Только строчные буквы, цифры и дефисы"),
  rating: z.number().min(0).max(5),
  editorNote: z.string().optional(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isPopular: z.boolean(),
  
  // SEO мета-данные
  metaTitle: z.string().max(60, "Максимум 60 символов").optional(),
  metaDescription: z.string().max(160, "Максимум 160 символов").optional(),
  
  // Партнёрские настройки
  affiliateUrl: z.string().url("Должен быть валидный URL"),
  affiliateId: z.string().optional(),
  
  // Отображение
  showOnHomepage: z.boolean(),
  sortOrder: z.number().min(0).max(100),
})

type OfferFormValues = z.infer<typeof offerFormSchema>

// Мок данные API (только для чтения)
const apiData = {
  minAmount: 1000,
  maxAmount: 30000,
  minTerm: 7,
  maxTerm: 30,
  baseRate: 0.63,
  firstLoanRate: 0,
  decisionTime: 2,
  approvalRate: 94,
  payoutMethods: ["card", "yoomoney", "qiwi", "contact"],
  features: ["first_loan_zero", "online_approval", "one_document", "prolongation"],
  badCreditOk: true,
  noCalls: true,
  roundTheClock: true,
  minAge: 18,
  documents: ["passport"],
  lastSync: "2024-12-16T14:30:00",
  sourceId: "leads_su_12345",
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

export default function OfferEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = React.useState<string>("")
  
  React.useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])
  
  // Находим оффер
  const offer = mockOffers.find(o => o.id === id)

  // Форма с React Hook Form + Zod
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
      metaTitle: "",
      metaDescription: "",
      affiliateUrl: offer?.affiliateUrl || "",
      affiliateId: "",
      showOnHomepage: true,
      sortOrder: 10,
    },
  })

  const onSubmit = (data: OfferFormValues) => {
    console.log("Form submitted:", data)
    toast.success("Изменения сохранены", {
      description: `Оффер "${data.name}" успешно обновлён`,
    })
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
            <h1 className="text-2xl font-bold tracking-tight">
              {offer?.name || "Новый оффер"}
            </h1>
            <p className="text-muted-foreground">
              ID: {id} • Источник: Leads.su
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Предпросмотр
          </Button>
          <Button 
            size="sm" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={!form.formState.isValid}
          >
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Основная форма */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Основное</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="affiliate">Партнёрка</TabsTrigger>
                  <TabsTrigger value="display">Отображение</TabsTrigger>
                </TabsList>

                {/* Основное */}
                <TabsContent value="general" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Основная информация</CardTitle>
                      <CardDescription>
                        Название и описание оффера
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                            <FormDescription>
                              От 0 до 5, отображается на карточке
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="editorNote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Примечание редактора</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3}
                                placeholder="Ваши заметки об оффере..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Видно только в админ-панели
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                                {...field}
                                placeholder="Займ в {name} под 0% — Онлайн на карту"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Рекомендуется 50-60 символов</span>
                              <span>{field.value?.length || 0}/60</span>
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
                                placeholder="Получите займ в {name}..."
                                {...field}
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Рекомендуется 150-160 символов</span>
                              <span>{field.value?.length || 0}/160</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Партнёрка */}
                <TabsContent value="affiliate" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Партнёрские настройки</CardTitle>
                      <CardDescription>
                        Ссылки и трекинг
                      </CardDescription>
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

                      <FormField
                        control={form.control}
                        name="affiliateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID в партнёрской сети</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="leads_su_12345" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Отображение */}
                <TabsContent value="display" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Настройки отображения</CardTitle>
                      <CardDescription>
                        Где и как показывать оффер
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Рекомендуемый</FormLabel>
                              <FormDescription>
                                Показывать с меткой "Рекомендуем"
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
                        name="isNew"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Новый</FormLabel>
                              <FormDescription>
                                Показывать с меткой "Новый"
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
                        name="isPopular"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Популярный</FormLabel>
                              <FormDescription>
                                Показывать в блоке популярных
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
                        name="showOnHomepage"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Показывать на главной</FormLabel>
                              <FormDescription>
                                Включить в список на главной странице
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
                        name="sortOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Порядок сортировки</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Чем меньше число, тем выше в списке
                            </FormDescription>
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

        {/* Данные API (только чтение) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Данные API</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Только чтение
                </Badge>
              </div>
              <CardDescription>
                Получены из Leads.su
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Последняя синхронизация</span>
                <span className="font-medium">
                  {new Date(apiData.lastSync).toLocaleString("ru-RU")}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Синхронизировать
              </Button>
              
              <Separator />
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Сумма</span>
                  <span className="font-medium">
                    {apiData.minAmount.toLocaleString()} – {apiData.maxAmount.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Срок</span>
                  <span className="font-medium">
                    {apiData.minTerm}–{apiData.maxTerm} дней
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ставка</span>
                  <span className="font-medium">{apiData.baseRate}% / день</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Первый займ</span>
                  <span className="font-medium">
                    {apiData.firstLoanRate === 0 ? "Под 0%" : `${apiData.firstLoanRate}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Решение</span>
                  <span className="font-medium">
                    {apiData.decisionTime === 0 ? "Мгновенно" : `${apiData.decisionTime} мин`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Одобрение</span>
                  <span className="font-medium">{apiData.approvalRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Особенности</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {apiData.features.map(feature => (
                  <Badge key={feature} variant="secondary">
                    {featureLabels[feature] || feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Способы получения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {apiData.payoutMethods.map(method => (
                  <Badge key={method} variant="outline">
                    {payoutMethodLabels[method] || method}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Требования</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Мин. возраст</span>
                <span className="font-medium">{apiData.minAge} лет</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Документы</span>
                <span className="font-medium">
                  {apiData.documents.map(d => d === "passport" ? "Паспорт" : d).join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Плохая КИ</span>
                <Badge variant={apiData.badCreditOk ? "default" : "secondary"}>
                  {apiData.badCreditOk ? "Да" : "Нет"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Без звонков</span>
                <Badge variant={apiData.noCalls ? "default" : "secondary"}>
                  {apiData.noCalls ? "Да" : "Нет"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Круглосуточно</span>
                <Badge variant={apiData.roundTheClock ? "default" : "secondary"}>
                  {apiData.roundTheClock ? "Да" : "Нет"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
