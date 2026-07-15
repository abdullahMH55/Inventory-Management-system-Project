using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Exceptions;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _saleRepository;
    private readonly ISaleProductRepository _saleProductRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserContextService _userContext;

    public SaleService(
        ISaleRepository saleRepository,
        ISaleProductRepository saleProductRepository,
        IProductRepository productRepository,
        ICustomerRepository customerRepository,
        IUserContextService userContext)
    {
        _saleRepository = saleRepository;
        _saleProductRepository = saleProductRepository;
        _productRepository = productRepository;
        _customerRepository = customerRepository;
        _userContext = userContext;
    }

    private async Task EnsureCustomerOwnedAsync(int customerId, int userId)
    {
        var customer = await _customerRepository.GetByIdAndUserAsync(customerId, userId);
        if (customer == null)
            throw new NotFoundException($"Customer with id {customerId} not found");
    }

    public async Task<List<SaleResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var sales = await _saleRepository.GetByUserIdAsync(userId);
        return sales.Select(MapToResponse).ToList();
    }

    public async Task<SaleResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var sale = await _saleRepository.GetByIdAndUserAsync(id, userId);
        return sale == null ? null : MapToResponse(sale);
    }

    public async Task<SaleResponse> CreateAsync(CreateSaleRequest request)
    {
        var userId = _userContext.GetUserId();
        await EnsureCustomerOwnedAsync(request.CustomerId, userId);

        decimal totalPrice = 0;

        // Validate each product against the SUM of its lines, not each line against
        // full stock. Two lines of 6 against stock 10 must be rejected together,
        // otherwise the per-line decrement below drives stock negative.
        var quantityByProduct = request.SaleProducts
            .GroupBy(sp => sp.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(sp => sp.Quantity));

        foreach (var (productId, totalQuantity) in quantityByProduct)
        {
            var product = await _productRepository.GetByIdAndUserAsync(productId, userId)
                ?? throw new NotFoundException($"Product with id {productId} not found");

            if (product.Stock < totalQuantity)
                throw new BusinessRuleException($"Insufficient stock for product '{product.Name}'");

            totalPrice += product.Price * totalQuantity;
        }

        var sale = new Sale
        {
            CustomerId = request.CustomerId,
            Date = request.Date,
            TotalPrice = totalPrice,
            Status = request.Status,
            UserId = userId
        };

        await _saleRepository.AddAsync(sale);
        await _saleRepository.SaveChangesAsync();

        foreach (var sp in request.SaleProducts)
        {
            var saleProduct = new SaleProduct
            {
                SaleId = sale.Id,
                ProductId = sp.ProductId,
                Quantity = sp.Quantity,
                DateOut = sp.DateOut,
                Notes = sp.Notes,
                UserId = userId
            };

            await _saleProductRepository.AddAsync(saleProduct);

            var product = await _productRepository.GetByIdAndUserAsync(sp.ProductId, userId);
            if (product != null)
            {
                product.Stock -= sp.Quantity;
                _productRepository.Update(product);
            }
        }

        await _saleProductRepository.SaveChangesAsync();

        // Re-read so the response carries the customer name and hydrated lines.
        var created = await _saleRepository.GetByIdAndUserAsync(sale.Id, userId);
        return MapToResponse(created ?? sale);
    }

    // Header-only patch. Line items cannot be edited by any endpoint: doing so
    // would need to reverse and re-apply stock in one transaction, which this
    // API does not have. To change lines, delete the sale (stock is restored)
    // and record it again.
    public async Task<SaleResponse?> PatchAsync(int id, PatchSaleRequest request)
    {
        var userId = _userContext.GetUserId();
        var sale = await _saleRepository.GetByIdAndUserAsync(id, userId);
        if (sale == null) return null;

        if (request.CustomerId is int customerId)
        {
            await EnsureCustomerOwnedAsync(customerId, userId);
            sale.CustomerId = customerId;
        }
        if (request.Date is DateTime date) sale.Date = date;
        if (request.Status is not null) sale.Status = request.Status;

        _saleRepository.Update(sale);
        await _saleRepository.SaveChangesAsync();

        var updated = await _saleRepository.GetByIdAndUserAsync(sale.Id, userId);
        return MapToResponse(updated ?? sale);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var sale = await _saleRepository.GetByIdAndUserAsync(id, userId);
        if (sale == null) return false;

        var saleProducts = await _saleProductRepository.GetBySaleIdAndUserAsync(id, userId);
        foreach (var sp in saleProducts)
        {
            var product = await _productRepository.GetByIdAndUserAsync(sp.ProductId, userId);
            if (product != null)
            {
                product.Stock += sp.Quantity;
                _productRepository.Update(product);
            }
            _saleProductRepository.Delete(sp);
        }

        _saleRepository.Delete(sale);
        await _saleRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<SaleResponse>> GetByCustomerAsync(int customerId)
    {
        var userId = _userContext.GetUserId();
        var sales = await _saleRepository.GetByCustomerIdAndUserAsync(customerId, userId);
        return sales.Select(MapToResponse).ToList();
    }

    public async Task<List<SaleResponse>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        var userId = _userContext.GetUserId();
        var sales = await _saleRepository.GetByDateRangeAndUserAsync(from, to, userId);
        return sales.Select(MapToResponse).ToList();
    }

    private static SaleResponse MapToResponse(Sale s) => new()
    {
        Id = s.Id,
        CustomerId = s.CustomerId,
        CustomerName = s.Customer?.Name ?? "",
        Date = s.Date,
        TotalPrice = s.TotalPrice,
        Status = s.Status,
        SaleProducts = s.SaleProducts?.Select(sp => new SaleProductResponse
        {
            Id = sp.Id,
            ProductId = sp.ProductId,
            ProductName = sp.Product?.Name ?? "",
            Quantity = sp.Quantity,
            DateOut = sp.DateOut,
            Notes = sp.Notes
        }).ToList() ?? new()
    };
}
