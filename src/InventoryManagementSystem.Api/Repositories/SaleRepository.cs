using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class SaleRepository : Repository<Sale>, ISaleRepository
{
    public SaleRepository(AppDbContext context) : base(context) { }

    public async Task<List<Sale>> GetByUserIdAsync(int userId) =>
        await _context.Sales.Include(s => s.Customer).Include(s => s.SaleProducts).ThenInclude(sp => sp.Product)
            .Where(s => s.UserId == userId).ToListAsync();

    public async Task<Sale?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.Sales.Include(s => s.Customer).Include(s => s.SaleProducts).ThenInclude(sp => sp.Product)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

    public async Task<List<Sale>> GetByCustomerIdAndUserAsync(int customerId, int userId) =>
        await _context.Sales.Include(s => s.Customer).Include(s => s.SaleProducts).ThenInclude(sp => sp.Product)
            .Where(s => s.CustomerId == customerId && s.UserId == userId).ToListAsync();

    public async Task<List<Sale>> GetByDateRangeAndUserAsync(DateTime from, DateTime to, int userId) =>
        await _context.Sales.Include(s => s.Customer).Include(s => s.SaleProducts).ThenInclude(sp => sp.Product)
            .Where(s => s.Date >= from && s.Date <= to && s.UserId == userId).ToListAsync();
}
