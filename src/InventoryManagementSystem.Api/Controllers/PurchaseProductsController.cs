using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.Services;

namespace InventoryManagementSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PurchaseProductsController : ControllerBase
{
    private readonly IPurchaseProductService _purchaseProductService;

    public PurchaseProductsController(IPurchaseProductService purchaseProductService)
    {
        _purchaseProductService = purchaseProductService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _purchaseProductService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _purchaseProductService.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseProductRequest request)
    {
        // Domain errors (product/supplier not found, insufficient stock on a later
        // adjustment) are typed exceptions mapped to 404/400 by ExceptionMiddleware.
        var result = await _purchaseProductService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePurchaseProductRequest request)
    {
        if (id != request.Id) return BadRequest("Id mismatch");
        var result = await _purchaseProductService.UpdateAsync(request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _purchaseProductService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("byProduct/{productId}")]
    public async Task<IActionResult> GetByProduct(int productId) =>
        Ok(await _purchaseProductService.GetByProductAsync(productId));

    [HttpGet("byDateRange")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime from, [FromQuery] DateTime to) =>
        Ok(await _purchaseProductService.GetByDateRangeAsync(from, to));
}
