namespace InventoryManagementSystem.Api.DTOs.Responses;

public class SaleResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
    public List<SaleProductResponse> SaleProducts { get; set; } = new();
}
