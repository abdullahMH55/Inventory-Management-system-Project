namespace InventoryManagementSystem.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public int UserId { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
