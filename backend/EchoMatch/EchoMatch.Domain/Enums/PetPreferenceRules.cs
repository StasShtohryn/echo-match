namespace EchoMatch.Domain.Enums;

// Що можна обрати разом. Тварини, які є, поєднуються між собою; «тварин
// немає» з ними суперечить. Allergic, WantAPet і Other поєднуються з усім
public static class PetPreferenceRules
{
    public const int MaxSelected = 5;

    public static readonly IReadOnlySet<PetPreference> Owned = new HashSet<PetPreference>
    {
        PetPreference.Dog, PetPreference.Cat, PetPreference.Reptile,
        PetPreference.Amphibian, PetPreference.Bird, PetPreference.Fish
    };

    public static readonly IReadOnlySet<PetPreference> NoneOwned = new HashSet<PetPreference>
    {
        PetPreference.DontHaveButLove, PetPreference.NoPets
    };

    public static bool AreConsistent(IReadOnlyCollection<PetPreference> pets) =>
        !(pets.Any(Owned.Contains) && pets.Any(NoneOwned.Contains));
}