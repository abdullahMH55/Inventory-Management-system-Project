using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class CreateCategoryRequest
{
    [Required, StringLength(255)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
