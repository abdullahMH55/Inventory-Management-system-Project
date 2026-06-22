namespace InventoryManagementSystem.Api.Models;

public class SaleProduct
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime DateOut { get; set; }
    public string? Notes { get; set; }

    public Product Product { get; set; } = null!;
}
