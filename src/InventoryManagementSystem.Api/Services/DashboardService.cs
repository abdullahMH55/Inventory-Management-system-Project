using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

/// <summary>
/// Reporting service: aggregates run in SQL and span multiple tables, so it uses
/// the DbContext directly rather than the per-entity repositories (which return
/// materialized lists). Everything is scoped to the current user.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;
    private readonly IUserContextService _userContext;

    public DashboardService(AppDbContext db, IUserContextService userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync(int lowStockThreshold)
    {
        var userId = _userContext.GetUserId();
        var products = _db.Products.Where(p => p.UserId == userId);
        var sales = _db.Sales.Where(s => s.UserId == userId);

        return new DashboardStatsResponse
        {
            TotalProducts = await products.CountAsync(),
            // Nullable cast: SUM over an empty set is NULL in SQL, which would throw
            // mapping to a non-nullable int/decimal.
            TotalStockUnits = await products.SumAsync(p => (int?)p.Stock) ?? 0,
            InventoryValue = await products.SumAsync(p => (decimal?)(p.Price * p.Stock)) ?? 0m,
            LowStockCount = await products.CountAsync(p => p.Stock > 0 && p.Stock <= lowStockThreshold),
            OutOfStockCount = await products.CountAsync(p => p.Stock <= 0),
            SalesValue = await sales.SumAsync(s => (decimal?)s.TotalPrice) ?? 0m,
            SalesCount = await sales.CountAsync(),
            CategoriesCount = await _db.Categories.CountAsync(c => c.UserId == userId),
            CustomersCount = await _db.Customers.CountAsync(c => c.UserId == userId),
            SuppliersCount = await _db.Suppliers.CountAsync(s => s.UserId == userId),
            PurchasesCount = await _db.PurchaseProducts.CountAsync(p => p.UserId == userId),
            LowStockThreshold = lowStockThreshold,
        };
    }
}
