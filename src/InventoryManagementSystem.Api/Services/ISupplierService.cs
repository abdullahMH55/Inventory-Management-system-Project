using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface ISupplierService
{
    Task<List<SupplierResponse>> GetAllAsync();
    Task<SupplierResponse?> GetByIdAsync(int id);
    Task<SupplierResponse> CreateAsync(CreateSupplierRequest request);
    Task<SupplierResponse?> UpdateAsync(UpdateSupplierRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<SupplierResponse>> SearchAsync(string name);
}
