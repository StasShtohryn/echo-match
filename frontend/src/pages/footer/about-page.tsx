import { Link } from "react-router"
import { ShieldCheck, Brain, Sparkles, HeartHandshake, CalendarDays, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm font-medium">
            Про проект EchoMatch
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Знайомства для тих, хто шукає <span className="text-primary">справжнє</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground text-balance leading-relaxed">
            EchoMatch створили для того, щоб повернути в онлайн-знайомства щирість, глибину та справжній емоційний відгук. Ми об'єднуємо людей не лише для романтики, а й для спільного дозвілля та якраз яскравих подій.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="gap-2 cursor-pointer shadow-lg shadow-primary/25">
                Знайти пару
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="gap-2 cursor-pointer">
                <Users className="size-4" />
                Переглянути події
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Наша Місія */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Наша місія</h2>
              <p className="text-muted-foreground leading-relaxed">
                Сучасний світ дейтингу часто перетворюється на безкінечне та швидке гортання карток, де за зовнішністю губиться людина. <strong className="text-foreground font-semibold">EchoMatch змінює ці правила.</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ми створюємо простір, де технології допомагають знаходити людей зі схожими цінностями, поглядами на життя, спільними зацікавленнями та справжньою емоційною сумісністю.
              </p>
            </div>
            <Card className="bg-muted/30 border-primary/20 backdrop-blur-xs">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <HeartHandshake className="size-8" />
                  <h3 className="text-xl font-bold text-foreground">Більше ніж просто свайпи</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ми віримо, що найміцніші зв'язки народжуються або з глибокої психологічної сумісності, або під час спільних переживань — гри в настілки, відвідування концертів чи командних походів на заходи.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ключові Переваги */}
      <section className="py-16 sm:py-24 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Чому обирають EchoMatch</h2>
            <p className="text-muted-foreground">
              Продумана екосистема для комфортного та безпечного спілкування
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Перевага 1 */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
              <CardContent className="p-6 space-y-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Brain className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">Психологічний тест</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ми враховуємо глибинну внутрішню складову кожної особистості. Завдяки авторському психологічному тесту та відповідям на промпти ми пропонуємо справді сумісних людей.
                </p>
              </CardContent>
            </Card>

            {/* Перевага 2 */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
              <CardContent className="p-6 space-y-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">AI-помічник у чатах</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Не знаєте, з чого почати розмову? Штучний інтелект підкаже влучний вступ, цікаве запитання чи тему для обговорення, роблячи діалог жвавим та невимушеним.
                </p>
              </CardContent>
            </Card>

            {/* Перевага 3 */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 space-y-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarDays className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">Спільні події та компанії</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Шукаєте компанію на настілки, ігровий вечір чи фестиваль? Вкладка «Події» дозволяє створювати заходи, збирати команди й ходити на події разом з іншими.
                </p>
              </CardContent>
            </Card>

            {/* Перевага 4 */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
              <CardContent className="p-6 space-y-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">Опціональна верифікація</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ви можете підтвердити свій профіль через засіб верифікації AWS Rekognition, отримавши галочку довіри та виділяючись серед інших анкет.
                </p>
              </CardContent>
            </Card>

            {/* Перевага 5 */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40 sm:col-span-2 lg:col-span-2">
              <CardContent className="p-6 space-y-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">Smart Matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Алгоритми враховують ваші життєві орієнтири, мови кохання, стиль спілкування та точну геопозицію, підбираючи людей поруч із вами.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Як це працює */}
      <section className="py-16 sm:py-24 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Як це працює</h2>
            <p className="text-muted-foreground">
              Усього 3 прості кроки до нових знайомств та цікавого дозвілля
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold">Проходьте тестування</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Заповнюйте анкету та психологічний тест, щоб розкрити свій характер та уподобання.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold">Отримуйте «Ехо»-відгук</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Отримуйте анкетні рекомендації з високим рівнем емоційної сумісності або обирайте цікаву подію.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold">Спілкуйтеся й збирайтесь разом</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Користуйтеся підказками AI для старту діалогу, ходіть на події та знайомтеся безпечно.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Готові знайти свою людину чи компанію?
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Приєднуйтесь до спільноти EchoMatch вже сьогодні та розпочніть свою історію прямо зараз.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="px-8 cursor-pointer shadow-lg shadow-primary/25">
                Знайти пару
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div >
  )
}