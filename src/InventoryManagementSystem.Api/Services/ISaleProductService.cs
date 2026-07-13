using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface ISaleProductService
{
    Task<List<SaleProductResponse>> GetAllAsync();
    Task<SaleProductResponse?> GetByIdAsync(int id);
    Task<SaleProductResponse> CreateAsync(CreateSaleProductRequest request);
    Task<SaleProductResponse?> UpdateAsync(UpdateSaleProductRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<SaleProductResponse>> GetBySaleAsync(int saleId);
}
