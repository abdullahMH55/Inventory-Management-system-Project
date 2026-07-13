using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.Services;

namespace InventoryManagementSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _productService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _productService.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var result = await _productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest request)
    {
        if (id != request.Id) return BadRequest("Id mismatch");
        var result = await _productService.UpdateAsync(request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _productService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("byCategory/{categoryId}")]
    public async Task<IActionResult> GetByCategory(int categoryId) =>
        Ok(await _productService.GetByCategoryAsync(categoryId));

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string name) =>
        Ok(await _productService.SearchAsync(name));
}
