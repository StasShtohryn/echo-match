namespace EchoMatch.Domain.ValueObjects
{
    public readonly record struct GeoBounds(
        double MinLatitude,
        double MaxLatitude,
        double MinLongitude,
        double MaxLongitude);
}