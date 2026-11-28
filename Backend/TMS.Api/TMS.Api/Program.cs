using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Security.Claims;
using System.Text;
using TMS.Api.Mappings;
using TMS.Api.Middleware;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Auth;
using TMS.Business.Services;
using TMS.Data.Context;
using TMS.Data.Repositories;
using TMS.Data.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAutoMapper(cfg => { },typeof(TravelRequestProfile).Assembly);
//builder.Services.AddAutoMapper(typeof(TravelRequestProfile).Assembly);  


//register the database context
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IRoleRepository,RoleRepository>();
builder.Services.AddScoped<IRoleService, RoleService>();

builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();


builder.Services.AddScoped<IPasswordHashService, IdentityPasswordHashService>();
builder.Services.AddScoped<
    Microsoft.AspNetCore.Identity.IPasswordHasher<User>,
    Microsoft.AspNetCore.Identity.PasswordHasher<User>>();


builder.Services.AddScoped<IEmployeeService, EmployeeService>();


builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddSingleton(sp =>sp.GetRequiredService<IOptions<JwtSettings>>().Value);
builder.Services.AddScoped<IAuthService, AuthService>();


builder.Services.AddScoped<ITravelRequestService,TravelRequestService>();
builder.Services.AddScoped<ITravelRequestRepository,TravelRequestRepository>();

builder.Services.AddScoped<ITravelPolicyRepository, TravelPolicyRepository>();
builder.Services.AddScoped<ITravelPolicyService, TravelPolicyService>();

builder.Services.AddScoped<ITravelApprovalRepository, TravelApprovalRepository>();
builder.Services.AddScoped<ITravelApprovalService, TravelApprovalService>();

builder.Services.AddScoped<IAuditLogService, AuditLogService>();

builder.Services.AddScoped<IExpenseClaimRepository, ExpenseClaimRepository>();
builder.Services.AddScoped<IExpenseClaimService, ExpenseClaimService>();

builder.Services.AddScoped<IExpenseReceiptStorage,LocalExpenseReceiptStorage>();

builder.Services.AddScoped<IExpenseClaimReviewRepository,ExpenseClaimReviewRepository>();
builder.Services.AddScoped<IExpenseClaimReviewService,ExpenseClaimReviewService>();


builder.Services.AddScoped<IReimbursementRepository, ReimbursementRepository>();
builder.Services.AddScoped<IReimbursementService,ReimbursementService>();


var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT configuration is missing.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) ||
    Encoding.UTF8.GetByteCount(jwtSettings.Key) < 32)
{
    throw new InvalidOperationException(
        "JWT signing key must contain at least 32 bytes.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Key)),

            ValidateLifetime = true,

            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role,

            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Components ??= new Microsoft.OpenApi.OpenApiComponents();

        //document.Components.SecuritySchemes ??=new Dictionary<string, Microsoft.OpenApi.OpenApiSecurityScheme>();
        document.Components.SecuritySchemes ??=new Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes.Add(
            "BearerAuth",
            new Microsoft.OpenApi.OpenApiSecurityScheme
            {
                Type = Microsoft.OpenApi.SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Enter your JWT access token."
            });

        return Task.CompletedTask;
    });
});



builder.Services.AddTransient<ExceptionHandlingMiddleware>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("TmsClientPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();

    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options
            .AddPreferredSecuritySchemes("BearerAuth")
            .AddHttpAuthentication("BearerAuth", auth =>
            {
                auth.Token = "";
            });
    });

}

app.UseMiddleware<ExceptionHandlingMiddleware>();


app.UseCors("TmsClientPolicy");

app.UseAuthentication();

//app.UseAuthorization();
app.UseAuthorization();


app.MapControllers();

app.Run();
