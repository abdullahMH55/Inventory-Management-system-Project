using Microsoft.EntityFrameworkCore;
using InventoryManagementSystem.Api.Models;

namespace InventoryManagementSystem.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<PurchaseProduct> PurchaseProducts => Set<PurchaseProduct>();
    public DbSet<SaleProduct> SaleProducts => Set<SaleProduct>();
    public DbSet<Sale> Sales => Set<Sale>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(255).IsRequired();
            e.Property(c => c.Description).HasColumnType("text");
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).HasMaxLength(255).IsRequired();
            e.Property(p => p.Description).HasColumnType("text");
            e.Property(p => p.Price).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(p => p.Stock).IsRequired();

            e.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.ToTable("customers");
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(255).IsRequired();
            e.Property(c => c.Email).HasMaxLength(255);
            e.Property(c => c.Phone).HasMaxLength(50);
        });

        modelBuilder.Entity<Supplier>(e =>
        {
            e.ToTable("suppliers");
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).HasMaxLength(255).IsRequired();
            e.Property(s => s.Email).HasMaxLength(255);
            e.Property(s => s.Phone).HasMaxLength(50);
        });

        modelBuilder.Entity<PurchaseProduct>(e =>
        {
            e.ToTable("purchase_products");
            e.HasKey(pm => pm.Id);
            e.Property(pm => pm.Quantity).IsRequired();
            e.Property(pm => pm.DateIn).IsRequired();

            e.HasOne(pm => pm.Product)
                .WithMany(p => p.PurchaseProducts)
                .HasForeignKey(pm => pm.ProductId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<SaleProduct>(e =>
        {
            e.ToTable("sale_products");
            e.HasKey(pk => pk.Id);
            e.Property(pk => pk.Quantity).IsRequired();
            e.Property(pk => pk.DateOut).IsRequired();

            e.HasOne(pk => pk.Product)
                .WithMany(p => p.SaleProducts)
                .HasForeignKey(pk => pk.ProductId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Sale>(e =>
        {
            e.ToTable("sales");
            e.HasKey(s => s.Id);
            e.Property(s => s.TotalPrice).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(s => s.Date).IsRequired();
            e.Property(s => s.Status).HasMaxLength(50);

            e.HasOne(s => s.Customer)
                .WithMany(c => c.Sales)
                .HasForeignKey(s => s.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);
        });

    }
}
