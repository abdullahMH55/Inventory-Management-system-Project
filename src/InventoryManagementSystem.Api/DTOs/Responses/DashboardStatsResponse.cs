namespace InventoryManagementSystem.Api.DTOs.Responses;

public class DashboardStatsResponse
{
    public int TotalProducts { get; set; }
    public int TotalStockUnits { get; set; }
    public decimal InventoryValue { get; set; }
    public decimal SalesValue { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int CategoriesCount { get; set; }
    public int CustomersCount { get; set; }
    public int SuppliersCount { get; set; }
    public int SalesCount { get; set; }
    public int PurchasesCount { get; set; }
    public int LowStockThreshold { get; set; }
}
