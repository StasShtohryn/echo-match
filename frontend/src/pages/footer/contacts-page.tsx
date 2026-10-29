import { useEffect, useState } from "react"
import {
  Handshake,
  Wrench,
  Lightbulb,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const contactSections = [
  {
    icon: Handshake,
    title: "Партнерство та співпраця",
    description: "З питань колаборацій, маркетингу, преси та бізнес-пропозицій.",
    phone: "+380 (44) 390-11-01",
    email: "partners@echomatch.ua",
    hours: "Пн-Пт: 09:00 — 18:00",
    badge: "Бізнес",
  },
  {
    icon: Wrench,
    title: "Технічна підтримка",
    description: "Повідомити про помилки в додатку, проблеми з входом або роботу AI.",
    phone: "+380 (44) 390-11-02",
    email: "support@echomatch.ua",
    hours: "Цілодобово 24/7",
    badge: "24/7",
  },
  {
    icon: Lightbulb,
    title: "Пропозиції та ідеї",
    description: "Маєте ідеї щодо нових функцій чи покращення інтерфейсу? Напишіть нам!",
    phone: "+380 (44) 390-11-03",
    email: "ideas@echomatch.ua",
    hours: "Пн-Пт: 10:00 — 19:00",
    badge: "Фідбек",
  },
  {
    icon: AlertTriangle,
    title: "Скарги та скасування",
    description: "Скарги на неналежну поведінку користувачів, контент чи запити щодо конфіденційності.",
    phone: "+380 (44) 390-11-04",
    email: "safety@echomatch.ua",
    hours: "Щодня: 08:00 — 22:00",
    badge: "Безпека",
  },
]

export default function ContactPage() {
  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   category: "support",
  //   message: "",
  // })
  // const [isSubmitting, setIsSubmitting] = useState(false)
  // const [isSent, setIsSent] = useState(false)

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setIsSubmitting(true)

  //   // Імітація відправки
  //   setTimeout(() => {
  //     setIsSubmitting(false)
  //     setIsSent(true)
  //     setFormData({ name: "", email: "", category: "support", message: "" })
  //   }, 1000)
  // }


  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Заголовок сторінки */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            Зв'язок з нами
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Контакти <span className="text-primary">EchoMatch</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Оберіть відповідний напрямок для вашого запиту, щоб ми відповіли якнайшвидше.
          </p>
        </div>

        {/* Сітка 4 блоків сайтів/контактів */}
        <div className="grid gap-6 font-sans sm:grid-cols-2 lg:grid-cols-2">
          {contactSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="relative overflow-hidden font-sans border border-border/60 hover:border-primary/40 transition-all shadow-sm hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center font-sans justify-between">
                    <div className="size-11 font-sans rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-xs font-sans">
                      {section.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl pt-2 font-sans">{section.title}</CardTitle>
                  <CardDescription className="text-sm font-sans">{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0 text-sm">
                  <div className="flex font-sans items-center gap-2.5 text-muted-foreground">
                    <Phone className="size-4 text-primary shrink-0" />
                    <a href={`tel:${section.phone}`} className="hover:text-foreground font-medium transition-colors">
                      {section.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="size-4 text-primary shrink-0" />
                    <a href={`mailto:${section.email}`} className="hover:text-foreground font-medium transition-colors">
                      {section.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <Clock className="size-3.5 shrink-0" />
                    <span>{section.hours}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Форма відправки швидкого повідомлення
        <Card className="max-w-3xl mx-auto border border-border/60 shadow-lg">
          <CardHeader className="text-center sm:text-left">
            <div className="flex items-center gap-2 text-primary justify-center sm:justify-start">
              <MessageSquare className="size-5" />
              <CardTitle className="text-2xl">Написати нам безпосередньо</CardTitle>
            </div>
            <CardDescription>
              Заповніть форму нижче, і наш менеджер зв'яжеться з вами протягом декількох годин.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="p-6 text-center space-y-3 bg-primary/5 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-bold text-primary">Повідомлення успішно надіслано!</h3>
                <p className="text-sm text-muted-foreground">
                  Дякуємо за звернення. Ми вже обробляємо ваш запит і відповімо на вказану пошту.
                </p>
                <Button variant="outline" className="mt-2" onClick={() => setIsSent(false)}>
                  Надіслати ще одне
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ваше ім'я</label>
                    <Input
                      required
                      placeholder="Олександр"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email адреса</label>
                    <Input
                      required
                      type="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Тема звернення</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="partners">Співпраця та партнерство</option>
                    <option value="support">Технічна проблема / Помилка</option>
                    <option value="ideas">Пропозиція щодо покращення</option>
                    <option value="safety">Скарга або безпека</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Повідомлення</label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Опишіть ваше запитання детальніше..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto gap-2 cursor-pointer" disabled={isSubmitting}>
                  <Send className="size-4" />
                  {isSubmitting ? "Надсилаємо..." : "Надіслати повідомлення"}
                </Button>
              </form> */}
        {/* )} */}
        {/* </CardContent>
        </Card> */}
      </div>
    </div>
  )
}