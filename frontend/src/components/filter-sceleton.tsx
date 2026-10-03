import { Skeleton } from "@/components/ui/skeleton"

export function FilterSkeleton() {
    return (
        <div className="w-full space-y-4" aria-hidden="true">
            <div className="space-y-3">
                <Skeleton className="h-3 w-12 rounded bg-muted-foreground/20" />
                <div className="flex items-center justify-between px-1">
                    <Skeleton className="h-9 w-20 rounded-xl bg-muted" />
                    <Skeleton className="h-9 w-20 rounded-xl bg-muted" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-muted-foreground/20" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded bg-muted-foreground/20" />
                <Skeleton className="h-9 w-full rounded-xl bg-muted" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-3 w-36 rounded bg-muted-foreground/20" />
                <div className="flex items-center gap-2">
                    <Skeleton className="size-5 rounded-md bg-muted" />
                    <Skeleton className="h-4 w-40 rounded bg-muted-foreground/20" />
                </div>
                <div className="relative flex h-11 items-center justify-between rounded-2xl border border-border bg-background/50 px-2">
                    <Skeleton className="size-7 rounded-xl bg-muted" />
                    <Skeleton className="h-4 w-8 rounded bg-muted-foreground/20" />
                    <Skeleton className="size-7 rounded-xl bg-muted" />
                </div>
            </div>

            <Skeleton className="h-8 w-full rounded-2xl bg-primary/30" />
        </div>
    )
}