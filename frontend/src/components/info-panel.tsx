import React, { useRef } from "react";
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

export const InfoPanel: React.FC<ProfileDetailsProps> = ({
    displayName,
    age,
    bio,
    idealSaturday,
    lookingFor,
    compatibilityPercent,
    distanceKm,
    lastActive,
}) => {

    // Прокрутка 
    const viewportRef = useRef<HTMLDivElement>(null)
    return (
        <ScrollArea viewportRef={viewportRef} className="w-80 h-full bg-[#FFF8F2] border-r border-[#E8D9CD] flex flex-col justify-between p-6 font-sans select-none overflow-y-auto">
            {/* Верхня частина з анкетою */}
            <div className="space-y-4">
                {/* Заголовок блоку та ім'я */}
                <div>
                    <span className="text-[#8D827A] font-semibold text-xs tracking-wider uppercase">
                        Про анкету
                    </span>
                    <h1 className="text-2xl font-black text-[#1E1E1E] mt-1 tracking-tight">
                        {displayName} &nbsp;{age}
                    </h1>
                </div>

                <div className="h-[1px] bg-[#F2DDD0] w-full" />

                {/* Біографія */}
                <p className="text-[#3D2C24] text-xs leading-relaxed">
                    {bio}
                </p>

                {/* Секція: Ідеальна субота */}
                {idealSaturday && (
                    <>
                        <div className="h-[1px] bg-[#F2DDD0] w-full" />
                        <div>
                            <h2 className="text-[#3D2C24] font-bold text-xs uppercase tracking-wider mb-1">
                                Ідеальна субота
                            </h2>
                            <p className="text-[#3D2C24] text-xs leading-relaxed">
                                {idealSaturday}
                            </p>
                        </div>
                    </>
                )}

                {/* Секція: Шукаю */}
                {lookingFor && (
                    <>
                        <div className="h-[1px] bg-[#F2DDD0] w-full" />
                        <div>
                            <h2 className="text-[#3D2C24] font-bold text-xs uppercase tracking-wider mb-1">
                                Шукаю
                            </h2>
                            <p className="text-[#3D2C24] text-xs leading-relaxed">
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
                    <div className="text-xs font-bold text-[#3D2C24] mb-1.5">
                        Ви сумісні на&nbsp; {compatibilityPercent}%
                    </div>
                    {/* Прогрес-бар */}
                    <div className="w-full h-2 bg-[#7E8B93] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#E55039] rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(Math.max(compatibilityPercent, 0), 100)}%` }}
                        />
                    </div>
                </div>

                <div className="h-[1px] bg-[#F2DDD0] w-full" />

                {/* Відстань та статус онлайну */}
                <div className="text-[11px] font-semibold text-[#5A4D45]">
                    {distanceKm} км від вас : {lastActive}
                </div>
            </div>
        </ScrollArea>
    );
};