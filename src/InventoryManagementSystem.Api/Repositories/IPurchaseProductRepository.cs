using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface IPurchaseProductRepository : IRepository<PurchaseProduct>
{
    Task<List<PurchaseProduct>> GetByUserIdAsync(int userId);
    Task<PurchaseProduct?> GetByIdAndUserAsync(int id, int userId);
    Task<List<PurchaseProduct>> GetByProductIdAndUserAsync(int productId, int userId);
    Task<List<PurchaseProduct>> GetByDateRangeAndUserAsync(DateTime from, DateTime to, int userId);
}
