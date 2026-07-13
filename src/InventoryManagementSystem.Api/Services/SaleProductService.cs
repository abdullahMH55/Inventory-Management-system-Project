using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class SaleProductService : ISaleProductService
{
    private readonly ISaleProductRepository _saleProductRepository;
    private readonly IUserContextService _userContext;

    public SaleProductService(ISaleProductRepository saleProductRepository, IUserContextService userContext)
    {
        _saleProductRepository = saleProductRepository;
        _userContext = userContext;
    }

    public async Task<List<SaleProductResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var items = await _saleProductRepository.GetByUserIdAsync(userId);
        return items.Select(MapToResponse).ToList();
    }

    public async Task<SaleProductResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var item = await _saleProductRepository.GetByIdAndUserAsync(id, userId);
        return item == null ? null : MapToResponse(item);
    }

    public async Task<SaleProductResponse> CreateAsync(CreateSaleProductRequest request)
    {
        var userId = _userContext.GetUserId();
        var saleProduct = new SaleProduct
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            DateOut = request.DateOut,
            Notes = request.Notes,
            UserId = userId
        };

        await _saleProductRepository.AddAsync(saleProduct);
        await _saleProductRepository.SaveChangesAsync();

        return MapToResponse(saleProduct);
    }

    public async Task<SaleProductResponse?> UpdateAsync(UpdateSaleProductRequest request)
    {
        var userId = _userContext.GetUserId();
        var item = await _saleProductRepository.GetByIdAndUserAsync(request.Id, userId);
        if (item == null) return null;

        item.ProductId = request.ProductId;
        item.Quantity = request.Quantity;
        item.DateOut = request.DateOut;
        item.Notes = request.Notes;

        _saleProductRepository.Update(item);
        await _saleProductRepository.SaveChangesAsync();

        return MapToResponse(item);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var item = await _saleProductRepository.GetByIdAndUserAsync(id, userId);
        if (item == null) return false;

        _saleProductRepository.Delete(item);
        await _saleProductRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<SaleProductResponse>> GetBySaleAsync(int saleId)
    {
        var userId = _userContext.GetUserId();
        var items = await _saleProductRepository.GetBySaleIdAndUserAsync(saleId, userId);
        return items.Select(MapToResponse).ToList();
    }

    private static SaleProductResponse MapToResponse(SaleProduct sp) => new()
    {
        Id = sp.Id,
        ProductId = sp.ProductId,
        ProductName = sp.Product?.Name ?? "",
        Quantity = sp.Quantity,
        DateOut = sp.DateOut,
        Notes = sp.Notes
    };
}
