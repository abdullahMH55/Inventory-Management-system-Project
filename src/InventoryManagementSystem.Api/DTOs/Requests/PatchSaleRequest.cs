using System.ComponentModel.DataAnnotations;

namespace InventoryManagementSystem.Api.DTOs.Requests;

// Header-only. There is deliberately no SaleProducts field: line items cannot be
// edited, so the API must not accept a field it would silently ignore. Every
// field is optional; only the ones supplied are changed.
public class PatchSaleRequest
{
    public int? CustomerId { get; set; }

    public DateTime? Date { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }
}
