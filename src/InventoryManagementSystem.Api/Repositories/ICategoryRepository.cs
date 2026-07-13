using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<List<Category>> GetByUserIdAsync(int userId);
    Task<Category?> GetByIdAndUserAsync(int id, int userId);
    Task<Category?> GetByNameAndUserAsync(string name, int userId);
}
