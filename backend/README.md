# EchoMatch — бекенд

## Що потрібно встановити

- **.NET 8 SDK** — [завантажити](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** — підійде будь-що з переліку:
  - SQL Server Express (рекомендовано)
  - LocalDB (встановлюється разом з Visual Studio)
  - SQL Server у Docker

Перевірити, що SDK на місці:

```bash
dotnet --list-sdks
```

Має бути рядок, що починається з `8.`

---

## 1. Секретний ключ JWT (обов'язково)

Ключ **не зберігається в репозиторії** — кожен розробник генерує свій. Без нього застосунок не запуститься.

У PowerShell:

```powershell
cd backend/EchoMatch/EchoMatch.Api
$bytes = New-Object byte[] 48
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
dotnet user-secrets set "Jwt:Key" ([Convert]::ToBase64String($bytes))
```

Ключ запишеться у твій профіль користувача (`%APPDATA%\Microsoft\UserSecrets\...`), поза папкою проєкту — тож у git він не потрапить.

> Мінімальна довжина — 32 байти. Коротший ключ алгоритм HMAC-SHA256 не прийме.

---

## 2. Підключення до бази

За замовчуванням у `appsettings.json` стоїть:

```
Server=localhost\SQLEXPRESS;Database=EchoMatch;Trusted_Connection=True;TrustServerCertificate=True;
```

Якщо в тебе інший сервер — **не редагуй `appsettings.json`** (це зламає налаштування іншим). Замість цього перекрий рядок через user secrets:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\MSSQLLocalDB;Database=EchoMatch;Trusted_Connection=True;TrustServerCertificate=True;"
```

User secrets мають вищий пріоритет за `appsettings.json`, тож твоє значення переважить.

---

## 3. Створити базу

Один раз встанови інструмент міграцій:

```bash
dotnet tool install --global dotnet-ef --version 8.0.30
```

Потім повернись у **корінь репозиторію** — на попередньому кроці ти перейшов у теку `EchoMatch.Api`, а команди нижче розраховані саме на корінь:

```bash
cd ../../..
```

```bash
dotnet ef database update --project backend/EchoMatch/EchoMatch.Infrastructure --startup-project backend/EchoMatch/EchoMatch.Api
```

> Якщо бачиш `MSB1009: файл проекта не существует` — ти в неправильній теці. Перевір `pwd`: має бути корінь репозиторію, той, де лежать `backend` і `frontend`.

Команда створить базу `EchoMatch`, усі таблиці й наповнить довідники (інтереси, мови, промпти).

> У Visual Studio те саме роблять через **Package Manager Console**:
> `Update-Database -Project EchoMatch.Infrastructure -StartupProject EchoMatch.Api`

---

## 4. Запустити

```bash
dotnet run --project backend/EchoMatch/EchoMatch.Api --launch-profile https
```

Або у Visual Studio — відкрити `backend/EchoMatch/EchoMatch.sln`, обрати профіль **https** і натиснути F5.

Swagger відкриється на:

```
https://localhost:7203/swagger
```

---

## 5. Як покликати захищені ендпоінти

Майже все, крім `/api/auth/*`, вимагає JWT.

1. `POST /api/auth/register` — створити користувача
2. Скопіювати `accessToken` з відповіді
3. Натиснути **Authorize** угорі Swagger, вставити токен (без слова `Bearer`)
4. Тепер решта ендпоінтів доступна

Токен живе 60 хвилин.

---

## Наявні ендпоінти

| Метод | Шлях | Доступ |
|---|---|---|
| POST | `/api/auth/register` | без токена |
| POST | `/api/auth/login` | без токена |
| GET | `/api/lookups` | потрібен токен |
| POST | `/api/profiles` | потрібен токен |

---

## Якщо щось не працює

**`IDX10703: key length is zero`**
Не заданий `Jwt:Key`. Повернись до кроку 1.

**`Cannot open database "EchoMatch"` / `A network-related error`**
Неправильний рядок підключення або сервер не запущений. Перевір, що служба SQL Server працює, і звір крок 2.

**`401 Unauthorized` на `/api/lookups`**
Немає токена або він протух. Залогінься заново і натисни **Authorize** у Swagger.

**`Unable to resolve service for type ...`**
Забули зареєструвати сервіс у DI. Такі помилки не ловляться компілятором — дивись `Program.cs` та `Infrastructure/DependencyInjection.cs`.

---

## Структура рішення

```
EchoMatch.Domain          сутності, enum-и, value objects — без залежностей
EchoMatch.Application     use cases (команди/запити), інтерфейси, DTO
EchoMatch.Infrastructure  EF Core, репозиторії, JWT, хешування паролів
EchoMatch.Api             контролери, middleware, конфігурація
```

Залежності йдуть лише всередину: `Api → Application → Domain`, `Infrastructure → Application → Domain`.

Детальніше — у файлах теки `.claude` в корені репозиторію.
