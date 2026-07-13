using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public interface ISaleProductRepository : IRepository<SaleProduct>
{
    Task<List<SaleProduct>> GetByUserIdAsync(int userId);
    Task<SaleProduct?> GetByIdAndUserAsync(int id, int userId);
    Task<List<SaleProduct>> GetBySaleIdAndUserAsync(int saleId, int userId);
    Task<List<SaleProduct>> GetByProductIdAndUserAsync(int productId, int userId);
}
