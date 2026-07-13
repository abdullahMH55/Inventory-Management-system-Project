using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class UpdateCategoryRequest
{
    [Required]
    public int Id { get; set; }

    [Required, StringLength(255)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
