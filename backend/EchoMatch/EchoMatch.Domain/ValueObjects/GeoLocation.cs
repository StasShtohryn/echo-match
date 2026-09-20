

namespace EchoMatch.Domain.ValueObjects
{
    public class GeoLocation
    {
        private const double EarthRadiusKm = 6371;

        public double Latitude { get; private set; }
        public double Longitude { get; private set; }

        private GeoLocation() { }

        public GeoLocation(double latitude, double longitude)
        {
            if (latitude is < -90 or > 90)
            {
                throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90.");
            }

            if (longitude is < -180 or > 180)
            {
                throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180.");
            }

            Latitude = latitude;
            Longitude = longitude;
        }

        public double DistanceKmTo(GeoLocation other)
        {

            var dLat = ToRadians(other.Latitude - Latitude);
            var dLon = ToRadians(other.Longitude - Longitude);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                    + Math.Cos(ToRadians(Latitude)) * Math.Cos(ToRadians(other.Latitude))
                    * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return EarthRadiusKm * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }


        // Квадрат, у який гарантовано вміщується коло заданого радіуса. Це грубий
        // фільтр для бази, точну відстань рахує DistanceKmTo. Запас 1% покриває
        // те, що коло на сфері трохи ширше за наближення. Перехід через 180-й
        // меридіан не враховано — для наших широт і довгот це не актуально.
        public GeoBounds BoundingBox(double radiusKm)
        {
            const double margin = 1.01;
            var kmPerDegree = EarthRadiusKm * Math.PI / 180;

            var latitudeDelta = radiusKm * margin / kmPerDegree;
            var longitudeDelta = radiusKm * margin / (kmPerDegree * Math.Max(Math.Cos(ToRadians(Latitude)), 0.01));

            return new GeoBounds(
                Latitude - latitudeDelta,
                Latitude + latitudeDelta,
                Longitude - longitudeDelta,
                Longitude + longitudeDelta);
        }


        private static double ToRadians(double degrees) => degrees * Math.PI / 180;

    }
}
