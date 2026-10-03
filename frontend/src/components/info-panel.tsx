import type { FC } from "react";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";

export interface ProfileDetailsProps {
    displayName: string;
    age: number;
    bio: string | null;
    idealSaturday?: string;
    lookingFor?: string;
    distanceKm: number | null;
    compatibilityPercent: number | null;
}

export const InfoPanel: FC<ProfileDetailsProps> = ({
    displayName,
    age,
    bio,
    idealSaturday,
    lookingFor,
    distanceKm,
    compatibilityPercent,
}) => {
    return (
        <ScrollArea className="flex h-full w-80 shrink-0 flex-col justify-between border-l border-border/80 bg-card/55 p-6 font-sans select-none">
            <div className="space-y-4">
                <div>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Про анкету
                    </span>
                    <h1 className="font-heading mt-1 text-2xl tracking-tight text-foreground">
                        {displayName}, {age}
                    </h1>
                </div>

                <Separator />

                <p className="text-xs leading-relaxed text-foreground">
                    {bio ?? "Користувач ще не додав опис профілю."}
                </p>

                {compatibilityPercent !== null && (
                    <>
                        <Separator />
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="text-xs font-bold tracking-wider text-foreground uppercase">
                                    Сумісність
                                </h2>
                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                    {compatibilityPercent}%
                                </span>
                            </div>
                            <Progress
                                value={Math.min(100, Math.max(0, compatibilityPercent))}
                                aria-label="Сумісність"
                                className="gap-0"
                            />
                        </div>
                    </>
                )}

                {/* Секція: Ідеальна субота */}
                {idealSaturday && (
                    <>
                        <Separator />
                        <div>
                            <h2 className="mb-1 text-xs font-bold tracking-wider text-foreground uppercase">
                                Ідеальна субота
                            </h2>
                            <p className="font-[family-name:var(--font3)] text-xs leading-relaxed text-muted-foreground">
                                {idealSaturday}
                            </p>
                        </div>
                    </>
                )}

                {/* Секція: Шукаю */}
                {lookingFor && (
                    <>
                        <Separator />
                        <div>
                            <h2 className="mb-1 text-xs font-bold tracking-wider text-foreground uppercase">
                                Шукаю
                            </h2>
                            <p className="font-[family-name:var(--font3)] text-xs leading-relaxed text-muted-foreground">
                                {lookingFor}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Нижня частина: дистанція */}
            <div className="pt-6 space-y-3">
                <Separator />

                <div className="text-[11px] font-semibold text-muted-foreground">
                    {distanceKm === null ? "Відстань не вказана" : `${distanceKm} км від вас`}
                </div>
            </div>
        </ScrollArea>
    );
};