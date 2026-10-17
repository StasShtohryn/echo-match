import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function TimePicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (value: string) => void
  label: string
}) {
  const [hour, minute] = value ? value.split(":") : ["", ""]

  function updateTime(nextHour: string, nextMinute: string) {
    onChange(`${nextHour || "00"}:${nextMinute || "00"}`)
  }

  return (
    <div aria-label={label} className="flex min-w-0 gap-2" role="group">
      <Select onValueChange={(nextHour) => updateTime(nextHour ?? "", minute)} value={hour || null}>
        <SelectTrigger aria-label={`${label}: година`} className="h-10 min-w-0 flex-1 rounded-xl border-border bg-background data-[size=default]:h-10">
          <SelectValue placeholder="Год" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, index) => {
            const option = String(index).padStart(2, "0")
            return <SelectItem key={option} value={option}>{option}</SelectItem>
          })}
        </SelectContent>
      </Select>
      <span aria-hidden="true" className="self-center">:</span>
      <Select onValueChange={(nextMinute) => updateTime(hour, nextMinute ?? "")} value={minute || null}>
        <SelectTrigger aria-label={`${label}: хвилини`} className="h-10 min-w-0 flex-1 rounded-xl border-border bg-background data-[size=default]:h-10">
          <SelectValue placeholder="Хв" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, index) => {
            const option = String(index).padStart(2, "0")
            return <SelectItem key={option} value={option}>{option}</SelectItem>
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export { TimePicker }
