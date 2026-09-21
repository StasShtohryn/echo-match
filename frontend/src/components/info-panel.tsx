import type { FC } from "react";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

export interface ProfileDetailsProps {
    displayName: string;
    age: number;
    bio: string;
    idealSaturday?: string;
    lookingFor?: string;
    compatibilityPercent: number; // наприклад, 55
    distanceKm: number;
    lastActive: string; // наприклад, "онлайн 2 години тому"
}

export const InfoPanel: FC<ProfileDetailsProps> = ({
    displayName,
    age,
    bio,
    idealSaturday,
    lookingFor,
    compatibilityPercent,
    distanceKm,
    lastActive,
}) => {
    return (
        <ScrollArea className="flex h-full w-80 shrink-0 flex-col justify-between border-l border-border/80 bg-card/55 p-6 font-sans select-none">
            {/* Верхня частина з анкетою */}
            <div className="space-y-4">
                {/* Заголовок блоку та ім'я */}
                <div>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Про анкету
                    </span>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                        {displayName} &nbsp;{age}
                    </h1>
                </div>

                <Separator />

                {/* Біографія */}
                <p className="text-xs leading-relaxed text-foreground">
                    {bio}
                </p>

                {/* Секція: Ідеальна субота */}
                {idealSaturday && (
                    <>
                        <Separator />
                        <div>
                            <h2 className="mb-1 text-xs font-bold tracking-wider text-foreground uppercase">
                                Ідеальна субота
                            </h2>
                            <p className="text-xs leading-relaxed text-muted-foreground">
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
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {lookingFor}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Нижня частина: Сумісність та дистанція */}
            <div className="pt-6 space-y-3">
                {/* Відсоток сумісності */}
                <div>
                    <div className="mb-1.5 text-xs font-bold text-foreground">
                        Ви сумісні на&nbsp; {compatibilityPercent}%
                    </div>
                    {/* Прогрес-бар */}
                    <div
                        className="h-2 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Відсоток сумісності"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(Math.max(compatibilityPercent, 0), 100)}
                    >
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${Math.min(Math.max(compatibilityPercent, 0), 100)}%` }}
                        />
                    </div>
                </div>

                <Separator />

                {/* Відстань та статус онлайну */}
                <div className="text-[11px] font-semibold text-muted-foreground">
                    {distanceKm} км від вас : {lastActive}
                </div>
            </div>
        </ScrollArea>
    );
};