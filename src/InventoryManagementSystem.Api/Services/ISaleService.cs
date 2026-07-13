using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface ISaleService
{
    Task<List<SaleResponse>> GetAllAsync();
    Task<SaleResponse?> GetByIdAsync(int id);
    Task<SaleResponse> CreateAsync(CreateSaleRequest request);
    Task<SaleResponse?> UpdateAsync(UpdateSaleRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<SaleResponse>> GetByCustomerAsync(int customerId);
    Task<List<SaleResponse>> GetByDateRangeAsync(DateTime from, DateTime to);
}
