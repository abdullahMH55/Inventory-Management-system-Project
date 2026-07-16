using System.Linq.Expressions;

namespace InventoryManagementSystem.Api.Repositories;

public interface IRepository<T> where T : class
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T> AddAsync(T entity);
    T Update(T entity);
    void Delete(T entity);
    Task SaveChangesAsync();
}
