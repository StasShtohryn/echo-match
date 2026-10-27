import {
    Dices,
    Dumbbell,
    PartyPopper,
    Palette,
    Compass,
    Coffee,
    GraduationCap,
    Briefcase,
    Sparkles,
    type LucideIcon,
    Music,
} from "lucide-react"

export interface CategoryStyle {
    icon: LucideIcon
    gradient: string
    textColor: string
}

export const EVENT_CATEGORY_STYLES: Record<string, CategoryStyle> = {
    Games: {
        icon: Dices,
        gradient: "from-amber-500/20 via-orange-500/10 to-amber-100/30",
        textColor: "text-amber-600",
    },
    Sport: {
        icon: Dumbbell,
        gradient: "from-emerald-500/20 via-teal-500/10 to-emerald-100/30",
        textColor: "text-emerald-600",
    },
    Party: {
        icon: PartyPopper,
        gradient: "from-pink-500/20 via-purple-500/10 to-pink-100/30",
        textColor: "text-pink-600",
    },
    Music: {
        icon: Music,
        gradient: "from-purple-500/20 via-fuchsia-500/10 to-purple-100/30",
        textColor: "text-purple-600",
    },
    Culture: {
        icon: Palette,
        gradient: "from-violet-500/20 via-indigo-500/10 to-violet-100/30",
        textColor: "text-violet-600",
    },
    Outdoors: {
        icon: Compass,
        gradient: "from-sky-500/20 via-blue-500/10 to-sky-100/30",
        textColor: "text-sky-600",
    },
    Food: {
        icon: Coffee,
        gradient: "from-amber-700/20 via-amber-600/10 to-orange-100/30",
        textColor: "text-amber-700",
    },
    Learning: {
        icon: GraduationCap,
        gradient: "from-blue-500/20 via-cyan-500/10 to-blue-100/30",
        textColor: "text-blue-600",
    },
    Networking: {
        icon: Briefcase,
        gradient: "from-slate-500/20 via-gray-500/10 to-slate-100/30",
        textColor: "text-slate-600",
    },
    Other: {
        icon: Sparkles,
        gradient: "from-primary/20 via-primary/10 to-muted",
        textColor: "text-primary",
    },
}