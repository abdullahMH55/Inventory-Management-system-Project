using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface IPurchaseProductService
{
    Task<List<PurchaseProductResponse>> GetAllAsync();
    Task<PurchaseProductResponse?> GetByIdAsync(int id);
    Task<PurchaseProductResponse> CreateAsync(CreatePurchaseProductRequest request);
    Task<PurchaseProductResponse?> UpdateAsync(UpdatePurchaseProductRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<PurchaseProductResponse>> GetByProductAsync(int productId);
    Task<List<PurchaseProductResponse>> GetByDateRangeAsync(DateTime from, DateTime to);
}
