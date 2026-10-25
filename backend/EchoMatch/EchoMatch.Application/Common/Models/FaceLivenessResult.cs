namespace EchoMatch.Application.Common.Models
{
    public enum FaceLivenessStatus { InProgress, Succeeded, Failed, Expired }

    // ReferenceImage — кадр з відео, який сервіс вважає найкращим для
    // порівняння облич. Є лише в успішної сесії
    public record FaceLivenessResult(FaceLivenessStatus Status, float Confidence, byte[]? ReferenceImage);
}