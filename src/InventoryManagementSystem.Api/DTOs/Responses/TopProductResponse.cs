namespace InventoryManagementSystem.Api.DTOs.Responses;

public class TopProductResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
}
