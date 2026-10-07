namespace EchoMatch.Application.Common.Exceptions
{
    // Збій на боці моделі — не наша помилка й не помилка запиту, тож окремий
    // тип: клієнт має показати «спробуйте ще раз», а не «щось зламалось»
    public class AiUnavailableException : Exception
    {
        public AiUnavailableException(string message) : base(message)
        {
        }
    }
}