using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _saleRepository;
    private readonly ISaleProductRepository _saleProductRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUserContextService _userContext;

    public SaleService(
        ISaleRepository saleRepository,
        ISaleProductRepository saleProductRepository,
        IProductRepository productRepository,
        IUserContextService userContext)
    {
        _saleRepository = saleRepository;
        _saleProductRepository = saleProductRepository;
        _productRepository = productRepository;
        _userContext = userContext;
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
        decimal totalPrice = 0;

        foreach (var sp in request.SaleProducts)
        {
            var product = await _productRepository.GetByIdAndUserAsync(sp.ProductId, userId)
                ?? throw new KeyNotFoundException($"Product with id {sp.ProductId} not found");

            if (product.Stock < sp.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product '{product.Name}'");

            totalPrice += product.Price * sp.Quantity;
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

        return MapToResponse(sale);
    }

    public async Task<SaleResponse?> UpdateAsync(UpdateSaleRequest request)
    {
        var userId = _userContext.GetUserId();
        var sale = await _saleRepository.GetByIdAndUserAsync(request.Id, userId);
        if (sale == null) return null;

        sale.CustomerId = request.CustomerId;
        sale.Date = request.Date;
        sale.Status = request.Status;

        _saleRepository.Update(sale);
        await _saleRepository.SaveChangesAsync();

        return MapToResponse(sale);
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
