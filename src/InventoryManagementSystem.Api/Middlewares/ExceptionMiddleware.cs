using System.Net;
using System.Text.Json;
using InventoryManagementSystem.Api.Exceptions;

namespace InventoryManagementSystem.Api.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        // Domain exceptions carry a message that is safe to show the caller.
        catch (NotFoundException ex)
        {
            await WriteAsync(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (ConflictException ex)
        {
            await WriteAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (BusinessRuleException ex)
        {
            await WriteAsync(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            // Anything else is unexpected: log it, and never leak the detail.
            _logger.LogError(ex, "An unhandled exception occurred");
            await WriteAsync(context, HttpStatusCode.InternalServerError, "An internal server error occurred");
        }
    }

    private static async Task WriteAsync(HttpContext context, HttpStatusCode status, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;

        var response = new { statusCode = (int)status, message };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
