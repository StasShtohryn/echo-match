using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
