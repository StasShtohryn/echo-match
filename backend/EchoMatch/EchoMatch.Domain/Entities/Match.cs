using EchoMatch.Domain.Common;

namespace EchoMatch.Domain.Entities
{
    public class Match : BaseEntity
    {
        // Профілі впорядковані за Guid, щоб пара (A, B) і (B, A) була одним рядком
        public Guid ProfileOneId { get; private set; }
        public UserProfile ProfileOne { get; set; } = null!;

        public Guid ProfileTwoId { get; private set; }
        public UserProfile ProfileTwo { get; set; } = null!;

        private Match() { }

        public static Match Between(Guid firstProfileId, Guid secondProfileId)
        {
            if (firstProfileId == secondProfileId)
            {
                throw new ArgumentException("A profile cannot match itself.", nameof(secondProfileId));
            }

            var inOrder = firstProfileId.CompareTo(secondProfileId) < 0;

            return new Match
            {
                ProfileOneId = inOrder ? firstProfileId : secondProfileId,
                ProfileTwoId = inOrder ? secondProfileId : firstProfileId
            };
        }

        public Guid OtherProfileId(Guid profileId) =>
            profileId == ProfileOneId ? ProfileTwoId : ProfileOneId;
    }
}