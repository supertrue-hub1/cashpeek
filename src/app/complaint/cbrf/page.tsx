import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ComplaintForm } from '@/components/complaint/ComplaintForm';
import {
  Shield,
  Clock,
  FileCheck,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Подать жалобу в ЦБ РФ на МФО | Официальный сервис',
  description: 'Бесплатный сервис для подачи жалобы в Центральный банк РФ на действия микрофинансовых организаций. Автоматическое формирование документа Word.',
};

export default function ComplaintCBRFPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-r from-red-600/5 via-orange-500/5 to-yellow-500/5">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  Официальный сервис
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Бесплатно
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Подать жалобу в ЦБ РФ
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                Автоматическое формирование жалобы на действия банков и МФО. 
                Документ соответствует требованиям ЦБ РФ.
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Срок рассмотрения: 30 дней</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  <span>Готовый документ .docx</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Конфиденциальность данных</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Why Submit */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Когда подавать жалобу?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Нарушение условий договора</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Неправомерное начисление процентов</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Незаконные действия коллекторов</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Отказ в досрочном погашении</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Передача данных третьим лицам</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Угрозы и психологическое давление</span>
                  </div>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                    Как это работает?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Заполните форму</p>
                      <p className="text-sm text-muted-foreground">
                        Укажите данные и опишите суть нарушения
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Скачайте документ</p>
                      <p className="text-sm text-muted-foreground">
                        Жалоба формируется в формате Word
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Отправьте в ЦБ РФ</p>
                      <p className="text-sm text-muted-foreground">
                        Почтой, онлайн или лично
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CBRF Contacts */}
              <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-red-500" />
                    Контакты ЦБ РФ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Адрес</p>
                      <p className="text-muted-foreground">107016, г. Москва, ул. Неглинная, д. 12</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Телефон доверия</p>
                      <p className="text-muted-foreground">8 800 300-30-00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Интернет-приёмная</p>
                      <a 
                        href="https://www.cbr.ru/Reception/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        www.cbr.ru/Reception
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-purple-500" />
                    Частые вопросы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="q1">
                      <AccordionTrigger className="text-sm">
                        Сколько рассматривается жалоба?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        ЦБ РФ рассматривает обращения в течение 30 календарных дней 
                        со дня регистрации. В сложных случаях срок может быть продлён.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="q2">
                      <AccordionTrigger className="text-sm">
                        Нужно ли нотариально заверять?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Нет, нотариальное заверение не требуется. 
                        Достаточно подписи заявителя.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="q3">
                      <AccordionTrigger className="text-sm">
                        Какие документы приложить?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Копию договора займа, платёжные документы, 
                        скриншоты переписки — всё, что подтверждает факты нарушения.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="q4">
                      <AccordionTrigger className="text-sm">
                        Анонимно можно подать?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Нет, ЦБ РФ не рассматривает анонимные обращения. 
                        Необходимо указать полные данные заявителя.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div>
              <div className="sticky top-4">
                <ComplaintForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
