using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Middlewares;
using InventoryManagementSystem.Api.Repositories;
using InventoryManagementSystem.Api.Services;

namespace InventoryManagementSystem.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddSwaggerGen();

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.None;
                options.ExpireTimeSpan = TimeSpan.FromHours(24);
                options.SlidingExpiration = true;
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = 403;
                    return Task.CompletedTask;
                };
            });

        builder.Services.AddAuthorization();

        // Cookie auth requires AllowCredentials, which cannot be combined with AllowAnyOrigin.
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                             ?? ["http://localhost:5173"];

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        builder.Services.AddHttpContextAccessor();

        // Repositories
        builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
        builder.Services.AddScoped<IProductRepository, ProductRepository>();
        builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
        builder.Services.AddScoped<IPurchaseProductRepository, PurchaseProductRepository>();
        builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
        builder.Services.AddScoped<ISaleRepository, SaleRepository>();
        builder.Services.AddScoped<ISaleProductRepository, SaleProductRepository>();

        // Services
        builder.Services.AddScoped<IUserContextService, UserContextService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        builder.Services.AddScoped<IProductService, ProductService>();
        builder.Services.AddScoped<ISupplierService, SupplierService>();
        builder.Services.AddScoped<IPurchaseProductService, PurchaseProductService>();
        builder.Services.AddScoped<ICustomerService, CustomerService>();
        builder.Services.AddScoped<ISaleService, SaleService>();
        builder.Services.AddScoped<ISaleProductService, SaleProductService>();

        var app = builder.Build();

        app.UseMiddleware<ExceptionMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}
