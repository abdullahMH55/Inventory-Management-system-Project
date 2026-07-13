namespace InventoryManagementSystem.Api.DTOs.Responses;

public class SaleProductResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime DateOut { get; set; }
    public string? Notes { get; set; }
}
