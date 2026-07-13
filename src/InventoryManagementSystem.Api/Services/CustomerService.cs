using InventoryManagementSystem.Api.DTOs.Requests;
using InventoryManagementSystem.Api.DTOs.Responses;
using InventoryManagementSystem.Api.Models;
using InventoryManagementSystem.Api.Repositories;

namespace InventoryManagementSystem.Api.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserContextService _userContext;

    public CustomerService(ICustomerRepository customerRepository, IUserContextService userContext)
    {
        _customerRepository = customerRepository;
        _userContext = userContext;
    }

    public async Task<List<CustomerResponse>> GetAllAsync()
    {
        var userId = _userContext.GetUserId();
        var customers = await _customerRepository.GetByUserIdAsync(userId);
        return customers.Select(MapToResponse).ToList();
    }

    public async Task<CustomerResponse?> GetByIdAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var customer = await _customerRepository.GetByIdAndUserAsync(id, userId);
        return customer == null ? null : MapToResponse(customer);
    }

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request)
    {
        var userId = _userContext.GetUserId();
        var customer = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            UserId = userId
        };

        await _customerRepository.AddAsync(customer);
        await _customerRepository.SaveChangesAsync();

        return MapToResponse(customer);
    }

    public async Task<CustomerResponse?> UpdateAsync(UpdateCustomerRequest request)
    {
        var userId = _userContext.GetUserId();
        var customer = await _customerRepository.GetByIdAndUserAsync(request.Id, userId);
        if (customer == null) return null;

        customer.Name = request.Name;
        customer.Email = request.Email;
        customer.Phone = request.Phone;
        customer.Address = request.Address;

        _customerRepository.Update(customer);
        await _customerRepository.SaveChangesAsync();

        return MapToResponse(customer);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _userContext.GetUserId();
        var customer = await _customerRepository.GetByIdAndUserAsync(id, userId);
        if (customer == null) return false;

        _customerRepository.Delete(customer);
        await _customerRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<CustomerResponse>> SearchAsync(string name)
    {
        var userId = _userContext.GetUserId();
        var customers = await _customerRepository.SearchByNameAndUserAsync(name, userId);
        return customers.Select(MapToResponse).ToList();
    }

    private static CustomerResponse MapToResponse(Customer c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Email = c.Email,
        Phone = c.Phone,
        Address = c.Address
    };
}
