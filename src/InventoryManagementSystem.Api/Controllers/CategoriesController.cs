using Microsoft.AspNetCore.Mvc;

namespace InventoryManagementSystem.Api.Controllers;

[Route("[controller]")]
[ApiController]
public class CategoriesController 
{

    [HttpGet]
    public string Get()
    {
        return "s";
    }
}
