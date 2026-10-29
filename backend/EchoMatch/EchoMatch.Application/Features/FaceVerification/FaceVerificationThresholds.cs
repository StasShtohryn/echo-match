namespace EchoMatch.Application.Features.FaceVerification
{
    // Пороги, вище яких перевірка вважається пройденою. Сервіс повертає
    // ймовірності, а не «так» чи «ні», тож межу проводимо ми. Підбираються
    // на реальних спробах: вищий поріг — менше підробок, але й більше
    // справжніх людей доведеться просити повторити
    public static class FaceVerificationThresholds
    {
        public const float MinLivenessConfidence = 70f;
        public const float MinFaceSimilarity = 90f;
    }
}