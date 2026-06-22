namespace InventoryManagementSystem.Api.Models;

public class Sale
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }

    public Customer Customer { get; set; } = null!;
}
