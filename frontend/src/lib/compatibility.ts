import type { PublicProfile, DiscoveryCandidate, LookupItem } from "@/services/auth-service"
export interface ProfilesComparisonData {
    myProfile: PublicProfile
    candidateProfile: PublicProfile
    distanceKm: number | null
    compatibilityPercent: number
}


// Стать
const WEIGHT_GENDER = 15
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
const WEIGHT_ORIENTATION = 30
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
const WEIGHT_LOOKING_FOR = 30
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
const WEIGHT_FAMILY_PLANS = 35
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
const WEIGHT_INTERESTS = 25
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
const WEIGHT_WORKOUT = 15
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
const WEIGHT_COMMUNICATION = 25
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
const WEIGHT_LOVE_LANGUAGE = 25
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
    console.log("ПОЧАТОК ОБРАХУВАННЯ")

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

    // 2. Накопичуємо бали ТІЛЬКИ якщо значення не null
    let earnedScore = 0
    let activeWeight = 0

    function addFactor(score: number | null, weight: number) {
        if (score !== null) {
            earnedScore += score * weight
            activeWeight += weight
        }
    }

    // 3. Проганяємо всі поля через помічник:
    addFactor(sGender, WEIGHT_GENDER)
    addFactor(sOrientation, WEIGHT_ORIENTATION)
    addFactor(sLookingFor, WEIGHT_LOOKING_FOR)
    addFactor(sFamilyPlans, WEIGHT_FAMILY_PLANS)
    addFactor(sPets, WEIGHT_PETS)
    addFactor(sSmoking, WEIGHT_SMOKING)
    addFactor(sLanguages, WEIGHT_LANGUAGES)
    addFactor(sInterests, WEIGHT_INTERESTS)
    addFactor(sWorkout, WEIGHT_WORKOUT)
    addFactor(sCommunication, WEIGHT_COMMUNICATION)
    addFactor(sLoveLanguage, WEIGHT_LOVE_LANGUAGE)
    addFactor(sDrinking, WEIGHT_DRINKING)

    // 3. Розрахунок К
    const total_weight = WEIGHT_WORKOUT + WEIGHT_SMOKING + WEIGHT_PETS + WEIGHT_ORIENTATION + WEIGHT_LOVE_LANGUAGE + WEIGHT_LOOKING_FOR + WEIGHT_LANGUAGES + WEIGHT_INTERESTS + WEIGHT_GENDER + WEIGHT_FAMILY_PLANS + WEIGHT_DRINKING + WEIGHT_COMMUNICATION
    console.log(total_weight)

    const K1 = total_weight * 0.2
    const K2 = total_weight * 0.25

    const K = (K1 + K2) / 2
    console.log(K)

    console.log(earnedScore)

    const result = ((earnedScore + K * 0.5) / (activeWeight + K)) * 100
    console.log(result)

    return result
}