using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;
    private readonly IUserContextService _userContext;

    public ReportService(AppDbContext db, IUserContextService userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<List<TopProductResponse>> GetTopProductsAsync(DateTime? from, DateTime? to, int limit)
    {
        var userId = _userContext.GetUserId();

        var lines = _db.SaleProducts.Where(sp => sp.UserId == userId);
        if (from.HasValue) lines = lines.Where(sp => sp.DateOut >= from.Value);
        if (to.HasValue) lines = lines.Where(sp => sp.DateOut <= to.Value);

        var query =
            from sp in lines
            join p in _db.Products on sp.ProductId equals p.Id
            group sp by new { sp.ProductId, p.Name } into g
            select new TopProductResponse
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                UnitsSold = g.Sum(x => x.Quantity),
            };

        return await query
            .OrderByDescending(x => x.UnitsSold)
            .ThenBy(x => x.ProductName)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<SalesSummaryPointResponse>> GetSalesSummaryAsync(DateTime? from, DateTime? to, string groupBy)
    {
        var userId = _userContext.GetUserId();

        var sales = _db.Sales.Where(s => s.UserId == userId);
        if (from.HasValue) sales = sales.Where(s => s.Date >= from.Value);
        if (to.HasValue) sales = sales.Where(s => s.Date <= to.Value);

        var byMonth = string.Equals(groupBy, "month", StringComparison.OrdinalIgnoreCase);

        if (byMonth)
        {
            var monthly = await sales
                .GroupBy(s => new { s.Date.Year, s.Date.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Total = g.Sum(x => x.TotalPrice),
                    Count = g.Count(),
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            return monthly
                .Select(x => new SalesSummaryPointResponse
                {
                    Period = $"{x.Year:D4}-{x.Month:D2}",
                    Total = x.Total,
                    Count = x.Count,
                })
                .ToList();
        }

        var daily = await sales
            .GroupBy(s => new { s.Date.Year, s.Date.Month, s.Date.Day })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                g.Key.Day,
                Total = g.Sum(x => x.TotalPrice),
                Count = g.Count(),
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month).ThenBy(x => x.Day)
            .ToListAsync();

        return daily
            .Select(x => new SalesSummaryPointResponse
            {
                Period = $"{x.Year:D4}-{x.Month:D2}-{x.Day:D2}",
                Total = x.Total,
                Count = x.Count,
            })
            .ToList();
    }
}
