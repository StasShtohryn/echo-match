namespace EchoMatch.Application.Common.Exceptions
{
    // Збій на боці сервісу перевірки облич, а не нашого коду: клієнт
    // має запропонувати спробувати пізніше, а не показати «щось зламалось»
    public class FaceVerificationUnavailableException : Exception
    {
        public FaceVerificationUnavailableException(string message) : base(message)
        {
        }
    }
}