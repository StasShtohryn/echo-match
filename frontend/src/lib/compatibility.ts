import type { PublicProfile, DiscoveryCandidate, LookupItem } from "@/services/auth-service"
export interface ProfilesComparisonData {
    myProfile: PublicProfile
    candidateProfile: PublicProfile
    distanceKm: number | null
    compatibilityPercent: number
}


// Стать
const WEIGHT_GENDER = 30
export function calculateGenderScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
): number {
    if (!myProfile.gender || !candidateProfile.gender) {
        return 0.0
    }

    if (myProfile.gender === "Other" || candidateProfile.gender === "Other") {
        return 0.0
    }

    return 1.0
}


// Сексуальна орієнтація
const WEIGHT_ORIENTATION = 50
function calculateOrientationScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
): number {
    const a = myProfile.orientation
    const b = candidateProfile.orientation

    // 1. Не визначено (-10) -> 0.0
    if (a === "Questioning" || b === "Questioning") {
        return 0.0;
    }

    // 2. Повний збіг (+10) -> 1.0
    if (a === b) {
        return 1.0;
    }

    // 3. Асексуал з кимось іншим (-3) -> 0.35
    if (a === "Asexual" || b === "Asexual") {
        return 0.35;
    }

    // 4. Демісексуал з кимось (+3) -> 0.65
    if (a === "Demisexual" || b === "Demisexual") {
        return 0.65;
    }

    // 5. Бісексуал або пансексуал з кимось (+5) -> 0.75
    if (a === "Bisexual" || b === "Bisexual" || a === "Pansexual" || b === "Pansexual") {
        return 0.75;
    }

    // Інші комбінації без збігу (0 балів) -> 0.5
    return 0.5;
}


// Кого шукаю?
const WEIGHT_LOOKING_FOR = 50
function calculateLookingForScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const a = myProfile.lookingFor
    const b = candidateProfile.lookingFor

    // 0. Якщо хтось не заповнив це поле
    if (!a || !b) {
        return null
    }

    // 1. Повний збіг намірів (+10) -> 1.0
    if (a === b) {
        return 1.0;
    }

    const pair = [a, b];

    // 2. Довго + несерйозні (-10) -> 0.0
    if (pair.includes("LongTerm") && pair.includes("ShortTermFun")) {
        return 0.0;
    }

    // 3. Довго + коротко (-7) -> 0.15
    if (pair.includes("LongTerm") && pair.includes("ShortTermOpenToLong")) {
        return 0.15;
    }

    // 4. Несерйозні + будь-хто інший (-7) -> 0.15
    if (pair.includes("ShortTermFun")) {
        return 0.15;
    }

    // 5. Будь-які інші комбінації без явного конфлікту (0 балів) -> 0.5
    return 0.5;
}



// Плани на сім'ю
const WEIGHT_FAMILY_PLANS = 50
function calculateFamilyScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {

    const a = myProfile.familyPlans
    const b = candidateProfile.familyPlans

    if (!a || !b) {
        return null
    }

    // 1. Точний збіг (+8) -> 1.0
    if (a === b) {
        return 1.0;
    }

    const pair = [a, b];

    // 2. Хочу + не хочу (-10) -> 0.0
    if (pair.includes("want") && (pair.includes("dont_want") || pair.includes("not_planning"))) {
        return 0.0;
    }

    // 3. Маю і не планую + маю і планую (-5) -> ~0.28
    if (pair.includes("have_and_dont_want") && pair.includes("have_and_want")) {
        return 5 / 18; // ~0.28
    }

    // 4. Позитивні зв'язки (+7) -> ~0.94
    // Хочу + Маю і хочу
    if (pair.includes("want") && pair.includes("have_and_want")) {
        return 17 / 18; // ~0.94
    }

    // Не хочу + не планую
    if (pair.includes("dont_want") && pair.includes("not_planning")) {
        return 17 / 18; // ~0.94
    }

    // 5. Нейтральні комбінації (0 балів) -> ~0.56
    return 10 / 18;
}



// Тварини
const WEIGHT_PETS = 20
export function calculatePetsScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const petA = myProfile.pets
    const petB = candidateProfile.pets

    if (!petA || !petB) {
        return null
    }

    // 1. Конфлікт інтересів: один категорично проти, інший хоче тварин
    const hasConflict =
        (petA === "NotPlanning" && petB === "Want") ||
        (petA === "Want" && petB === "NotPlanning")

    if (hasConflict) {
        return 0.0
    }

    // 2. Обидва свідомо не хочуть/не планують — повна сумісність
    if (petA === "NotPlanning" && petB === "NotPlanning") {
        return 1.0
    }

    // 3. Співпадіння однакової тварини (наприклад, обидва "Dog" або обидва "Cat")
    if (petA === petB) {
        return 1.0
    }

    // 4. Нейтральна ситуація (наприклад, у одного собака, у іншого кіт, але ніхто не проти)
    return 0.6
}

// Куріння
const WEIGHT_SMOKING = 20
function calculateSmokingScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const a = myProfile.smoking
    const b = candidateProfile.smoking

    if (!a || !b) {
        return null
    }
    const pair = [a, b];

    // 1. Не курю + намагаюся кинути (+7) -> 1.0
    if (pair.includes("NonSmoker") && pair.includes("TryingToQuit")) {
        return 1.0;
    }

    // 2. Не курю + курю регулярно (-7) -> 0.0
    if (pair.includes("NonSmoker") && pair.includes("Smoker")) {
        return 0.0;
    }

    // 3. Збіг звичок (+5) -> ~0.86
    if (a === b) {
        return 12 / 14; // ~0.857
    }

    // 4. Усі інші комбінації без гострого конфлікту (0 балів) -> 0.50
    return 0.50;
}


// Мови
const WEIGHT_LANGUAGES = 20
export function calculateLanguagesScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const langsA: LookupItem[] = myProfile.languages ?? []
    const langsB: LookupItem[] = candidateProfile.languages ?? []

    if (!langsA?.length || !langsB?.length) {
        return null
    }

    // Збираємо множину ID мов користувача B для швидкого пошуку
    const setBIds = new Set(langsB.map((item) => item.id))

    // Знаходимо кількість спільних мов за ID
    const commonLanguages = langsA.filter((item) => setBIds.has(item.id))
    const count = commonLanguages.length

    // 0 спільних мов -> 0.0 (мовний бар'єр)
    if (count === 0) {
        return 0.0
    }

    // +4 за кожну спільну мову, максимум 8 балів (2 мови дають 1.0)
    const rawScore = count * 4
    const maxScore = 8

    return Math.min(1.0, rawScore / maxScore)
}


// Інтереси
const WEIGHT_INTERESTS = 20
function calculateInterestsScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const interestsA: LookupItem[] = myProfile.interests ?? []
    const interestsB: LookupItem[] = candidateProfile.interests ?? []

    if (!interestsA?.length || !interestsB?.length) {
        return null
    }

    // Створюємо Set з ID інтересів кандидата
    const setBIds = new Set<string | number>(interestsB.map((i) => i.id))

    // Знаходимо спільні елементи
    const commonInterests: LookupItem[] = interestsA.filter((i) => setBIds.has(i.id))
    const count: number = commonInterests.length

    if (count === 0) {
        return 0.0;
    }

    // +2 за кожен спільний інтерес, максимум 10 балів (5 інтересів)
    const rawScore = count * 2;
    const maxScore = 10;

    return Math.min(1.0, rawScore / maxScore);
}


// Спорт
const WEIGHT_WORKOUT = 20
function calculateWorkoutScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const a = myProfile.workout
    const b = candidateProfile.workout

    if (!a || !b) {
        return null
    }

    if (a === b) {
        return 1.0
    }

    return 0.2
}


// Стиль спілкування
const WEIGHT_COMMUNICATION = 20
function calculateCommunicationScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const a = myProfile.communication
    const b = candidateProfile.communication

    if (!a || !b) {
        return null
    }

    if (a === b) {
        return 1.0
    }

    return 0.2
}



// Мова кохання
const WEIGHT_LOVE_LANGUAGE = 20
function calculateLoveLanguageScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const a = myProfile.loveLanguage
    const b = candidateProfile.loveLanguage

    if (!a || !b) {
        return null
    }

    if (a === b) {
        return 1.0
    }

    return 0.2
}


// Алкоголь
const WEIGHT_DRINKING = 20
function calculateDrinkingScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
) {
    const a = myProfile.drinking
    const b = candidateProfile.drinking

    if (!a || !b) {
        return null
    }

    if (a === b) {
        return 1.0
    }

    return 0.2
}



// Результат
export function calculateTotalScore(
    myProfile: PublicProfile,
    candidateProfile: PublicProfile
): number {
    // 1. Отримуємо коефіцієнти (s_i від 0.0 до 1.0)
    const sGender = calculateGenderScore(myProfile, candidateProfile)
    const sOrientation = calculateOrientationScore(myProfile, candidateProfile)
    const sLookingFor = calculateLookingForScore(myProfile, candidateProfile)
    const sFamilyPlans = calculateFamilyScore(myProfile, candidateProfile)
    const sPets = calculatePetsScore(myProfile, candidateProfile)
    const sSmoking = calculateSmokingScore(myProfile, candidateProfile)
    const sLanguages = calculateLanguagesScore(myProfile, candidateProfile)
    const sInterests = calculateInterestsScore(myProfile, candidateProfile)
    const sWorkout = calculateWorkoutScore(myProfile, candidateProfile)
    const sCommunication = calculateCommunicationScore(myProfile, candidateProfile)
    const sLoveLanguage = calculateLoveLanguageScore(myProfile, candidateProfile)
    const sDrinking = calculateDrinkingScore(myProfile, candidateProfile)


    // 2. Рахуємо бали: вага * коефіцієнт
    const scoreGender = WEIGHT_GENDER * sGender
    const scoreOrientation = WEIGHT_ORIENTATION * sOrientation
    const scoreLookingFor = WEIGHT_LOOKING_FOR * sLookingFor
    const scoreFamilyPlans = WEIGHT_FAMILY_PLANS * sFamilyPlans
    const scorePets = WEIGHT_PETS * sPets
    const scoreSmoking = WEIGHT_SMOKING * sSmoking
    const scoreLanguages = WEIGHT_LANGUAGES * sLanguages
    const scoreInterests = WEIGHT_INTERESTS * sInterests
    const scoreWorkout = WEIGHT_WORKOUT * sWorkout
    const scoreCommunication = WEIGHT_COMMUNICATION * sCommunication
    const scoreLoveLanguage = WEIGHT_LOVE_LANGUAGE * sLoveLanguage
    const scoreDrinking = WEIGHT_DRINKING * sDrinking


    // 3. Загальна сума балів
    const totalScore = scoreGender + scoreLookingFor + scoreOrientation + scoreFamilyPlans + scorePets + scoreSmoking + scoreLanguages + scoreInterests + scoreWorkout + scoreCommunication + scoreLoveLanguage + scoreDrinking

    return totalScore
}






export function debugCompareProfiles(
    myProfile: PublicProfile | null,
    candidate: DiscoveryCandidate | null
): ProfilesComparisonData | null {

    if (!myProfile) {
        console.warn("[Compatibility] Неможливо порівняти: ваш профіль ще не завантажено.")
        return null
    }

    if (!candidate || !candidate.profile) {
        console.warn("[Compatibility] Неможливо порівняти: кандидат відсутній.")
        return null
    }

    const candidateProfile = candidate.profile

    // Виводимо структурований порівняльний звіт у консоль
    console.group(`🔮 Порівняння анкет: ${myProfile.displayName} ⟷ ${candidateProfile.displayName}`)

    console.log("👤 Мій профіль:", myProfile)
    console.log("🎯 Профіль кандидата:", candidateProfile)
    console.log("📍 Відстань (км):", candidate.distanceKm)

    console.table({
        "Параметр": {
            "Я": myProfile.displayName,
            "Кандидат": candidateProfile.displayName,
        },
        "Вік": {
            "Я": myProfile.age,
            "Кандидат": candidateProfile.age,
        },
        "Гендер": {
            "Я": myProfile.gender,
            "Кандидат": candidateProfile.gender,
        },
        "Знак зодіаку": {
            "Я": myProfile.zodiac,
            "Кандидат": candidateProfile.zodiac,
        },
        "Мета (lookingFor)": {
            "Я": myProfile.lookingFor,
            "Кандидат": candidateProfile.lookingFor,
        },
        "Спорт (workout)": {
            "Я": myProfile.workout,
            "Кандидат": candidateProfile.workout,
        },
        "Діти (familyPlans)": {
            "Я": myProfile.familyPlans,
            "Кандидат": candidateProfile.familyPlans,
        },
        "Спілкування (communication)": {
            "Я": myProfile.communication,
            "Кандидат": candidateProfile.communication,
        },
        "Мова кохання (loveLanguage)": {
            "Я": myProfile.loveLanguage,
            "Кандидат": candidateProfile.loveLanguage,
        },
        "Тварини (pets)": {
            "Я": myProfile.pets,
            "Кандидат": candidateProfile.pets,
        },
        "Алкоголь (drinking)": {
            "Я": myProfile.drinking,
            "Кандидат": candidateProfile.drinking,
        },
        "Куріння (smoking)": {
            "Я": myProfile.smoking,
            "Кандидат": candidateProfile.smoking,
        },
        "Кількість інтересів": {
            "Я": myProfile.interests?.length ?? 0,
            "Кандидат": candidateProfile.interests?.length ?? 0,
        },
        "Кількість спільних мов": {
            "Я": myProfile.languages?.length ?? 0,
            "Кандидат": candidateProfile.languages?.length ?? 0,
        },
    })

    // Перевірка перетину списків (інтереси та мови)
    const myInterestIds = new Set(myProfile.interests?.map((i) => i.id) ?? [])
    const commonInterests = (candidateProfile.interests ?? []).filter((i) =>
        myInterestIds.has(i.id)
    )

    const myLanguageIds = new Set(myProfile.languages?.map((l) => l.id) ?? [])
    const commonLanguages = (candidateProfile.languages ?? []).filter((l) =>
        myLanguageIds.has(l.id)
    )

    console.log("Спільні інтереси:", commonInterests)
    console.log("Спільні мови:", commonLanguages)
    console.groupEnd()



    const result = calculateTotalScore(myProfile, candidate.profile)
    const compatibilityPercent = Math.round((result / 340) * 100)
    console.log(result)
    return {
        myProfile,
        candidateProfile,
        distanceKm: candidate.distanceKm,
        compatibilityPercent,
    }
}