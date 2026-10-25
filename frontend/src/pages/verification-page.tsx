import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ScanFace,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Loader2,
  LockKeyhole,
  Check,
  X,
} from "lucide-react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react-liveness/styles.css";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";
import {
  createFaceVerificationSession,
  completeFaceVerification,
  getMyProfile,
  type MyProfile,
  type FaceVerificationSession,
  type FaceVerificationResult,
} from "@/services/auth-service";
import { configureAmplify, hasCognitoConfigured } from "@/lib/aws";
import { getApiErrorMessage } from "@/lib/api-error";

const verificationSteps = [
  {
    icon: Camera,
    title: "Увімкніть камеру",
    description: "Дозвольте доступ до камери, щоб розпочати перевірку в реальному часі.",
  },
  {
    icon: ScanFace,
    title: "Виконайте підказки",
    description: "Повільно наближайтеся або тримайте обличчя в овалі, як підкаже система.",
  },
  {
    icon: ShieldCheck,
    title: "Отримайте позначку",
    description: "Amazon Rekognition перевірить результат, і в профілі з'явиться значок.",
  },
];

const checkedFeatures = [
  "Чи перебуває перед камерою жива людина?",
  "Чи відповідає обличчя фотографіям в анкеті?",
  "Чи достатньо чітке відео для аналізу?",
];

type FlowMode = "intro" | "starting" | "detecting" | "verifying" | "result";

export default function VerificationPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [mode, setMode] = useState<FlowMode>("intro");
  const [session, setSession] = useState<FaceVerificationSession | null>(null);
  const [result, setResult] = useState<FaceVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const data = await getMyProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to load profile for verification:", error);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStartVerification() {
    setErrorMessage(null);

    // Перевірка наявності фотографій
    if (!profile || profile.photos.length === 0) {
      toast.add({
        type: "error",
        title: "Немає фотографій",
        description: "Будь ласка, завантажте хоча б одне фото у профіль перед проходженням верифікації.",
      });
      return;
    }

    // Перевірка конфігурації Cognito Identity Pool для детектора в браузері
    if (!hasCognitoConfigured()) {
      toast.add({
        type: "error",
        title: "Налаштування AWS відсутні",
        description: "Потрібно вказати VITE_AWS_COGNITO_IDENTITY_POOL_ID у файлі .env для підключення до камери.",
      });
      return;
    }

    setMode("starting");

    try {
      const newSession = await createFaceVerificationSession();
      setSession(newSession);

      // Налаштовуємо AWS Amplify під регіон сесії
      const isConfigured = configureAmplify(newSession.region);
      if (!isConfigured) {
        throw new Error("Не вдалося ініціалізувати AWS Amplify з наданими параметрами.");
      }

      setMode("detecting");
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Не вдалося розпочати сесію верифікації. Спробуйте пізніше.",
      );
      setErrorMessage(message);
      setMode("intro");
      toast.add({
        type: "error",
        title: "Помилка запуску",
        description: message,
      });
    }
  }

  async function handleAnalysisComplete() {
    if (!session) return;

    setMode("verifying");

    try {
      const verificationResponse = await completeFaceVerification(session.sessionId);
      setResult(verificationResponse);

      // Оновлюємо профіль, щоб оновилися статуси фото та бейдж
      try {
        const updatedProfile = await getMyProfile();
        setProfile(updatedProfile);
      } catch (e) {
        console.warn("Could not refresh profile after verification:", e);
      }

      setMode("result");
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Не вдалося обробити результат верифікації сервером.",
      );
      setErrorMessage(message);
      setMode("result");
      toast.add({
        type: "error",
        title: "Помилка перевірки",
        description: message,
      });
    }
  }

  function handleLivenessError(error: { state: string; error: Error }) {
    console.error("Liveness detector error:", error);
    const message = error.error?.message || "Сталася помилка під час роботи камери.";
    setErrorMessage(message);
    setMode("result");
    toast.add({
      type: "error",
      title: "Помилка камери",
      description: message,
    });
  }

  function handleUserCancel() {
    setMode("intro");
    setSession(null);
  }

  const hasPhotos = Boolean(profile && profile.photos.length > 0);
  const allPhotosVerified = Boolean(
    hasPhotos && profile?.photos.every((p) => p.isFaceVerified),
  );
  const cognitoReady = hasCognitoConfigured();

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col">
      <ScrollArea className="h-full min-h-0 flex-1">
        <main className="relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_right,oklch(0.88_0.12_48/.8),transparent_60%),radial-gradient(circle_at_top_left,oklch(0.9_0.06_165/.55),transparent_55%)]" />

          <div className="mx-auto max-w-5xl">
            {/* Навігація назад */}
            <Link
              to="/me"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Назад до профілю
            </Link>

            {/* СТАН 1: Створення сесії (лоадер) */}
            {mode === "starting" && (
              <Card className="mx-auto my-12 max-w-lg border-primary/20 bg-card/90 p-8 text-center shadow-xl backdrop-blur-sm">
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                  <h2 className="font-heading text-2xl font-semibold">Створення безпечної сесії...</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Підключаємося до Amazon Rekognition та готуємо камеру для перевірки. Зачекайте декілька секунд.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* СТАН 2: Активна камера та сканування (FaceLivenessDetector) */}
            {mode === "detecting" && session && (
              <div className="mx-auto my-6 max-w-2xl">
                <Card className="overflow-hidden border-primary/20 bg-card shadow-2xl">
                  <CardHeader className="border-b bg-muted/40 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <ScanFace className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Перевірка обличчя</CardTitle>
                          <CardDescription>Amazon Rekognition Face Liveness</CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleUserCancel}>
                        Скасувати
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="relative mx-auto flex min-h-[460px] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-background">
                      <FaceLivenessDetector
                        sessionId={session.sessionId}
                        region={session.region}
                        onAnalysisComplete={handleAnalysisComplete}
                        onError={handleLivenessError}
                        onUserCancel={handleUserCancel}
                      />
                    </div>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Відеопотік передається напряму до зашифрованого сервісу AWS і не зберігається на нашому сервері.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* СТАН 3: Обробка та порівняння з фото на бэкенді */}
            {mode === "verifying" && (
              <Card className="mx-auto my-12 max-w-lg border-primary/20 bg-card/90 p-8 text-center shadow-xl backdrop-blur-sm">
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                  <h2 className="font-heading text-2xl font-semibold">Звіряємо обличчя...</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Кадр з камери отримано. Сервер порівнює його з фотографіями вашого профілю за допомогою штучного інтелекту.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* СТАН 4: Результат перевірки */}
            {mode === "result" && (
              <div className="mx-auto my-8 max-w-2xl">
                {result && result.status === "Completed" ? (
                  <Card className="border-primary/30 bg-card/95 shadow-xl">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <ShieldCheck className="size-9" />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl">
                        {result.isProfileVerified ? "Профіль успішно верифіковано!" : "Перевірку обличчя завершено"}
                      </CardTitle>
                      <CardDescription className="mx-auto max-w-md text-base">
                        {result.isProfileVerified
                          ? "Головне фото вашого профілю підтверджено. Тепер у вашій анкеті з'явилася синя позначка верифікації!"
                          : "Обличчя перед камерою успішно перевірено, але воно не збіглося з головною фотографією вашого профілю."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        <Sparkles className="size-4" />
                        <span>Впевненість живої людини (Liveness): {Math.round(result.livenessConfidence)}%</span>
                      </div>

                      {/* Список перевірених фотографій */}
                      {result.photos.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Результати по фотографіях:</h4>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {result.photos.map((photoCheck) => {
                              const photoObj = profile?.photos.find((p) => p.id === photoCheck.photoId);
                              const isVerified = photoCheck.match === "Verified";
                              const isMismatch = photoCheck.match === "FaceMismatch";

                              return (
                                <div
                                  key={photoCheck.photoId}
                                  className="relative overflow-hidden rounded-xl border bg-muted/30 p-2 text-center"
                                >
                                  {photoObj?.url ? (
                                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                                      <img
                                        src={photoObj.url}
                                        alt="Фото профілю"
                                        className="h-full w-full object-cover"
                                      />
                                      {photoObj.isMain && (
                                        <Badge className="absolute top-1.5 left-1.5 text-[10px] font-medium" variant="default">
                                          Головне
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="aspect-square w-full rounded-lg bg-muted" />
                                  )}

                                  <div className="mt-2 space-y-1">
                                    {isVerified && (
                                      <Badge variant="secondary" className="gap-1 border-primary/30 text-[11px] text-primary">
                                        <Check className="size-3" />
                                        <span>Підтверджено ({Math.round(photoCheck.similarity ?? 0)}%)</span>
                                      </Badge>
                                    )}
                                    {isMismatch && (
                                      <Badge variant="destructive" className="gap-1 text-[11px]">
                                        <X className="size-3" />
                                        <span>Не збігається</span>
                                      </Badge>
                                    )}
                                    {photoCheck.match === "NoFace" && (
                                      <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                        Обличчя не видно
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => setMode("intro")}>
                          До інструкцій
                        </Button>
                        <Button onClick={() => navigate("/me")}>
                          Повернутися до профілю
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-destructive/30 bg-card shadow-xl">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                        <AlertCircle className="size-9" />
                      </div>
                      <CardTitle className="text-2xl">Верифікацію не пройдено</CardTitle>
                      <CardDescription className="mx-auto max-w-md text-base">
                        {result?.status === "NotLive"
                          ? "Система не змогла підтвердити, що перед камерою знаходиться жива людина."
                          : result?.status === "Expired"
                            ? "Час сесії перевірки вичерпано. Будь ласка, почніть нову спробу."
                            : errorMessage || "Сталася непередбачена помилка під час аналізу."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <div className="rounded-xl border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Поради для успішної перевірки:</p>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                          <li>Переконайтеся, що світло падає прямо на обличчя, а не світить ззаду.</li>
                          <li>Зніміть сонцезахисні окуляри або капелюх.</li>
                          <li>Дивіться безпосередньо у камеру та слідуйте підказкам.</li>
                        </ul>
                      </div>

                      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => setMode("intro")}>
                          Назад
                        </Button>
                        <Button onClick={handleStartVerification} className="gap-2">
                          <RotateCcw className="size-4" />
                          Спробувати ще раз
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* СТАН 0: Початковий екран (Інтро / Лендинг) */}
            {mode === "intro" && (
              <>
                <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
                  <div className="max-w-2xl">
                    <h1 className="max-w-xl font-heading text-4xl leading-[1.06] font-semibold tracking-tight sm:text-5xl">
                      Знайомства, за профілем яких стоїть реальна людина
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                      Верифікація за допомогою AWS Amazon Rekognition допомагає підтвердити, що перед камерою перебуваєте
                      саме ви. Під час швидкої перевірки система попросить вас розташувати обличчя в овальній рамці.
                    </p>
                  </div>

                  <Card className="border-primary/15 bg-foreground text-background shadow-xl shadow-primary/10">
                    <CardHeader>
                      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <ScanFace className="size-6" />
                      </div>
                      <CardTitle className="text-2xl text-background">Що таке Amazon Rekognition?</CardTitle>
                      <CardDescription className="text-background/70">
                        Сучасна система комп'ютерного зору від Amazon Web Services для безпечного та конфіденційного
                        підтвердження особи без збереження відеозаписів.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-background/80">
                      <p>
                        Технологія Face Liveness гарантує, що перед камерою справжня жива людина, а не фотографія чи екран смартфона.
                      </p>
                      <div className="flex items-center gap-2 font-medium text-primary">
                        <LockKeyhole className="size-4" />
                        <span>Конфіденційність: відео не зберігається на серверах</span>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="mt-14 border-t border-foreground/10 pt-8">
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">Як це працює</p>
                      <h2 className="mt-1 font-heading text-2xl font-semibold">Простий та швидкий процес</h2>
                    </div>
                    <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
                      Увесь процес займає менше хвилини і запускається лише за вашою командою.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {verificationSteps.map(({ icon: Icon, title, description }, index) => (
                      <Card key={title} className="relative bg-card/80 shadow-none ring-1 ring-foreground/8">
                        <CardContent className="pt-6">
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
                    <p className="text-sm font-semibold text-primary">Прозоро та безпечно</p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold">Що саме перевіряється?</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Алгоритм працює виключно з геометрією та живістю обличчя. Результат миттєво відображається у вигляді
                      офіційної синьої позначки довіри у вашому профілі.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                    {checkedFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex h-full items-start gap-4 border-l-2 border-primary/50 bg-card/50 px-4 py-3 text-sm leading-6"
                      >
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Блок з кнопкою старту */}
                <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary/10 p-5 sm:flex-row sm:items-center sm:px-6">
                  <div>
                    <p className="font-semibold text-base">
                      {allPhotosVerified
                        ? "Усі ваші фотографії вже верифіковано!"
                        : profile?.isFaceVerified
                          ? "У вашому профілі є нові неверифіковані фото"
                          : "Готові підтвердити свій профіль?"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {allPhotosVerified
                        ? "Ваш профіль уже має синю позначку верифікації."
                        : !hasPhotos
                          ? "Для початку завантажте хоча б одну фотографію у профіль."
                          : "Камера покаже прості підказки на екрані. Процес триває близько 10 секунд."}
                    </p>
                  </div>

                  <div>
                    {!cognitoReady ? (
                      <div className="flex items-center gap-2 text-xs text-amber-500">
                        <AlertTriangle className="size-4" />
                        <span>Потрібен VITE_AWS_COGNITO_IDENTITY_POOL_ID у .env</span>
                      </div>
                    ) : allPhotosVerified ? (
                      <Button variant="outline" onClick={handleStartVerification}>
                        Перевірити знову
                      </Button>
                    ) : (
                      <Button
                        disabled={!hasPhotos || isLoadingProfile}
                        onClick={handleStartVerification}
                        className="min-w-44"
                      >
                        {isLoadingProfile ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Розпочати перевірку"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </ScrollArea>
    </div>
  );
}
