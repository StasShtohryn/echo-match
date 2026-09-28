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

        // Коли кожен учасник уперше відкрив метч; null — для нього метч ще новий
        public DateTime? ProfileOneSeenAt { get; private set; }
        public DateTime? ProfileTwoSeenAt { get; private set; }

        // Момент, до якого учасник прочитав листування. Одна позначка на
        // учасника замість прапорця на кожному повідомленні: цього досить
        // і для галочок, і для лічильника непрочитаних
        public DateTime? ProfileOneLastReadAt { get; private set; }
        public DateTime? ProfileTwoLastReadAt { get; private set; }

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

        public bool Involves(Guid profileId) =>
            profileId == ProfileOneId || profileId == ProfileTwoId;


        public DateTime? LastReadAtBy(Guid profileId) =>
    profileId == ProfileOneId ? ProfileOneLastReadAt : ProfileTwoLastReadAt;

        // На відміну від MarkSeenBy, позначка саме зсувається вперед:
        // прочитане — це стан, а не одна подія
        public void MarkReadBy(Guid profileId, DateTime utcNow)
        {
            if (profileId == ProfileOneId)
            {
                ProfileOneLastReadAt = utcNow;
            }
            else if (profileId == ProfileTwoId)
            {
                ProfileTwoLastReadAt = utcNow;
            }
            else
            {
                throw new ArgumentException("The profile is not part of this match.", nameof(profileId));
            }
        }


        // Повторний виклик нічого не змінює: зберігається момент першого перегляду
        public void MarkSeenBy(Guid profileId, DateTime utcNow)
        {
            if (profileId == ProfileOneId)
            {
                ProfileOneSeenAt ??= utcNow;
            }
            else if (profileId == ProfileTwoId)
            {
                ProfileTwoSeenAt ??= utcNow;
            }
            else
            {
                throw new ArgumentException("The profile is not part of this match.", nameof(profileId));
            }
        }
    }
}