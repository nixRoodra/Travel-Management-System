using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TMS.Api.Middleware
{
    public class ExceptionHandlingMiddleware: IMiddleware
    {
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger)
        {
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next) 
        {
            try
            {
                await next(context);
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "An unhandled exception occurred while processing the request.");

                if (context.Response.HasStarted)
                {
                    throw;
                }

                context.Response.Clear();

                var statusCode = GetStatusCode(ex);

                var problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = statusCode switch
                    {
                        400 => "Bad Request",
                        401 => "Unauthorized",
                        404 => "Not Found",
                        409 => "Conflict",
                        _ => "Internal Server Error"
                    },
                    Detail = statusCode == 500
                        ? "An unexpected error occurred."
                        : ex.Message,
                    Instance = context.Request.Path
                };

                context.Response.StatusCode = statusCode;

                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(problemDetails);
            }
        }

        private static int GetStatusCode(Exception exception)
        {
            return exception switch
            {
                ArgumentException =>
                    StatusCodes.Status400BadRequest,

                UnauthorizedAccessException =>
                    StatusCodes.Status401Unauthorized,

                KeyNotFoundException =>
                    StatusCodes.Status404NotFound,

                InvalidOperationException =>
                    StatusCodes.Status400BadRequest,

                DbUpdateConcurrencyException =>
                    StatusCodes.Status409Conflict,

                _ => StatusCodes.Status500InternalServerError
            };
        
        }
    }
}
