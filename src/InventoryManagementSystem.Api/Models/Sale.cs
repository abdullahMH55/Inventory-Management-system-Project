namespace InventoryManagementSystem.Api.Models;

public class Sale
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
    public int UserId { get; set; }

    public Customer Customer { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<SaleProduct> SaleProducts { get; set; } = new List<SaleProduct>();
}
