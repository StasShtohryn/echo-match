export const INTERESTED_IN_OPTIONS: Record<string, string> = {
    Men: "Чоловіків",
    Women: "Жінок",
    Everyone: "Усіх",
};


export const ORIENTATION_OPTIONS: Record<string, string> = {
    "Straight": "Гетеросексуал",
    "Gay": "Гомосексуал",
    "Lesbian": "Лесбійка",
    "Bisexual": "Бісексуал",
    "Asexual": "Асексуал",
    "Demisexual": "Демісексуал",
    "Pansexual": "Пансексуал",
    "Queer": "Квір",
    "Questioning": "Не визначений(а)"
};

export const COMMUNICATION_OPTIONS: Record<string, string> = {
    "BigTimeTexter": "Багато переписуюсь",
    "PhoneCaller": "Краще по телефону",
    "VideoChatter": "У відеочаті",
    "BadTexter": "Рідко переписуюсь",
    "BetterInPerson": "Краще зустрітись особисто"
};

export const DRINKING_OPTIONS: Record<string, string> = {
    NotForMe: "Не для мене",
    SoberCurious: "Намагаюся не пити",
    OnSpecialOccasions: "П'ю з особливої нагоди",
    SociallyOnWeekends: "П'ю в компанії на вихідних",
    MostNights: "Майже кожного вечора",
};

export const FAMILY_PLAN_OPTIONS: Record<string, string> = {
    WantChildren: "Хочу мати дітей",
    DontWantChildren: "Не хочу мати дітей",
    HaveChildrenWantMore: "Маю дітей і хочу більше",
    HaveChildrenDontWantMore: "Маю дітей і більше не планую",
    NotSureYet: "Ще не знаю",
};

export const GOAL_OPTIONS: Record<string, string> = {
    LongTermPartner: "Довготривалі стосунки",
    LongTermOpenToShort: "Довготривалі стосунки (чи ні...)",
    ShortTermOpenToLong: "Несерйозні стосунки (чи ні...)",
    ShortTermFun: "Короткотривалий роман",
    NewFriends: "Нових друзів",
    StillFiguringItOut: "Ще точно не знаю",
};

export const WORKOUT_OPTIONS: Record<string, string> = {
    Everyday: "Щодня",
    Often: "Часто",
    Sometimes: "Іноді",
    Never: "Майже ніколи",
};

export const LOVE_STYLE_OPTIONS: Record<string, string> = {
    ThoughtfulGestures: "Турботливі вчинки",
    Presents: "Подарунки",
    Touch: "Обійми та дотики",
    Compliments: "Компліменти",
    TimeTogether: "Якісний спільний час",
};

export const PET_OPTIONS: Record<string, string> = {
    Dog: "Собака",
    Cat: "Кіт",
    Bird: "Птах",
    Fish: "Рибки",
    Reptile: "Рептилія",
    Amphibian: "Амфібія",
    DontHaveButLove: "Не маю, але обожнюю тварин",
    WantAPet: "Хочу завести улюбленця",
    Allergic: "Алергія на тварин",
    NoPets: "Не маю і не планую",
    Other: "Інше",
};

export const SMOKING_OPTIONS: Record<string, string> = {
    NonSmoker: "Не курю",
    SocialSmoker: "Курю в компанії",
    SmokerWhenDrinking: "Під алкоголь",
    Smoker: "Регулярно курю",
    TryingToQuit: "Намагаюся кинути",
};

export const ZODIAC_OPTIONS: Record<string, string> = {
    Aries: "Овен",
    Taurus: "Телець",
    Gemini: "Близнюки",
    Cancer: "Рак",
    Leo: "Лев",
    Virgo: "Діва",
    Libra: "Терези",
    Scorpio: "Скорпіон",
    Sagittarius: "Стрілець",
    Capricorn: "Козоріг",
    Aquarius: "Водолій",
    Pisces: "Риби",
};


export function getLabel(map: Record<string, string>, value?: string | null): string | null {
    if (!value) return null;
    return map[value] ?? value;
}

