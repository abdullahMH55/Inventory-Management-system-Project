using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context) { }

    public async Task<List<Product>> GetByUserIdAsync(int userId) =>
        await _context.Products.Include(p => p.Category).Where(p => p.UserId == userId).ToListAsync();

    public async Task<Product?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

    public async Task<List<Product>> GetByCategoryIdAndUserAsync(int categoryId, int userId) =>
        await _context.Products.Include(p => p.Category).Where(p => p.CategoryId == categoryId && p.UserId == userId).ToListAsync();

    public async Task<List<Product>> SearchByNameAndUserAsync(string name, int userId) =>
        await _context.Products.Include(p => p.Category).Where(p => p.Name.Contains(name) && p.UserId == userId).ToListAsync();
}
