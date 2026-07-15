using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface IReportService
{
    Task<List<TopProductResponse>> GetTopProductsAsync(DateTime? from, DateTime? to, int limit);
    Task<List<SalesSummaryPointResponse>> GetSalesSummaryAsync(DateTime? from, DateTime? to, string groupBy);
}
