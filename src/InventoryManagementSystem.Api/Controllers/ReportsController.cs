using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryManagementSystem.Api.Services;

namespace InventoryManagementSystem.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // from/to are optional (absent = all time), unlike the required-range byDateRange endpoints.
    [HttpGet("topProducts")]
    public async Task<IActionResult> GetTopProducts(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int limit = 5) =>
        Ok(await _reportService.GetTopProductsAsync(from, to, limit));

    [HttpGet("salesSummary")]
    public async Task<IActionResult> GetSalesSummary(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string groupBy = "day") =>
        Ok(await _reportService.GetSalesSummaryAsync(from, to, groupBy));
}
