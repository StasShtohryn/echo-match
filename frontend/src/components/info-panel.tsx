import type { FC } from "react";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

export interface ProfileDetailsProps {
    displayName: string;
    age: number;
    bio: string | null;
    idealSaturday?: string;
    lookingFor?: string;
    distanceKm: number | null;
}

export const InfoPanel: FC<ProfileDetailsProps> = ({
    displayName,
    age,
    bio,
    idealSaturday,
    lookingFor,
    distanceKm,
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
                    {bio ?? "Користувач ще не додав опис профілю."}
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