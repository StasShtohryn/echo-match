using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using MediatR;


namespace EchoMatch.Application.Features.Lookups.GetLookups
{
    public record GetLookupsQuery : IQuery<LookupsDto>;
}
