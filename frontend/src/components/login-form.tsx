import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import googleIcon from "@/assets/signgooglelighttext.png";
import { Link } from "react-router";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Вхід до облікового запису</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Введіть електронну пошту та пароль нижче, щоб увійти до свого облікового запису
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="border-border bg-card shadow-sm"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            {/* <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Забули пароль?
            </a> */}
          </div>
          <Input
            id="password"
            type="password"
            className="border-border bg-card shadow-sm"
            required
          />
        </Field>
        <Field>
          <Button type="submit">Увійти</Button>
        </Field>
        <FieldSeparator>Або продовжити за допомогою</FieldSeparator>
        <Field>
          <button 
            type="button" 
            className="max-w-40 w-full mx-auto hover:cursor-pointer"
            onClick={() => { }}
          >
            <img 
              src={googleIcon} 
              alt="Увійти через Google" 
              className="w-full h-auto object-contain" 
            />
          </button>
          <FieldDescription className="text-center">
            Ще не маєте облікового запису?{" "}
            <Link to="/register" className="underline underline-offset-4">
              Зареєструватися
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
