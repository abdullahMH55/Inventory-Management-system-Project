using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;

namespace InventoryManagementSystem.Api.Services;

public interface ICustomerService
{
    Task<List<CustomerResponse>> GetAllAsync();
    Task<CustomerResponse?> GetByIdAsync(int id);
    Task<CustomerResponse> CreateAsync(CreateCustomerRequest request);
    Task<CustomerResponse?> UpdateAsync(UpdateCustomerRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<CustomerResponse>> SearchAsync(string name);
}
