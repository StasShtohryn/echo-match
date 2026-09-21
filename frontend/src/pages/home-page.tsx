import PersonCard from "@/components/person-card";
import { FilterMatchPanel } from "@/components/filter-match-panel";
import { InfoPanel } from "@/components/info-panel";
import { useState } from "react";


export interface PersonData {
  id: string
  displayName: string
  age: number
  bio: string
  idealSaturday?: string
  lookingFor?: string
  compatibilityPercent: number
  distanceKm: number
  lastActive: string
  photos: string[]
}

// Мокові дані для старту (потім заміните на відповідь з API)
const initialPerson: PersonData = {
  id: "1",
  displayName: "Оксана",
  age: 29,
  bio: "Проєктую громадські простори. Вихідні це велосипед, гончарна майстерня і довга кава без телефону. Люблю спокійні вечори з книжкою і друзями.",
  idealSaturday: "Ринок зранку, потім майстерня і кіно ввечері. Або просто довга прогулянка на велосипеді. Ідеальна субота - це коли день проходить без поспіху і з користю для душі.",
  lookingFor: "Спокійну людину, з якою нормально мовчати.",
  compatibilityPercent: 55,
  distanceKm: 3,
  lastActive: "онлайн 2 години тому",
  photos: ["/images/oxana-main.jpg"],
}


export default function HomePage() {
  // 2. Зберігаємо поточного користувача в стейті
  const [currentPerson, setCurrentPerson] = useState<PersonData>(initialPerson)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Ліва панель: фільтри та нові метчі */}
      <FilterMatchPanel />

      {/* Центральна картка: передаємо фото або ім'я */}
      <main className="flex min-h-0 flex-1 items-center justify-center bg-muted/20 p-4">
        <PersonCard />
      </main>

      {/* Права панель: передаємо дані анкети через props */}
      <InfoPanel
        displayName={currentPerson.displayName}
        age={currentPerson.age}
        bio={currentPerson.bio}
        idealSaturday={currentPerson.idealSaturday}
        lookingFor={currentPerson.lookingFor}
        compatibilityPercent={currentPerson.compatibilityPercent}
        distanceKm={currentPerson.distanceKm}
        lastActive={currentPerson.lastActive}
      />
    </div>
  )
}