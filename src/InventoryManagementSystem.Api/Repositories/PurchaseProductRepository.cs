using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class PurchaseProductRepository : Repository<PurchaseProduct>, IPurchaseProductRepository
{
    public PurchaseProductRepository(AppDbContext context) : base(context) { }

    public async Task<List<PurchaseProduct>> GetByUserIdAsync(int userId) =>
        await _context.PurchaseProducts.Include(p => p.Product).Include(p => p.Supplier)
            .Where(p => p.UserId == userId).ToListAsync();

    public async Task<PurchaseProduct?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.PurchaseProducts.Include(p => p.Product).Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

    public async Task<List<PurchaseProduct>> GetByProductIdAndUserAsync(int productId, int userId) =>
        await _context.PurchaseProducts.Include(p => p.Product).Include(p => p.Supplier)
            .Where(p => p.ProductId == productId && p.UserId == userId).ToListAsync();

    public async Task<List<PurchaseProduct>> GetByDateRangeAndUserAsync(DateTime from, DateTime to, int userId) =>
        await _context.PurchaseProducts.Include(p => p.Product).Include(p => p.Supplier)
            .Where(p => p.DateIn >= from && p.DateIn <= to && p.UserId == userId).ToListAsync();
}
