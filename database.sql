IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [users] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_users] PRIMARY KEY ([Id])
);

CREATE TABLE [categories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [Description] text NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_categories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_categories_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE TABLE [customers] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NULL,
    [Phone] nvarchar(50) NULL,
    [Address] nvarchar(max) NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_customers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_customers_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE TABLE [suppliers] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NULL,
    [Phone] nvarchar(50) NULL,
    [Address] nvarchar(max) NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_suppliers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_suppliers_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE TABLE [products] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(255) NOT NULL,
    [Description] text NULL,
    [Price] decimal(18,2) NOT NULL,
    [Stock] int NOT NULL,
    [CategoryId] int NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_products] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_products_categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [categories] ([Id]),
    CONSTRAINT [FK_products_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE TABLE [sales] (
    [Id] int NOT NULL IDENTITY,
    [CustomerId] int NOT NULL,
    [Date] datetime2 NOT NULL,
    [TotalPrice] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_sales] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_sales_customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [customers] ([Id]),
    CONSTRAINT [FK_sales_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE TABLE [purchase_products] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [SupplierId] int NOT NULL,
    [Quantity] int NOT NULL,
    [DateIn] datetime2 NOT NULL,
    [Notes] nvarchar(max) NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_purchase_products] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_purchase_products_products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [products] ([Id]),
    CONSTRAINT [FK_purchase_products_suppliers_SupplierId] FOREIGN KEY ([SupplierId]) REFERENCES [suppliers] ([Id]),
    CONSTRAINT [FK_purchase_products_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE TABLE [sale_products] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [Quantity] int NOT NULL,
    [DateOut] datetime2 NOT NULL,
    [Notes] nvarchar(max) NULL,
    [SaleId] int NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_sale_products] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_sale_products_products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [products] ([Id]),
    CONSTRAINT [FK_sale_products_sales_SaleId] FOREIGN KEY ([SaleId]) REFERENCES [sales] ([Id]),
    CONSTRAINT [FK_sale_products_users_UserId] FOREIGN KEY ([UserId]) REFERENCES [users] ([Id])
);

CREATE INDEX [IX_categories_UserId] ON [categories] ([UserId]);

CREATE INDEX [IX_customers_UserId] ON [customers] ([UserId]);

CREATE INDEX [IX_products_CategoryId] ON [products] ([CategoryId]);

CREATE INDEX [IX_products_UserId] ON [products] ([UserId]);

CREATE INDEX [IX_purchase_products_ProductId] ON [purchase_products] ([ProductId]);

CREATE INDEX [IX_purchase_products_SupplierId] ON [purchase_products] ([SupplierId]);

CREATE INDEX [IX_purchase_products_UserId] ON [purchase_products] ([UserId]);

CREATE INDEX [IX_sale_products_ProductId] ON [sale_products] ([ProductId]);

CREATE INDEX [IX_sale_products_SaleId] ON [sale_products] ([SaleId]);

CREATE INDEX [IX_sale_products_UserId] ON [sale_products] ([UserId]);

CREATE INDEX [IX_sales_CustomerId] ON [sales] ([CustomerId]);

CREATE INDEX [IX_sales_UserId] ON [sales] ([UserId]);

CREATE INDEX [IX_suppliers_UserId] ON [suppliers] ([UserId]);

CREATE UNIQUE INDEX [IX_users_Email] ON [users] ([Email]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260712071515_AddMultiTenancy', N'10.0.0-preview.3.25171.6');

COMMIT;
GO

