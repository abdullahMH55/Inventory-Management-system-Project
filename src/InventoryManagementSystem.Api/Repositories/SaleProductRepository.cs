using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class SaleProductRepository : Repository<SaleProduct>, ISaleProductRepository
{
    public SaleProductRepository(AppDbContext context) : base(context) { }

    public async Task<List<SaleProduct>> GetByUserIdAsync(int userId) =>
        await _context.SaleProducts.Include(sp => sp.Product)
            .Where(sp => sp.UserId == userId).ToListAsync();

    public async Task<SaleProduct?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.SaleProducts.Include(sp => sp.Product)
            .FirstOrDefaultAsync(sp => sp.Id == id && sp.UserId == userId);

    public async Task<List<SaleProduct>> GetBySaleIdAndUserAsync(int saleId, int userId) =>
        await _context.SaleProducts.Include(sp => sp.Product)
            .Where(sp => sp.SaleId == saleId && sp.UserId == userId).ToListAsync();

    public async Task<List<SaleProduct>> GetByProductIdAndUserAsync(int productId, int userId) =>
        await _context.SaleProducts.Include(sp => sp.Product)
            .Where(sp => sp.ProductId == productId && sp.UserId == userId).ToListAsync();
}
