using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class CreateSaleRequest
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [Required, MinLength(1)]
    public List<CreateSaleProductRequest> SaleProducts { get; set; } = new();
}
