using EchoMatch.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, exposeDetail) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation error", true),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid argument", true),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict", true),
            NotFoundException => (StatusCodes.Status404NotFound, "Not found", true),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", true),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized", true),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred", false)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception");
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exposeDetail ? exception.Message : "An unexpected error occurred. Please try again later."
        };

        if (exception is ValidationException validationException)
        {
            problemDetails.Extensions["errors"] = validationException.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
        }

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
