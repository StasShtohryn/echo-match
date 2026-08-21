using MediatR;

namespace EchoMatch.Application.Common.Messaging
{
    public interface IQuery<TResponse> : IRequest<TResponse>;
}
