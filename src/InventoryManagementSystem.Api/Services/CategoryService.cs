using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUserContextService _userContext;

    public CategoryService(ICategoryRepository categoryRepository, IUserContextService userContext)
    {
        _categoryRepository = categoryRepository;
        _userContext = userContext;
    }

    public async Task<List<CategoryResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var categories = await _categoryRepository.GetByUserIdAsync(userId);
        return categories.Select(c => new CategoryResponse
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            ProductCount = c.Products.Count
        }).ToList();
    }

    public async Task<CategoryResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var category = await _categoryRepository.GetByIdAndUserAsync(id, userId);
        if (category == null) return null;

        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ProductCount = category.Products.Count
        };
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
    {
        var userId = _userContext.GetUserId();
        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            UserId = userId
        };

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        };
    }

    public async Task<CategoryResponse?> UpdateAsync(UpdateCategoryRequest request)
    {
        var userId = _userContext.GetUserId();
        var category = await _categoryRepository.GetByIdAndUserAsync(request.Id, userId);
        if (category == null) return null;

        category.Name = request.Name;
        category.Description = request.Description;

        _categoryRepository.Update(category);
        await _categoryRepository.SaveChangesAsync();

        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ProductCount = category.Products.Count
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var category = await _categoryRepository.GetByIdAndUserAsync(id, userId);
        if (category == null) return false;

        _categoryRepository.Delete(category);
        await _categoryRepository.SaveChangesAsync();
        return true;
    }
}
