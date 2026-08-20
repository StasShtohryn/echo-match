import { Heart } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-6 py-16">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Heart className="size-7" fill="currentColor" />
        </div>
        <p className="font-sans text-2xl font-semibold uppercase tracking-[0.2em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Сторінку не знайдено
        </h1>
        <Button className="mt-8" size={"lg"}>
          <Link to="/">
            На головну
          </Link>
        </Button>
      </div>
    </section>
  )
}