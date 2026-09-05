using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Profiles.GetMyProfile
{
    public record GetMyProfileQuery : IQuery<MyProfileDto>;
}
