using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Exceptions;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUserContextService _userContext;

    public ProductService(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IUserContextService userContext)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _userContext = userContext;
    }

    // A CategoryId must exist AND belong to the caller. Without this the FK would
    // 500 on a bad id, and a valid id owned by another user would silently attach.
    private async Task EnsureCategoryOwnedAsync(int categoryId, int userId)
    {
        var category = await _categoryRepository.GetByIdAndUserAsync(categoryId, userId);
        if (category == null)
            throw new NotFoundException($"Category with id {categoryId} not found");
    }

    public async Task<List<ProductResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var products = await _productRepository.GetByUserIdAsync(userId);
        return products.Select(MapToResponse).ToList();
    }

    public async Task<ProductResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var product = await _productRepository.GetByIdAndUserAsync(id, userId);
        return product == null ? null : MapToResponse(product);
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
    {
        var userId = _userContext.GetUserId();
        await EnsureCategoryOwnedAsync(request.CategoryId, userId);

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = request.CategoryId,
            UserId = userId
        };

        await _productRepository.AddAsync(product);
        await _productRepository.SaveChangesAsync();

        // Re-read so the response carries the category name (the created entity's
        // Category navigation was never loaded).
        var created = await _productRepository.GetByIdAndUserAsync(product.Id, userId);
        return MapToResponse(created ?? product);
    }

    public async Task<ProductResponse?> UpdateAsync(UpdateProductRequest request)
    {
        var userId = _userContext.GetUserId();
        var product = await _productRepository.GetByIdAndUserAsync(request.Id, userId);
        if (product == null) return null;

        await EnsureCategoryOwnedAsync(request.CategoryId, userId);

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.CategoryId = request.CategoryId;

        _productRepository.Update(product);
        await _productRepository.SaveChangesAsync();

        var updated = await _productRepository.GetByIdAndUserAsync(product.Id, userId);
        return MapToResponse(updated ?? product);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var product = await _productRepository.GetByIdAndUserAsync(id, userId);
        if (product == null) return false;

        _productRepository.Delete(product);
        try
        {
            await _productRepository.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // A NoAction FK from sale_products / purchase_products still references it.
            throw new ConflictException(
                "Cannot delete a product that appears in sales or purchases. Delete those records first.");
        }
        return true;
    }

    public async Task<List<ProductResponse>> GetByCategoryAsync(int categoryId)
    {
        var userId = _userContext.GetUserId();
        var products = await _productRepository.GetByCategoryIdAndUserAsync(categoryId, userId);
        return products.Select(MapToResponse).ToList();
    }

    public async Task<List<ProductResponse>> SearchAsync(string name)
    {
        var userId = _userContext.GetUserId();
        var products = await _productRepository.SearchByNameAndUserAsync(name, userId);
        return products.Select(MapToResponse).ToList();
    }

    public async Task UpdateStockAsync(int productId, int quantityChange)
    {
        var userId = _userContext.GetUserId();
        var product = await _productRepository.GetByIdAndUserAsync(productId, userId)
            ?? throw new NotFoundException($"Product with id {productId} not found");

        product.Stock += quantityChange;
        if (product.Stock < 0)
            throw new BusinessRuleException("Insufficient stock");

        _productRepository.Update(product);
        await _productRepository.SaveChangesAsync();
    }

    private static ProductResponse MapToResponse(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Stock = p.Stock,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? ""
    };
}
