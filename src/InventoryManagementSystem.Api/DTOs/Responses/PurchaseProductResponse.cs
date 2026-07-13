namespace InventoryManagementSystem.Api.DTOs.Responses;

public class PurchaseProductResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime DateIn { get; set; }
    public string? Notes { get; set; }
}
