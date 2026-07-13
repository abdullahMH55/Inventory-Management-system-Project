using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface ISupplierRepository : IRepository<Supplier>
{
    Task<List<Supplier>> GetByUserIdAsync(int userId);
    Task<Supplier?> GetByIdAndUserAsync(int id, int userId);
    Task<List<Supplier>> SearchByNameAndUserAsync(string name, int userId);
}
