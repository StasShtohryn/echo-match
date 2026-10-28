import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router";
import { formatDistanceStrict } from "date-fns"
import { uk } from "date-fns/locale"
import { CalendarCheck, CalendarDays, Clock3, Compass, MapPin, Plus, Search, Users, X } from "lucide-react"
import { CalendarDays, Clock3, ImagePlus, MapPin, Plus, Search, Trash2, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { TimePicker } from "@/components/ui/time-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "cn"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import {
  createEvent,
  approveEventJoinRequest,
  getEvent,
  getEventCategories,
  getEventJoinRequests,
  getEventParticipants,
  getEvents,
  getMyEvents,
  joinEvent,
  leaveEvent,
  rejectEventJoinRequest,
} from "@/services/event-service"
import type {
  CreateEventRequest,
  EventCard,
  EventDetails,
  EventFilters,
  EventJoinPolicy,
  EventJoinRequest,
  EventParticipant,
  EventCategory,
} from "@/types/event.types"
import type { DateRange } from "react-day-picker"
import { EVENT_CATEGORY_OPTIONS, getLabel } from "@/lib/some-lookups";
import { uploadEventCover } from "@/services/event-service"
import { EVENT_CATEGORY_STYLES } from "@/lib/events-category-icons";


const emptyFilters: EventFilters = { search: "", city: "", categoryId: "", from: "", to: "" }
const fieldClass =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
const formInputClass = "h-10 rounded-xl border-border bg-background"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function formatCardDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatTimeUntil(value: string, now: Date) {
  const startsAt = new Date(value)

  if (startsAt <= now) return "Вже почалася"

  return formatDistanceStrict(startsAt, now, {
    addSuffix: true,
    locale: uk,
  })
}

function toLocalDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
}

function toLocalDayEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString()
}

function EventCategoryCover({ category }: { category?: { code?: string; name?: string } }) {
  const code = category?.code?.trim() || ""
  console.log(code)
  const name = category?.name?.trim() || ""
  console.log(name)

  // 1. Прямий пошук за кодом (наприклад, "BoardGames")
  let style = EVENT_CATEGORY_STYLES[code]


  // 2. Пошук без урахування регістру
  if (!style) {
    const matchedKey = Object.keys(EVENT_CATEGORY_STYLES).find(
      (key) => key.toLowerCase() === code.toLowerCase() || key.toLowerCase() === name.toLowerCase()
    )
    if (matchedKey) style = EVENT_CATEGORY_STYLES[matchedKey]
  }
  console.log(style)
  // 3. Пошук за кириличною назвою з EVENT_CATEGORY_OPTIONS (наприклад, "Настільні ігри")
  if (!style) {
    const entry = Object.entries(EVENT_CATEGORY_OPTIONS).find(
      ([key, val]) => val.toLowerCase() === name.toLowerCase() || key.toLowerCase() === name.toLowerCase()
    )
    if (entry) {
      style = EVENT_CATEGORY_STYLES[entry[0]]
    }
  }
  console.log(style)
  // Fallback до заглушки "Other"
  const finalStyle = style || EVENT_CATEGORY_STYLES.Other
  const IconComponent = finalStyle.icon

  return (
    <div className={`flex size-full items-center justify-center bg-gradient-to-br ${finalStyle.gradient}`}>
      <IconComponent className={`size-16 transition-transform duration-500 group-hover:scale-110 ${finalStyle.textColor}`} />
    </div>
  )
}


function EventForm({
  categories,
  onClose,
  onCreated,
}: {
  categories: EventCategory[]
  onClose: () => void
  onCreated: (event: EventDetails) => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [joinPolicy, setJoinPolicy] = useState<EventJoinPolicy>("Open")
  const [categoryId, setCategoryId] = useState("")
  const [startsAtDate, setStartsAtDate] = useState<Date>()
  const [startsAtTime, setStartsAtTime] = useState("")
  const [endsAtDate, setEndsAtDate] = useState<Date>()
  const [endsAtTime, setEndsAtTime] = useState("")

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.add({ type: "error", title: "Будь ласка, оберіть зображення" })
      return
    }

    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleRemoveCover() {
    setCoverFile(null)
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
      setCoverPreview(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!categoryId || !startsAtDate || !startsAtTime) {
      toast.add({ type: "error", title: "Заповніть категорію, дату й час початку" })
      return
    }
    if (Boolean(endsAtDate) !== Boolean(endsAtTime)) {
      toast.add({ type: "error", title: "Для завершення вкажіть і дату, і час" })
      return
    }
    const form = new FormData(event.currentTarget)
    const capacityValue = String(form.get("capacity") ?? "").trim()
    const startsAt = new Date(
      startsAtDate.getFullYear(),
      startsAtDate.getMonth(),
      startsAtDate.getDate(),
      Number(startsAtTime.slice(0, 2)),
      Number(startsAtTime.slice(3, 5)),
    )
    const endsAt = endsAtDate
      ? new Date(
        endsAtDate.getFullYear(),
        endsAtDate.getMonth(),
        endsAtDate.getDate(),
        Number(endsAtTime.slice(0, 2)),
        Number(endsAtTime.slice(3, 5)),
      )
      : null
    const request: CreateEventRequest = {
      title: String(form.get("title") ?? "").trim(),
      description: String(form.get("description") ?? "").trim() || null,
      categoryId: Number(categoryId),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
      city: String(form.get("city") ?? "").trim(),
      placeName: String(form.get("placeName") ?? "").trim() || null,
      capacity: capacityValue ? Number(capacityValue) : null,
      joinPolicy,
    }

    setIsSaving(true)
    try {
      let created = await createEvent(request)

      if (coverFile) {
        try {
          const coverUrl = await uploadEventCover(created.id, coverFile)
          created = { ...created, coverUrl } // Присвоюємо завантажений URL обкладинки
        } catch (uploadErr) {
          console.error("Не вдалося завантажити фото події:", uploadErr)
          toast.add({
            type: "warning",
            title: "Подію створено",
            description: "Проте не вдалося завантажити обкладинку.",
          })
        }
      }

      toast.add({ type: "success", title: "Подію створено" })
      onCreated(created)
    } catch (error) {
      toast.add({
        type: "error",
        title: "Не вдалося створити подію",
        description: getApiErrorMessage(error, "Перевірте дані та спробуйте ще раз."),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="create-event-title"
        aria-modal="true"
        className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="font-sans text-3xl" id="create-event-title">Створи подію</h2>
          <Button aria-label="Закрити" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        </div>

        <form className="min-w-0 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block space-y-1.5 text-sm font-medium">
            <div className="space-y-1.5 text-sm font-medium">
              <span className="block">Обкладинка події (опціонально)</span>
              {coverPreview ? (
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border">
                  <img src={coverPreview} alt="Прев'ю обкладинки" className="size-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-3 top-3 size-8 rounded-full shadow-md"
                    onClick={handleRemoveCover}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-4 transition hover:bg-muted/60">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ImagePlus className="size-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">Завантажити фотографію</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP do 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <span className="block">Назва події</span>
            <Input
              autoFocus
              className={formInputClass}
              maxLength={100}
              name="title"
              placeholder="Наприклад, вечір настільних ігор"
              required
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium">
            <span className="block">Опис</span>
            <textarea
              className={`${fieldClass} h-24 resize-y py-2`}
              maxLength={2000}
              name="description"
              placeholder="Розкажи, що плануєте робити"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 text-sm font-medium">
              <span className="block">Категорія</span>
              <Select onValueChange={(value) => setCategoryId(value ?? "")} value={categoryId || "Оберіть категорію"}>
                <SelectTrigger aria-label="Категорія події" className="h-10 w-full rounded-xl border-border bg-background data-[size=default]:h-10">
                  <SelectValue placeholder="Оберіть категорію">
                    {(() => {
                      const selected = categories.find((c) => String(c.id) === categoryId)
                      return selected ? (getLabel(EVENT_CATEGORY_OPTIONS, selected.name) ?? selected.name) : null
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {getLabel(EVENT_CATEGORY_OPTIONS, category.name) ?? category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="block space-y-1.5 text-sm font-medium">
              <span className="block">Місто</span>
              <Input
                className={formInputClass}
                maxLength={100}
                name="city"
                placeholder="Наприклад, Київ"
                required
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-medium">
            <span className="block">Місце зустрічі</span>
            <Input className={formInputClass} maxLength={200} name="placeName" placeholder="Кав'ярня, парк…" />
          </label>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5 text-sm font-medium">
              <span className="block">Початок</span>
              <div className="min-w-0 space-y-2">
                <DatePicker
                  disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                  label="Дата початку"
                  onChange={setStartsAtDate}
                  value={startsAtDate}
                />
                <label className="block space-y-1.5 text-sm font-normal text-muted-foreground">
                  Час початку
                  <TimePicker
                    label="Час початку"
                    onChange={setStartsAtTime}
                    value={startsAtTime}
                  />
                </label>
              </div>
            </div>
            <div className="min-w-0 space-y-1.5 text-sm font-medium">
              <span className="block">Завершення</span>
              <div className="min-w-0 space-y-2">
                <DatePicker
                  disabled={{ before: startsAtDate ?? new Date(new Date().setHours(0, 0, 0, 0)) }}
                  label="Дата завершення"
                  onChange={setEndsAtDate}
                  value={endsAtDate}
                />
                <label className="block space-y-1.5 text-sm font-normal text-muted-foreground">
                  Час завершення
                  <TimePicker
                    label="Час завершення"
                    onChange={setEndsAtTime}
                    value={endsAtTime}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium">
              <span className="block">Кількість місць</span>
              <Input className={formInputClass} max={500} min={2} name="capacity" placeholder="Без обмежень" type="number" />
            </label>
            <div className="space-y-1.5 text-sm font-medium">
              <span className="block">Запис на подію</span>
              <Select onValueChange={(value) => setJoinPolicy(value as EventJoinPolicy)} value={joinPolicy}>
                <SelectTrigger aria-label="Запис на подію" className="h-10 w-full rounded-xl border-border bg-background data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Вільний</SelectItem>
                  <SelectItem value="ApprovalRequired">За підтвердженням</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">Скасувати</Button>
            <Button disabled={isSaving} type="submit">{isSaving ? "Створюємо…" : "Створити подію"}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function EventDetailsDialog({
  event,
  isLoading,
  joinRequests,
  joinRequestsError,
  isLoadingRequests,
  participants,
  participantsError,
  isLoadingParticipants,
  busyRequestProfileId,
  onClose,
  onJoin,
  onLeave,
  onApproveRequest,
  onRejectRequest,
  onRetryRequests,
  onRetryParticipants,
  busy,
}: {
  event: EventDetails | null
  isLoading: boolean
  joinRequests: EventJoinRequest[]
  joinRequestsError: string | null
  isLoadingRequests: boolean
  participants: EventParticipant[]
  participantsError: string | null
  isLoadingParticipants: boolean
  busyRequestProfileId: string | null
  onClose: () => void
  onJoin: (event: EventCard) => void
  onLeave: (event: EventCard) => void
  onApproveRequest: (request: EventJoinRequest) => void
  onRejectRequest: (request: EventJoinRequest) => void
  onRetryRequests: () => void
  onRetryParticipants: () => void
  busy: boolean
}) {
  const navigate = useNavigate();
  if (!event && !isLoading) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <section
        aria-labelledby="event-details-title"
        aria-modal="true"
        className="no-scrollbar my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        role="dialog"
      >
        {isLoading || !event ? (
          <div className="p-8 text-center text-muted-foreground">Завантажуємо деталі події…</div>
        ) : (
          <>
            {event.coverUrl ? (
              <img alt="" className="h-56 w-full object-cover" src={event.coverUrl} />
            ) : (
              <div className="h-48 w-full">
                <EventCategoryCover category={event.category} />
              </div>
            )}
            <div className="space-y-5 p-6 sm:p-8">
              <div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {getLabel(EVENT_CATEGORY_OPTIONS, event.category.name) ?? event.category.name}
                </span>
                <h2 className="mt-3 font-heading text-3xl" id="event-details-title">
                  {event.title}
                </h2>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Організатор:</span>

                  {/* Клікабельний блок з аватаркою та ім'ям */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="group flex items-center gap-2 cursor-pointer outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetId = event.organizer.profileId ?? event.organizer.profileId;
                      if (targetId) navigate(`/profile/${targetId}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        const targetId = event.organizer.profileId ?? event.organizer.profileId;
                        if (targetId) navigate(`/profile/${targetId}`);
                      }
                    }}
                  >
                    <Avatar className="size-7 transition-transform group-hover:scale-105">
                      <AvatarImage
                        src={event.organizer.mainPhotoUrl ?? event.organizer.mainPhotoUrl ?? undefined}
                        alt={event.organizer.displayName}
                      />
                      <AvatarFallback className="text-[10px] font-semibold">
                        {event.organizer.displayName
                          ? event.organizer.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-sm font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors group-hover:text-primary">
                      {event.organizer.displayName || "Організатор"}
                    </span>
                  </div>
                </div>
              </div>

              {event.description && <p className="whitespace-pre-wrap text-sm leading-6">{event.description}</p>}
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{formatDate(event.startsAt)}</p>
                <p className="flex items-center gap-2"><Clock3 className="size-4 text-primary" />{formatTime(event.startsAt)}{event.endsAt ? ` — ${formatTime(event.endsAt)}` : ""}</p>
                <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{event.city}{event.placeName ? ` · ${event.placeName}` : ""}</p>
                <p className="flex items-center gap-2"><Users className="size-4 text-primary" />{event.participantsCount}{event.capacity ? ` з ${event.capacity}` : ""} учасників</p>
              </div>
              {(event.isOrganizer || event.myStatus === "Approved") && (
                <section aria-labelledby="event-participants-title" className="space-y-3 border-t border-border pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-heading text-xl" id="event-participants-title">Учасники</h3>
                    <Badge variant="secondary">{participants.length}</Badge>
                  </div>
                  {isLoadingParticipants ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Завантажуємо учасників…</p>
                  ) : participantsError ? (
                    <div className="space-y-3 rounded-2xl bg-muted/50 px-4 py-5 text-center">
                      <p className="text-sm text-destructive">{participantsError}</p>
                      <Button onClick={onRetryParticipants} size="sm" variant="outline">Спробувати ще</Button>
                    </div>
                  ) : participants.length === 0 ? (
                    <p className="rounded-2xl bg-muted/50 px-4 py-5 text-center text-sm text-muted-foreground">
                      Підтверджених учасників поки немає.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <Card className="rounded-2xl py-3 shadow-none" key={participant.profileId}>
                          <CardContent className="px-3">
                            <Link className="flex items-center gap-3" to={`/profile/${participant.profileId}`}>
                              <Avatar className="size-11">
                                <AvatarImage alt={participant.displayName} src={participant.mainPhotoUrl ?? undefined} />
                                <AvatarFallback>{participant.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {participant.displayName}{participant.age ? `, ${participant.age}` : ""}
                                </p>
                                {participant.role === "Organizer" && (
                                  <p className="text-xs text-muted-foreground">Організатор</p>
                                )}
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )}
              {event.isOrganizer && (
                <section aria-labelledby="event-requests-title" className="space-y-3 border-t border-border pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-heading text-xl" id="event-requests-title">Заявки на участь</h3>
                    {(event.pendingCount ?? joinRequests.length) > 0 && (
                      <Badge variant="secondary">{event.pendingCount ?? joinRequests.length}</Badge>
                    )}
                  </div>
                  {isLoadingRequests ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Завантажуємо заявки…</p>
                  ) : joinRequestsError ? (
                    <div className="space-y-3 rounded-2xl bg-muted/50 px-4 py-5 text-center">
                      <p className="text-sm text-destructive">{joinRequestsError}</p>
                      <Button onClick={onRetryRequests} size="sm" variant="outline">Спробувати ще</Button>
                    </div>
                  ) : joinRequests.length === 0 ? (
                    <p className="rounded-2xl bg-muted/50 px-4 py-5 text-center text-sm text-muted-foreground">
                      Нових заявок поки немає.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {joinRequests.map((request) => (
                        <Card className="gap-3 rounded-2xl py-3 shadow-none" key={request.profileId}>
                          <CardContent className="flex flex-col gap-3 px-3 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <Avatar className="size-11">
                                <AvatarImage alt={request.displayName} src={request.mainPhotoUrl ?? undefined} />
                                <AvatarFallback>{request.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {request.displayName}{request.age ? `, ${request.age}` : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Заявка · {new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(new Date(request.requestedAt))}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:shrink-0">
                              <Button
                                disabled={busyRequestProfileId !== null}
                                onClick={() => onApproveRequest(request)}
                                size="sm"
                              >
                                {busyRequestProfileId === request.profileId ? "…" : "Прийняти"}
                              </Button>
                              <Button
                                disabled={busyRequestProfileId !== null}
                                onClick={() => onRejectRequest(request)}
                                size="sm"
                                variant="outline"
                              >
                                Відхилити
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )}
              <div className="flex flex-wrap justify-end gap-3">
                <Button onClick={onClose} variant="outline">Закрити</Button>
                {!event.isOrganizer && event.myStatus === null && (
                  <Button disabled={busy} onClick={() => onJoin(event)}>{busy ? "Зачекайте…" : "Долучитися"}</Button>
                )}
                {!event.isOrganizer && (event.myStatus === "Pending" || event.myStatus === "Approved") && (
                  <Button disabled={busy} onClick={() => onLeave(event)} variant="outline">{busy ? "Зачекайте…" : "Відмовитися від участі"}</Button>
                )}
                {event.myStatus === "Pending" && <p className="w-full text-right text-xs text-muted-foreground">Заявка очікує підтвердження організатора.</p>}
                {event.myStatus === "Rejected" && <p className="w-full text-right text-xs text-muted-foreground">Організатор відхилив заявку на участь.</p>}
                {event.isOrganizer && <p className="w-full text-right text-xs text-muted-foreground">Ви організатор цієї події.</p>}
              </div>
            </div>
          </>
        )}
      </section>
    </div >
  )
}

function EventCardView({
  event,
  onOpen,
  now,
}: {
  event: EventCard
  onOpen: (id: string) => void
  now: Date
}) {
  const isFull = event.capacity !== null && event.participantsCount >= event.capacity

  return (
    <article
      aria-label={`Відкрити деталі події «${event.title}»`}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => onOpen(event.id)}
      onKeyDown={(keyEvent) => {
        if (keyEvent.target !== keyEvent.currentTarget) return
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault()
          onOpen(event.id)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative block h-52 w-full overflow-hidden text-left">
        {event.coverUrl ? (
          <img
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={event.coverUrl}
          />
        ) : (
          <EventCategoryCover category={event.category} />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          {getLabel(EVENT_CATEGORY_OPTIONS, event.category.name) ?? event.category.name}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-1 text-left font-heading text-2xl transition group-hover:text-primary">
            {event.title}
          </h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <span>{formatCardDate(event.startsAt)} · {formatTime(event.startsAt)}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {formatTimeUntil(event.startsAt, now)}
            </span>
          </p>
          <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" />{event.city}{event.placeName ? ` · ${event.placeName}` : ""}</p>
          <p className="flex items-center gap-2"><Users className="size-4 shrink-0 text-primary" />{event.participantsCount}{event.capacity ? ` з ${event.capacity}` : ""} учасників</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            {event.isOrganizer ? "Ваша подія" :
              event.myStatus === "Pending" ? "Очікує підтвердження" :
                event.myStatus === "Approved" ? "Ви долучилися" :
                  event.myStatus === "Rejected" ? "Заявку відхилено" :
                    isFull && event.joinPolicy === "Open" ? "Місць немає" :
                      event.joinPolicy === "Open" ? "Вільний запис" : "За підтвердженням"}
          </span>
          <Button onClick={(clickEvent) => {
            clickEvent.stopPropagation()
            onOpen(event.id)
          }} size="sm" variant="outline">Деталі</Button>
        </div>
      </div>
    </article>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventCard[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [filters, setFilters] = useState<EventFilters>(emptyFilters)
  const [dateRange, setDateRange] = useState<DateRange>()
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [busyEventId, setBusyEventId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null)
  const [joinRequests, setJoinRequests] = useState<EventJoinRequest[]>([])
  const [joinRequestsError, setJoinRequestsError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [participantsError, setParticipantsError] = useState<string | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [isDetailsBusy, setIsDetailsBusy] = useState(false)
  const [busyRequestProfileId, setBusyRequestProfileId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [now, setNow] = useState(() => new Date())
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")
  const [myEvents, setMyEvents] = useState<EventCard[]>([])
  const [isLoadingMyEvents, setIsLoadingMyEvents] = useState(false)
  const [myFilter, setMyFilter] = useState<"all" | "organizer" | "member">("all")

  const loadMyEvents = useCallback(async () => {
    setIsLoadingMyEvents(true)
    try {
      const items = await getMyEvents()
      setMyEvents(items)
    } catch (error) {
      toast.add({
        type: "error",
        title: "Не вдалося завантажити ваші події",
        description: getApiErrorMessage(error, "Спробуйте оновити сторінку."),
      })
    } finally {
      setIsLoadingMyEvents(false)
    }
  }, [])

  const loadEvents = useCallback(async (nextFilters: EventFilters, nextPage: number, append = false) => {
    if (append) setIsLoadingMore(true)
    else setIsLoading(true)
    try {
      const result = await getEvents(nextFilters, nextPage)
      setEvents((current) => append ? [...current, ...result.items] : result.items)
      setHasMore(result.hasMore)
      setPage(nextPage)
    } catch (error) {
      toast.add({
        type: "error",
        title: "Не вдалося завантажити події",
        description: getApiErrorMessage(error, "Спробуйте оновити сторінку."),
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getEvents(emptyFilters, 1)
      .then((result) => {
        if (!isMounted) return
        setEvents(result.items)
        setHasMore(result.hasMore)
        setPage(1)
      })
      .catch((error: unknown) => {
        if (isMounted) {
          toast.add({
            type: "error",
            title: "Не вдалося завантажити події",
            description: getApiErrorMessage(error, "Спробуйте оновити сторінку."),
          })
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    getEventCategories()
      .then((items) => { if (isMounted) setCategories(items) })
      .catch((error: unknown) => {
        if (isMounted) {
          toast.add({
            type: "error",
            title: "Не вдалося завантажити категорії",
            description: getApiErrorMessage(error, "Спробуйте оновити сторінку."),
          })
        }
      })
    getMyEvents()
      .then((items) => {
        if (isMounted) setMyEvents(items)
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFilters = {
      ...filters,
      categoryId: filters.categoryId === "all" ? "" : filters.categoryId,
      from: dateRange?.from ? toLocalDayStart(dateRange.from) : "",
      to: dateRange?.to ? toLocalDayEnd(dateRange.to) : "",
    }
    setFilters(nextFilters)
    await loadEvents(nextFilters, 1)
  }

  async function loadJoinRequests(eventId: string) {
    setIsLoadingRequests(true)
    setJoinRequestsError(null)
    try {
      setJoinRequests(await getEventJoinRequests(eventId))
    } catch (error) {
      const message = getApiErrorMessage(error, "Спробуйте завантажити заявки ще раз.")
      setJoinRequestsError(message)
      toast.add({
        type: "error",
        title: "Не вдалося завантажити заявки",
        description: message,
      })
    } finally {
      setIsLoadingRequests(false)
    }
  }

  async function loadParticipants(eventId: string) {
    setIsLoadingParticipants(true)
    setParticipantsError(null)
    try {
      setParticipants(await getEventParticipants(eventId))
    } catch (error) {
      setParticipantsError(getApiErrorMessage(error, "Спробуйте завантажити список учасників ще раз."))
    } finally {
      setIsLoadingParticipants(false)
    }
  }

  async function handleOpenEvent(id: string) {
    setSelectedEvent(null)
    setJoinRequests([])
    setJoinRequestsError(null)
    setParticipants([])
    setParticipantsError(null)
    setIsLoadingDetails(true)
    try {
      const details = await getEvent(id)
      setSelectedEvent(details)

      await Promise.all([
        details.isOrganizer ? loadJoinRequests(id) : Promise.resolve(),
        details.isOrganizer || details.myStatus === "Approved" ? loadParticipants(id) : Promise.resolve(),
      ])
    } catch (error) {
      toast.add({
        type: "error",
        title: "Не вдалося завантажити подію",
        description: getApiErrorMessage(error, "Спробуйте ще раз."),
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  async function handleRequestDecision(request: EventJoinRequest, action: "approve" | "reject") {
    if (!selectedEvent) return

    const eventId = selectedEvent.id
    setBusyRequestProfileId(request.profileId)
    try {
      if (action === "approve") await approveEventJoinRequest(eventId, request.profileId)
      else await rejectEventJoinRequest(eventId, request.profileId)

      setJoinRequests((current) => current.filter((item) => item.profileId !== request.profileId))
      setSelectedEvent((current) => current && current.id === eventId
        ? {
          ...current,
          participantsCount: current.participantsCount + (action === "approve" ? 1 : 0),
          pendingCount: Math.max(0, (current.pendingCount ?? 1) - 1),
        }
        : current)
      toast.add({
        type: "success",
        title: action === "approve" ? "Учасника прийнято" : "Заявку відхилено",
      })
      await Promise.all([loadEvents(filters, page), loadMyEvents()])

      try {
        setSelectedEvent(await getEvent(eventId))
      } catch (error) {
        toast.add({
          type: "error",
          title: "Не вдалося оновити деталі події",
          description: getApiErrorMessage(error, "Закрийте й відкрийте деталі події знову."),
        })
      }
      await loadJoinRequests(eventId)
      await loadParticipants(eventId)
    } catch (error) {
      toast.add({
        type: "error",
        title: action === "approve" ? "Не вдалося прийняти учасника" : "Не вдалося відхилити заявку",
        description: getApiErrorMessage(error, "Перевірте наявність місць і спробуйте ще раз."),
      })
    } finally {
      setBusyRequestProfileId(null)
    }
  }

  async function handleParticipation(event: EventCard, action: "join" | "leave") {
    setBusyEventId(event.id)
    setIsDetailsBusy(true)
    try {
      if (action === "join") await joinEvent(event.id)
      else await leaveEvent(event.id)
      toast.add({ type: "success", title: action === "join" ? "Заявку надіслано" : "Участь скасовано" })
      await Promise.all([loadEvents(filters, page), loadMyEvents()])
      if (selectedEvent?.id === event.id) setSelectedEvent(await getEvent(event.id))
    } catch (error) {
      toast.add({
        type: "error",
        title: action === "join" ? "Не вдалося долучитися" : "Не вдалося скасувати участь",
        description: getApiErrorMessage(error, "Спробуйте ще раз."),
      })
    } finally {
      setBusyEventId(null)
      setIsDetailsBusy(false)
    }
  }

  async function handleCreated(event: EventDetails) {
    setIsCreating(false)
    await Promise.all([loadEvents(filters, 1), loadMyEvents()])
    setSelectedEvent(event)
  }

  const filteredMyEvents = myEvents.filter((event) => {
    if (myFilter === "organizer") return event.isOrganizer
    if (myFilter === "member") return !event.isOrganizer
    return true
  })

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-primary/[0.045] via-background to-background">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            const nextTab = val as "all" | "my"
            setActiveTab(nextTab)
            if (nextTab === "my") {
              void loadMyEvents()
            }
          }}
          className="space-y-8"
        >
          {/* Top Navigation & Action Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="inline-flex h-12 sm:h-[52px] items-center gap-2 rounded-2xl sm:rounded-full border border-border/80 bg-card/80 p-1.5 shadow-xs backdrop-blur-md">
              <TabsTrigger
                value="all"
                className="h-full flex items-center gap-2.5 rounded-xl sm:rounded-full px-6 py-2.5 text-sm sm:text-base font-semibold transition-all data-active:bg-primary! data-active:text-primary-foreground! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-md"
              >
                <Compass className="size-5" />
                <span>Усі події</span>
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="h-full flex items-center gap-2.5 rounded-xl sm:rounded-full px-6 py-2.5 text-sm sm:text-base font-semibold transition-all data-active:bg-primary! data-active:text-primary-foreground! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-md"
              >
                <CalendarCheck className="size-5" />
                <span>Мої події</span>
                {myEvents.length > 0 && (
                  <span
                    className={cn(
                      "ml-2 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold transition-colors",
                      activeTab === "my"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {myEvents.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <Button className="h-12 sm:h-[52px] rounded-full px-6 text-sm sm:text-base font-semibold shadow-sm" onClick={() => setIsCreating(true)}>
              <Plus className="size-5" /> Створити подію
            </Button>
          </div>

          <TabsContent value="all" className="space-y-8 outline-none">
            <section className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-9">
              <div className="pointer-events-none absolute -right-12 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative max-w-2xl">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
                  <CalendarDays className="size-4" />
                  ЗУСТРІЧАЙТЕСЯ НАЖИВО
                </p>
                <h1 className="font-heading text-4xl leading-tight sm:text-5xl">Події, що зближують</h1>
                <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Знайди компанію для нових вражень або створи власну зустріч.
                </p>
              </div>
            </section>
            <form className="grid gap-3 rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:grid-cols-[1.3fr_0.8fr_1.2fr_1.5fr_auto]" onSubmit={(event) => void handleFilterSubmit(event)}>
          <label className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Пошук подій"
              className="h-10 rounded-xl pl-9"
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Назва події"
              value={filters.search}
            />
          </label>
          <Input
            aria-label="Місто"
            className="h-10 rounded-xl"
            onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
            placeholder="Місто"
            value={filters.city}
          />
          <Select
            onValueChange={(value) => setFilters((current) => ({ ...current, categoryId: value ?? "" }))}
            value={filters.categoryId || "all"}
          >
            <SelectTrigger aria-label="Категорія" className="h-10 w-full rounded-xl border-border bg-background data-[size=default]:h-10">
              <SelectValue placeholder="Усі категорії">
                {(() => {
                  if (!filters.categoryId || filters.categoryId === "all") return "Усі категорії"
                  const selected = categories.find((c) => String(c.id) === filters.categoryId)
                  return selected ? (getLabel(EVENT_CATEGORY_OPTIONS, selected.name) ?? selected.name) : null
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі категорії</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {getLabel(EVENT_CATEGORY_OPTIONS, category.name) ?? category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker
            onChange={setDateRange}
            value={dateRange}
          />
          <Button className="h-10 rounded-xl px-5" type="submit"><Search /> Знайти</Button>
        </form>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="h-[25rem] animate-pulse rounded-3xl border border-border bg-card/70" key={index} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CalendarDays /></div>
            <h2 className="font-heading text-2xl">Поки немає подій</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Зміни фільтри або створи подію — нехай перша зустріч почнеться з тебе.</p>
            <Button className="mt-5 rounded-full" onClick={() => setIsCreating(true)}><Plus /> Створити подію</Button>
          </section>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-2xl">Найближчі зустрічі</h2>
              <span className="text-sm text-muted-foreground">{events.length} подій</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => <EventCardView event={event} key={event.id} now={now} onOpen={(id) => void handleOpenEvent(id)} />)}
            </div>
            {hasMore && (
              <div className="mt-9 flex justify-center">
                <Button disabled={isLoadingMore} onClick={() => void loadEvents(filters, page + 1, true)} variant="outline">
                  {isLoadingMore ? "Завантажуємо…" : "Показати ще"}
                </Button>
              </div>
            )}
          </>
        )}
          </TabsContent>

          <TabsContent value="my" className="space-y-8 outline-none">
            {isLoadingMyEvents ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="h-[25rem] animate-pulse rounded-3xl border border-border bg-card/70" key={index} />
                ))}
              </div>
            ) : myEvents.length === 0 ? (
              <section className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays />
                </div>
                <h2 className="font-heading text-2xl">У вас поки немає подій</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Ви ще не створили жодної події та не приєдналися до інших зустрічей.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Button variant="outline" className="rounded-full" onClick={() => setActiveTab("all")}>
                    Знайти подію
                  </Button>
                  <Button className="rounded-full" onClick={() => setIsCreating(true)}>
                    <Plus /> Створити подію
                  </Button>
                </div>
              </section>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={myFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setMyFilter("all")}
                    >
                      Усі ({myEvents.length})
                    </Button>
                    <Button
                      variant={myFilter === "organizer" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setMyFilter("organizer")}
                    >
                      Організовані мною ({myEvents.filter((e) => e.isOrganizer).length})
                    </Button>
                    <Button
                      variant={myFilter === "member" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setMyFilter("member")}
                    >
                      Я беру участь ({myEvents.filter((e) => !e.isOrganizer).length})
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">{filteredMyEvents.length} подій</span>
                </div>

                {filteredMyEvents.length === 0 ? (
                  <section className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {myFilter === "organizer"
                        ? "Ви ще не створили жодної події."
                        : "Ви ще не приєдналися до жодної події як учасник."}
                    </p>
                  </section>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMyEvents.map((event) => (
                      <EventCardView event={event} key={event.id} now={now} onOpen={(id) => void handleOpenEvent(id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {isCreating && <EventForm categories={categories} onClose={() => setIsCreating(false)} onCreated={(event) => void handleCreated(event)} />}
      {(selectedEvent || isLoadingDetails) && (
        <EventDetailsDialog
          busy={isDetailsBusy || busyEventId === selectedEvent?.id}
          event={selectedEvent}
          isLoading={isLoadingDetails}
          isLoadingRequests={isLoadingRequests}
          participants={participants}
          participantsError={participantsError}
          isLoadingParticipants={isLoadingParticipants}
          joinRequests={joinRequests}
          joinRequestsError={joinRequestsError}
          busyRequestProfileId={busyRequestProfileId}
          onClose={() => { setSelectedEvent(null); setIsLoadingDetails(false) }}
          onJoin={(event) => void handleParticipation(event, "join")}
          onLeave={(event) => void handleParticipation(event, "leave")}
          onApproveRequest={(request) => void handleRequestDecision(request, "approve")}
          onRejectRequest={(request) => void handleRequestDecision(request, "reject")}
          onRetryRequests={() => {
            if (selectedEvent) void loadJoinRequests(selectedEvent.id)
          }}
          onRetryParticipants={() => {
            if (selectedEvent) void loadParticipants(selectedEvent.id)
          }}
        />
      )}
    </div>
  )
}
