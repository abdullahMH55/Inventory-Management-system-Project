using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.Services;

namespace InventoryManagementSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _saleService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _saleService.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest request)
    {
        // Domain errors (product not found, insufficient stock, bad customer) are
        // thrown as typed exceptions and mapped to 404/400 by ExceptionMiddleware.
        var result = await _saleService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Patch(int id, [FromBody] PatchSaleRequest request)
    {
        var result = await _saleService.PatchAsync(id, request);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _saleService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("byCustomer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId) =>
        Ok(await _saleService.GetByCustomerAsync(customerId));

    [HttpGet("byDateRange")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime from, [FromQuery] DateTime to) =>
        Ok(await _saleService.GetByDateRangeAsync(from, to));
}
