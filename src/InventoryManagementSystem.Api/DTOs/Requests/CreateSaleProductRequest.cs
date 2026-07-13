using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class CreateSaleProductRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    public DateTime DateOut { get; set; }

    public string? Notes { get; set; }
}
