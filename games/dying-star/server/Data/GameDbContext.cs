using DyingStar.Server.Domain;
using Microsoft.EntityFrameworkCore;

namespace DyingStar.Server.Data;

public sealed class GameDbContext(DbContextOptions<GameDbContext> options) : DbContext(options)
{
    public DbSet<PlayerEntity> Players => Set<PlayerEntity>();
    public DbSet<ArkEntity> Arks => Set<ArkEntity>();
    public DbSet<BuildingEntity> Buildings => Set<BuildingEntity>();
    public DbSet<ResourceLedgerEntity> ResourceLedger => Set<ResourceLedgerEntity>();
    public DbSet<ActionReceiptEntity> ActionReceipts => Set<ActionReceiptEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlayerEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.GuestTokenHash).IsUnique();
            entity.Property(x => x.GuestTokenHash).HasMaxLength(128);
            entity.HasOne(x => x.Ark)
                .WithOne(x => x.Player)
                .HasForeignKey<ArkEntity>(x => x.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ArkEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.NexusLevel).HasDefaultValue(1);
        });

        modelBuilder.Entity<BuildingEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.ArkId, x.Type }).IsUnique();
            entity.Property(x => x.Type).HasConversion<string>().HasMaxLength(48);
            entity.HasOne(x => x.Ark)
                .WithMany(x => x.Buildings)
                .HasForeignKey(x => x.ArkId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ResourceLedgerEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ResourceType).HasConversion<string>().HasMaxLength(32);
            entity.Property(x => x.Reason).HasMaxLength(128);
            entity.Property(x => x.ActionId).HasMaxLength(128);
            entity.HasIndex(x => x.ActionId).IsUnique();
            entity.HasOne(x => x.Ark)
                .WithMany(x => x.ResourceLedger)
                .HasForeignKey(x => x.ArkId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ActionReceiptEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ActionId).HasMaxLength(128);
            entity.Property(x => x.ActionType).HasMaxLength(64);
            entity.HasIndex(x => new { x.PlayerId, x.ActionId }).IsUnique();
            entity.HasOne(x => x.Player)
                .WithMany(x => x.ActionReceipts)
                .HasForeignKey(x => x.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
