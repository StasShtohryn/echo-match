using MediatR;


namespace EchoMatch.Application.Common.Messaging
{
    public interface ICommand<TResponse> : IRequest<TResponse>;
}
