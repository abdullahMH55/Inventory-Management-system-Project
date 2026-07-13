using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface IProductService
{
    Task<List<ProductResponse>> GetAllAsync();
    Task<ProductResponse?> GetByIdAsync(int id);
    Task<ProductResponse> CreateAsync(CreateProductRequest request);
    Task<ProductResponse?> UpdateAsync(UpdateProductRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<ProductResponse>> GetByCategoryAsync(int categoryId);
    Task<List<ProductResponse>> SearchAsync(string name);
    Task UpdateStockAsync(int productId, int quantityChange);
}
