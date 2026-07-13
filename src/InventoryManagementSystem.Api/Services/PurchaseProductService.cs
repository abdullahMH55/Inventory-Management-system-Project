using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class PurchaseProductService : IPurchaseProductService
{
    private readonly IPurchaseProductRepository _purchaseProductRepository;
    private readonly IProductService _productService;
    private readonly IUserContextService _userContext;

    public PurchaseProductService(
        IPurchaseProductRepository purchaseProductRepository,
        IProductService productService,
        IUserContextService userContext)
    {
        _purchaseProductRepository = purchaseProductRepository;
        _productService = productService;
        _userContext = userContext;
    }

    public async Task<List<PurchaseProductResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var purchases = await _purchaseProductRepository.GetByUserIdAsync(userId);
        return purchases.Select(MapToResponse).ToList();
    }

    public async Task<PurchaseProductResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var purchase = await _purchaseProductRepository.GetByIdAndUserAsync(id, userId);
        return purchase == null ? null : MapToResponse(purchase);
    }

    public async Task<PurchaseProductResponse> CreateAsync(CreatePurchaseProductRequest request)
    {
        var userId = _userContext.GetUserId();
        var purchase = new PurchaseProduct
        {
            ProductId = request.ProductId,
            SupplierId = request.SupplierId,
            Quantity = request.Quantity,
            DateIn = request.DateIn,
            Notes = request.Notes,
            UserId = userId
        };

        await _purchaseProductRepository.AddAsync(purchase);
        await _purchaseProductRepository.SaveChangesAsync();

        await _productService.UpdateStockAsync(request.ProductId, request.Quantity);

        return MapToResponse(purchase);
    }

    public async Task<PurchaseProductResponse?> UpdateAsync(UpdatePurchaseProductRequest request)
    {
        var userId = _userContext.GetUserId();
        var purchase = await _purchaseProductRepository.GetByIdAndUserAsync(request.Id, userId);
        if (purchase == null) return null;

        var oldQuantity = purchase.Quantity;
        purchase.ProductId = request.ProductId;
        purchase.SupplierId = request.SupplierId;
        purchase.Quantity = request.Quantity;
        purchase.DateIn = request.DateIn;
        purchase.Notes = request.Notes;

        _purchaseProductRepository.Update(purchase);
        await _purchaseProductRepository.SaveChangesAsync();

        var diff = request.Quantity - oldQuantity;
        if (diff != 0)
            await _productService.UpdateStockAsync(request.ProductId, diff);

        return MapToResponse(purchase);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var purchase = await _purchaseProductRepository.GetByIdAndUserAsync(id, userId);
        if (purchase == null) return false;

        await _productService.UpdateStockAsync(purchase.ProductId, -purchase.Quantity);

        _purchaseProductRepository.Delete(purchase);
        await _purchaseProductRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<PurchaseProductResponse>> GetByProductAsync(int productId)
    {
        var userId = _userContext.GetUserId();
        var purchases = await _purchaseProductRepository.GetByProductIdAndUserAsync(productId, userId);
        return purchases.Select(MapToResponse).ToList();
    }

    public async Task<List<PurchaseProductResponse>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        var userId = _userContext.GetUserId();
        var purchases = await _purchaseProductRepository.GetByDateRangeAndUserAsync(from, to, userId);
        return purchases.Select(MapToResponse).ToList();
    }

    private static PurchaseProductResponse MapToResponse(PurchaseProduct p) => new()
    {
        Id = p.Id,
        ProductId = p.ProductId,
        ProductName = p.Product?.Name ?? "",
        SupplierId = p.SupplierId,
        SupplierName = p.Supplier?.Name ?? "",
        Quantity = p.Quantity,
        DateIn = p.DateIn,
        Notes = p.Notes
    };
}
