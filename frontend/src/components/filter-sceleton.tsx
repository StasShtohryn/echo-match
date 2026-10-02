import { Skeleton } from "@/components/ui/skeleton"

export function FilterSkeleton() {
    return (
        <div className="w-full rounded-3xl border border-[#FFD2B2]/40 bg-[#FAF7F2] p-5 space-y-5">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-lg bg-[#FFD2B2]/40" />
                <Skeleton className="size-4 rounded-md bg-[#FFD2B2]/30" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-5 w-12 rounded bg-[#FFD2B2]/30" />
                <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-11 flex-1 rounded-2xl bg-white border border-[#FFD2B2]/50" />
                    <Skeleton className="h-11 flex-1 rounded-2xl bg-white border border-[#FFD2B2]/50" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-[#FFD2B2]/40" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-3 w-28 rounded bg-[#FFD2B2]/30" />
                <Skeleton className="h-11 w-full rounded-2xl bg-white border border-[#FFD2B2]/50" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-3 w-44 rounded bg-[#FFD2B2]/30" />
                <div className="flex items-center gap-2">
                    <Skeleton className="size-5 rounded-md bg-white border border-[#FFD2B2]/60" />
                    <Skeleton className="h-4 w-40 rounded bg-[#FFD2B2]/30" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl bg-white border border-[#FFD2B2]/60" />
            </div>

            <Skeleton className="h-12 w-full rounded-2xl bg-[#E87A38]/50" />
        </div>
    )
}