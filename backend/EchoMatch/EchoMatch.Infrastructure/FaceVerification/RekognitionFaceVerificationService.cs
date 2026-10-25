using Amazon.Rekognition;
using Amazon.Rekognition.Model;
using Amazon.Runtime;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Infrastructure.Security;
using Microsoft.Extensions.Options;

namespace EchoMatch.Infrastructure.FaceVerification
{
    public class RekognitionFaceVerificationService : IFaceVerificationService
    {
        private readonly IAmazonRekognition _rekognition;
        private readonly HttpClient _httpClient;
        private readonly AwsSettings _settings;

        public RekognitionFaceVerificationService(
            IAmazonRekognition rekognition,
            HttpClient httpClient,
            IOptions<AwsSettings> settings)
        {
            _rekognition = rekognition;
            _httpClient = httpClient;
            _settings = settings.Value;
        }

        public string Region => _settings.Region;

        public async Task<string> CreateSessionAsync(CancellationToken cancellationToken)
        {
            EnsureConfigured();

            // Кадри з відео не зберігаємо: AuditImagesLimit 0, без OutputConfig
            // нічого не лягає в S3, а еталонний кадр приходить у відповіді
            var response = await CallAsync(() => _rekognition.CreateFaceLivenessSessionAsync(
                new CreateFaceLivenessSessionRequest
                {
                    Settings = new CreateFaceLivenessSessionRequestSettings { AuditImagesLimit = 0 }
                },
                cancellationToken));

            return response.SessionId;
        }

        public async Task<FaceLivenessResult> GetLivenessResultAsync(
            string sessionId,
            CancellationToken cancellationToken)
        {
            EnsureConfigured();

            var response = await CallAsync(() => _rekognition.GetFaceLivenessSessionResultsAsync(
                new GetFaceLivenessSessionResultsRequest { SessionId = sessionId },
                cancellationToken));

            var status = response.Status.Value switch
            {
                "SUCCEEDED" => FaceLivenessStatus.Succeeded,
                "FAILED" => FaceLivenessStatus.Failed,
                "EXPIRED" => FaceLivenessStatus.Expired,
                _ => FaceLivenessStatus.InProgress
            };

            return new FaceLivenessResult(
                status,
                response.Confidence ?? 0,
                response.ReferenceImage?.Bytes?.ToArray());
        }

        public async Task<float?> CompareWithPhotoAsync(
            byte[] referenceImage,
            string photoUrl,
            CancellationToken cancellationToken)
        {
            EnsureConfigured();

            // Фото в сховищі вже JPEG до 1200 пікселів, тож у ліміт сервісу
            // (5 МБ, JPEG або PNG) воно вкладається без перетворень
            byte[] photo;

            try
            {
                photo = await _httpClient.GetByteArrayAsync(photoUrl, cancellationToken);
            }
            catch (HttpRequestException exception)
            {
                throw new FaceVerificationUnavailableException($"Не вдалося завантажити фото профілю: {exception.Message}");
            }

            try
            {
                var response = await CallAsync(() => _rekognition.CompareFacesAsync(
                    new CompareFacesRequest
                    {
                        SourceImage = new Image { Bytes = new MemoryStream(referenceImage) },
                        TargetImage = new Image { Bytes = new MemoryStream(photo) },

                        // Поріг ставимо ми, тож просимо всі збіги, навіть слабкі
                        SimilarityThreshold = 0
                    },
                    cancellationToken));

                return response.FaceMatches is { Count: > 0 } matches
                    ? matches.Max(m => m.Similarity ?? 0)
                    : 0;
            }
            catch (InvalidParameterException)
            {
                // Так сервіс відповідає, коли на одному із зображень немає обличчя.
                // Еталонний кадр з успішної сесії його точно має, отже — на фото
                return null;
            }
        }

        private void EnsureConfigured()
        {
            if (string.IsNullOrWhiteSpace(_settings.AccessKeyId) || string.IsNullOrWhiteSpace(_settings.SecretAccessKey))
            {
                throw new InvalidOperationException("Aws:AccessKeyId and Aws:SecretAccessKey are not configured.");
            }
        }

        // Збій чужого сервісу не має виглядати як помилка нашого коду.
        // InvalidParameterException пропускаємо: це відповідь «обличчя немає»
        private static async Task<T> CallAsync<T>(Func<Task<T>> call)
        {
            try
            {
                return await call();
            }
            catch (InvalidParameterException)
            {
                throw;
            }
            catch (AmazonServiceException exception)
            {
                throw new FaceVerificationUnavailableException($"Сервіс перевірки облич недоступний: {exception.Message}");
            }
            catch (HttpRequestException exception)
            {
                throw new FaceVerificationUnavailableException($"Сервіс перевірки облич недоступний: {exception.Message}");
            }
        }
    }
}