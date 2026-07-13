using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<List<Product>> GetByUserIdAsync(int userId);
    Task<Product?> GetByIdAndUserAsync(int id, int userId);
    Task<List<Product>> GetByCategoryIdAndUserAsync(int categoryId, int userId);
    Task<List<Product>> SearchByNameAndUserAsync(string name, int userId);
}
