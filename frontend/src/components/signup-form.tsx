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
import { Link } from "react-router"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Створіть обліковий запис</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Заповніть форму нижче, щоб створити обліковий запис
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Повне ім'я</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Іван Петренко"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
          <FieldDescription>
            Ми використаємо цю адресу, щоб зв'язатися з вами. Ми не передаватимемо
            вашу електронну пошту третім особам.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input
            id="password"
            type="password"
            required
          />
          <FieldDescription>
            Має містити щонайменше 8 символів.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Підтвердіть пароль</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
          />
          <FieldDescription>Підтвердьте свій пароль.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Створити обліковий запис</Button>
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
          <FieldDescription className="px-6 text-center">
            Вже маєте обліковий запис? <Link to="/login">Увійти</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
