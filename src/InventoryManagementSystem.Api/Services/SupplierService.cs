using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly IUserContextService _userContext;

    public SupplierService(ISupplierRepository supplierRepository, IUserContextService userContext)
    {
        _supplierRepository = supplierRepository;
        _userContext = userContext;
    }

    public async Task<List<SupplierResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var suppliers = await _supplierRepository.GetByUserIdAsync(userId);
        return suppliers.Select(MapToResponse).ToList();
    }

    public async Task<SupplierResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var supplier = await _supplierRepository.GetByIdAndUserAsync(id, userId);
        return supplier == null ? null : MapToResponse(supplier);
    }

    public async Task<SupplierResponse> CreateAsync(CreateSupplierRequest request)
    {
        var userId = _userContext.GetUserId();
        var supplier = new Supplier
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            UserId = userId
        };

        await _supplierRepository.AddAsync(supplier);
        await _supplierRepository.SaveChangesAsync();

        return MapToResponse(supplier);
    }

    public async Task<SupplierResponse?> UpdateAsync(UpdateSupplierRequest request)
    {
        var userId = _userContext.GetUserId();
        var supplier = await _supplierRepository.GetByIdAndUserAsync(request.Id, userId);
        if (supplier == null) return null;

        supplier.Name = request.Name;
        supplier.Email = request.Email;
        supplier.Phone = request.Phone;
        supplier.Address = request.Address;

        _supplierRepository.Update(supplier);
        await _supplierRepository.SaveChangesAsync();

        return MapToResponse(supplier);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var supplier = await _supplierRepository.GetByIdAndUserAsync(id, userId);
        if (supplier == null) return false;

        _supplierRepository.Delete(supplier);
        await _supplierRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<SupplierResponse>> SearchAsync(string name)
    {
        var userId = _userContext.GetUserId();
        var suppliers = await _supplierRepository.SearchByNameAndUserAsync(name, userId);
        return suppliers.Select(MapToResponse).ToList();
    }

    private static SupplierResponse MapToResponse(Supplier s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Email = s.Email,
        Phone = s.Phone,
        Address = s.Address
    };
}
