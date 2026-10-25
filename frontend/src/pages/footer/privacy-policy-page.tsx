import { useEffect } from "react"
import { Shield, Lock, Eye, Server, Cpu, UserCheck, FileText, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Заголовок сторінки */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            Безпека та Прозорість
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Політика конфіденційності <span className="text-primary">EchoMatch</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Ваша приватність — наш головний пріоритет. Дізнайтеся, як ми захищаємо ваші персональні дані, використовуємо штучний інтелект та дбаємо про ваші інтереси.
          </p>
          <p className="text-muted-foreground text-base sm:text-lg">
            Останнє оновлення: Жовтень 2026 року          </p>
        </div>

        {/* 1. Загальні положення */}
        < Card className="border border-border/60 shadow-xs" >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Shield className="size-5" />
              </div>
              <CardTitle className="text-xl font-sans">1. Загальні положення</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground font-sans">
            <p>
              Ця Політика конфіденційності описує, як сервіс <strong className="text-foreground">EchoMatch</strong> збирає, використовує, зберігає та захищає вашу особисту інформацію під час користування нашим вебсайтом та додатком.
            </p>
            <p>
              Використовуючи EchoMatch, ви погоджуєтеся з умовами збору та обробки даних відповідно до цієї Політики та вимог чинного законодавства України та GDPR.
            </p>
          </CardContent>
        </Card >

        {/* 2. Яку інформацію ми збираємо */}
        < Card className="border border-border/60 shadow-xs font-sans" >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 ">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Eye className="size-5" />
              </div>
              <CardTitle className="text-xl font-sans">2. Яку інформацію ми збираємо</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2 font-sans">
              <li>
                <strong className="text-foreground">Персональні дані профілю:</strong> ім'я, вік, стать, орієнтація, місто, фотографії, опис «Про себе», інтереси та мови спілкування.
              </li>
              <li>
                <strong className="text-foreground">Психологічний тест та сумісність:</strong> ваші відповіді на авторський психологічний тест та вибрані цінності, які використовуються для роботи алгоритмів Smart Matching.
              </li>
              <li>
                <strong className="text-foreground">Геолокація:</strong> географічні координати або вказане місто для визначення відстані між користувачами.
              </li>
              <li>
                <strong className="text-foreground">Дані біометричної верифікації (за бажанням):</strong> фото-селфі для підтвердження обличчя через автоматизовані сервіси **AWS Rekognition**.
              </li>
            </ul>
          </CardContent>
        </Card >

        {/* 3. Штучний інтелект та захист Cloudflare */}
        < Card className="border border-border/60 shadow-xs" >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Cpu className="size-5" />
              </div>
              <CardTitle className="text-xl font-sans">3. AI-технології та мережева інфраструктура</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-2">
              <h4 className="text-base font-sans font-semibold text-foreground flex items-center gap-2">
                Використання моделей штучного інтелекту (Claude 3.5 Sonnet)
              </h4>
              <p>
                Для генерації персоналізованих підказок у чатах та аналізу відповідей ми використовуємо передову генеративну модель <strong className="text-foreground">Claude 3.5 Sonnet</strong> від Anthropic. Ваші особисті повідомлення та листування не використовуються для навчання публічних моделей ШІ.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="text-base font-sans font-semibold text-foreground flex items-center gap-2">
                Безпека мережі та CDN через Cloudflare
              </h4>
              <p>
                Для забезпечення високої швидкості завантаження медіафайлів та захисту від DDoS-атак наш сервіс інтегровано з мережею <strong className="text-foreground">Cloudflare</strong>. Усі запити проходять через зашифровані проксі-сервери Cloudflare із підтримкою сучасних TLS/SSL протоколів безпеки.
              </p>
            </div>
          </CardContent>
        </Card >

        {/* 4. Захист та зберігання даних */}
        < Card className="border border-border/60 shadow-xs" >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Server className="size-5" />
              </div>
              <CardTitle className="text-xl font-sans">4. Збереження та захист даних</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground font-sans">
            <p>
              Ми застосовуємо сучасне шифрування під час передачі (HTTPS/TLS) та збереження даних (AES-256). Доступ до бази даних обмежений і надається лише авторизованим системним компонентам.
            </p>
            <p>
              Ми <strong className="text-foreground">ніколи не продаємо</strong> і не передаємо ваші персональні дані третім особам для маркетингових чи рекламних цілей.
            </p>
          </CardContent>
        </Card >

        {/* 5. Права користувача та видалення */}
        < Card className="border border-border/60 shadow-xs" >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserCheck className="size-5" />
              </div>
              <CardTitle className="text-xl font-sans">5. Ваші права та керування акаунтом</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground font-sans">
            <p>Ви маєте право у будь-який момент:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Редагувати або повністю оновити інформацію про себе в налаштуваннях профілю.</li>
              <li>Відкликати дозвіл на використання геолокації.</li>
              <li>Видалити свій акаунт. При видаленні профілю всі ваші персональні дані, фотографії та чати безповоротно стираються з серверів протягом 30 днів.</li>
            </ul>
          </CardContent>
        </Card >

        {/* 6. Зв'язок з нами */}
        < Card className="border border-border/60 bg-muted/20 shadow-xs" >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Mail className="size-5" />
              </div>
              <CardTitle className="text-xl font-sans">6. Контакти для питань конфіденційності</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground font-sans">
            <p>
              Якщо у вас виникли запитання, пропозиції або скарги щодо обробки персональних даних, зв'яжіться з нашою службою безпеки:
            </p>
            <div className="pt-2 font-medium text-foreground">
              <p>Email: <a href="mailto:privacy@echomatch.ua" className="text-primary hover:underline">privacy@echomatch.ua</a> або <a href="mailto:safety@echomatch.ua" className="text-primary hover:underline">safety@echomatch.ua</a></p>
            </div>
          </CardContent>
        </Card >
      </div >
    </div >
  )
}