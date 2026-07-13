using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class CreateProductRequest
{
    [Required, StringLength(255)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required, Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    [Required, Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [Required]
    public int CategoryId { get; set; }
}
