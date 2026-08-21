import {
  ArrowLeft,
  Camera,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const verificationSteps = [
  {
    icon: Camera,
    title: "Увімкніть камеру",
    description: "Дозвольте доступ до камери, щоб розпочати перевірку в реальному часі.",
  },
  {
    icon: ScanFace,
    title: "Виконайте підказки",
    description: "Повільно рухайте головою вперед або назад, як підкаже система.",
  },
  {
    icon: ShieldCheck,
    title: "Отримайте позначку",
    description: "Amazon Rekognition перевірить результат, і в профілі з'явиться значок.",
  },
]

const checkedFeatures = [
  "Чи перебуває перед камерою жива людина?",
  "Чи відповідає обличчя фотографії в анкеті?",
  "Чи достатньо чітке відео для аналізу?",
]

export default function VerificationPage() {
  return (
    <main className="relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_right,oklch(0.88_0.12_48/.8),transparent_60%),radial-gradient(circle_at_top_left,oklch(0.9_0.06_165/.55),transparent_55%)]" />

      <div className="mx-auto max-w-5xl">
        <Link
          to="/me"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Назад до профілю
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div className="max-w-2xl">
            {/* <Badge className="text-md p-3 mb-5">
              <ShieldCheck className="size-4" />
              Довіра в EchoMatch
            </Badge> */}
            <h1 className="max-w-xl font-heading text-4xl leading-[1.06] font-semibold tracking-tight sm:text-5xl">
              Знайомства, за профілем яких стоїть реальна людина
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Верифікація за допомогою AWS Amazon Rekognition допомагає підтвердити,
              що перед камерою перебуваєте саме ви. Під час перевірки живості система
              попросить вас трохи порухати головою.
            </p>
          </div>

          <Card className="border-primary/15 bg-foreground text-background shadow-xl shadow-primary/10">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ScanFace className="size-6" />
              </div>
              <CardTitle className="text-2xl text-background">Що таке Amazon Rekognition?</CardTitle>
              <CardDescription className="text-background/70">
                Хмарний сервіс комп'ютерного зору від Amazon Web Services,
                який може перевірити обличчя та живість людини через камеру.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 border-t border-background/15 pt-5 text-sm leading-6 text-background/80">
                <LockKeyhole className="mt-1 size-4 shrink-0 text-primary" />
                Камера використовується лише під час перевірки. Система не оцінює
                вашу зовнішність і не впливає на рекомендації профілів.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-14 border-t border-foreground/10 pt-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Три прості кроки</p>
              <h2 className="mt-1 font-heading text-2xl font-semibold">Як відбувається перевірка</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
              Увесь процес займає кілька хвилин і запускається лише за вашою згодою.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {verificationSteps.map(({ icon: Icon, title, description }, index) => (
              <Card key={title} className="relative bg-card/80 shadow-none ring-1 ring-foreground/8">
                <CardContent>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-heading text-3xl font-semibold text-foreground/15">0{index + 1}</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-8 border-t border-foreground/10 pt-8 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Прозоро та обережно</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">Що саме перевіряється?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Алгоритм працює з візуальними ознаками обличчя, а не з особистими
              судженнями. Результат перевірки відображається у вигляді зрозумілого
              значка у вашому профілі.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {checkedFeatures.map((feature) => (
              <div key={feature} className="flex h-full items-start gap-4 border-l-2 border-primary/50 bg-card/50 px-4 py-3 text-sm leading-6">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary/10 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-semibold">Готові підтвердити свій профіль?</p>
            {/* <p className="mt-1 text-sm text-muted-foreground">Під час перевірки камера покаже прості підказки для руху головою.</p> */}
          </div>
          <Button render={<Link to="/me" />}>Розпочати перевірку</Button>
        </div>
      </div>
    </main>
  )
}