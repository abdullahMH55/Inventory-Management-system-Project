namespace InventoryManagementSystem.Api.Models;

public class PurchaseProduct
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime DateIn { get; set; }
    public string? Notes { get; set; }

    public Product Product { get; set; } = null!;
}
