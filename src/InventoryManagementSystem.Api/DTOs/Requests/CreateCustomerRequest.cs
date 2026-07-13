using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

public class CreateCustomerRequest
{
    [Required, StringLength(255)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress, StringLength(255)]
    public string? Email { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }

    public string? Address { get; set; }
}
