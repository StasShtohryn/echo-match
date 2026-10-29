namespace EchoMatch.Application.Common.Dtos
{
    // FilesNotDeleted — файли, які сховище не прибрало: дані з бази вже
    // видалено, а файли лишилися сиротами, і їх видно адміну
    public record UserDeletionResultDto(int DeletedAccounts, int FilesNotDeleted);
}