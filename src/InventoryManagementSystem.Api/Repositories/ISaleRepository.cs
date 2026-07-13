using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface ISaleRepository : IRepository<Sale>
{
    Task<List<Sale>> GetByUserIdAsync(int userId);
    Task<Sale?> GetByIdAndUserAsync(int id, int userId);
    Task<List<Sale>> GetByCustomerIdAndUserAsync(int customerId, int userId);
    Task<List<Sale>> GetByDateRangeAndUserAsync(DateTime from, DateTime to, int userId);
}
