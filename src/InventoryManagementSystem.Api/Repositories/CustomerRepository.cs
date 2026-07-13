using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Data;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(AppDbContext context) : base(context) { }

    public async Task<List<Customer>> GetByUserIdAsync(int userId) =>
        await _context.Customers.Where(c => c.UserId == userId).ToListAsync();

    public async Task<Customer?> GetByIdAndUserAsync(int id, int userId) =>
        await _context.Customers.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

    public async Task<List<Customer>> SearchByNameAndUserAsync(string name, int userId) =>
        await _context.Customers.Where(c => c.Name.Contains(name) && c.UserId == userId).ToListAsync();

    public async Task<Customer?> GetByEmailAndUserAsync(string email, int userId) =>
        await _context.Customers.FirstOrDefaultAsync(c => c.Email == email && c.UserId == userId);
}
