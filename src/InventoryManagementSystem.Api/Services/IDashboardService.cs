using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface IDashboardService
{
    Task<DashboardStatsResponse> GetStatsAsync(int lowStockThreshold);
}
