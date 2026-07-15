namespace InventoryManagementSystem.Api.Exceptions;

/// <summary>A referenced entity does not exist or does not belong to the caller. Maps to 404.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

/// <summary>The request conflicts with existing data, e.g. deleting a row other rows depend on. Maps to 409.</summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

/// <summary>A business rule was violated, e.g. insufficient stock. Maps to 400.</summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}
