using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context) { }

    public async Task<List<Category>> GetByUserIdAsync(int userId) =>
        await _context.Categories.Include(c => c.Products).Where(c => c.UserId == userId).ToListAsync();

    public async Task<Category?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

    public async Task<Category?> GetByNameAndUserAsync(string name, int userId) =>
        await _context.Categories.FirstOrDefaultAsync(c => c.Name == name && c.UserId == userId);
}
