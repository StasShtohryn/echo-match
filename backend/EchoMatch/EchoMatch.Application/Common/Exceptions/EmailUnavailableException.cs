namespace EchoMatch.Application.Common.Exceptions
{
    // Поштовий сервіс не прийняв лист: це не помилка запиту, клієнт може
    // спробувати надіслати код ще раз пізніше
    public class EmailUnavailableException : Exception
    {
        public EmailUnavailableException(string message) : base(message)
        {
        }
    }
}