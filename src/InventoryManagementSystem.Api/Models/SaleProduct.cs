namespace InventoryManagementSystem.Api.Models;

public class SaleProduct
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime DateOut { get; set; }
    public string? Notes { get; set; }
    public int SaleId { get; set; }
    public int UserId { get; set; }

    public Product Product { get; set; } = null!;
    public Sale Sale { get; set; } = null!;
    public User User { get; set; } = null!;
}
