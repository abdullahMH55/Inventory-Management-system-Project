namespace InventoryManagementSystem.Api.DTOs.Responses;

public class SalesSummaryPointResponse
{
    // "2026-07-14" for day grouping, "2026-07" for month grouping.
    public string Period { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int Count { get; set; }
}
