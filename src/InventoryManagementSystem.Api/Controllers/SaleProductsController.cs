using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.Services;

namespace InventoryManagementSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SaleProductsController : ControllerBase
{
    private readonly ISaleProductService _saleProductService;

    public SaleProductsController(ISaleProductService saleProductService)
    {
        _saleProductService = saleProductService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _saleProductService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _saleProductService.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleProductRequest request)
    {
        var result = await _saleProductService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSaleProductRequest request)
    {
        if (id != request.Id) return BadRequest("Id mismatch");
        var result = await _saleProductService.UpdateAsync(request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _saleProductService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("bySale/{saleId}")]
    public async Task<IActionResult> GetBySale(int saleId) =>
        Ok(await _saleProductService.GetBySaleAsync(saleId));
}
