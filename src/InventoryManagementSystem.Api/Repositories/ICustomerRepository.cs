using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<List<Customer>> GetByUserIdAsync(int userId);
    Task<Customer?> GetByIdAndUserAsync(int id, int userId);
    Task<List<Customer>> SearchByNameAndUserAsync(string name, int userId);
    Task<Customer?> GetByEmailAndUserAsync(string email, int userId);
}
