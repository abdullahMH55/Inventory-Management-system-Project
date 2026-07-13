using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class UpdateSaleRequest
{
    [Required]
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public List<CreateSaleProductRequest>? SaleProducts { get; set; }
}
