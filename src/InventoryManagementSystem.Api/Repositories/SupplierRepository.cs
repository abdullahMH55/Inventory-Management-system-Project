using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class SupplierRepository : Repository<Supplier>, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context) { }

    public async Task<List<Supplier>> GetByUserIdAsync(int userId) =>
        await _context.Suppliers.Where(s => s.UserId == userId).ToListAsync();

    public async Task<Supplier?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

    public async Task<List<Supplier>> SearchByNameAndUserAsync(string name, int userId) =>
        await _context.Suppliers.Where(s => s.Name.Contains(name) && s.UserId == userId).ToListAsync();
}
