using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Enums;

namespace TMS.Data.Context
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options):base(options) { }

        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Employee> Employees => Set<Employee>();

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        public DbSet<TravelRequest> TravelRequests => Set<TravelRequest>();

        public DbSet<TravelPolicy> TravelPolicies => Set<TravelPolicy>();

        public DbSet<EmployeeGrade> EmployeeGrades => Set<EmployeeGrade>();

        public DbSet<TravelRequestPolicyViolation> TravelRequestPolicyViolations => Set<TravelRequestPolicyViolation>();

        public DbSet<TravelApproval> TravelApprovals  => Set<TravelApproval>();

        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        public DbSet<ExpenseClaim> ExpenseClaims => Set<ExpenseClaim>();

        public DbSet<ExpenseItem> ExpenseItems => Set<ExpenseItem>();

        public DbSet<ExpenseReceipt> ExpenseReceipts => Set<ExpenseReceipt>();

        public DbSet<ExpenseClaimReview> ExpenseClaimReviews => Set<ExpenseClaimReview>();

        public DbSet<Reimbursement> Reimbursements => Set<Reimbursement>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithOne()
                .HasForeignKey<Employee>(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Manager)
                .WithMany(e=>e.DirectReports)
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Department>()
                .HasIndex(d => d.Name)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.EmployeeCode)
                .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.UserId)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            modelBuilder.Entity<Employee>()
                .Property(e => e.TMSAccountCreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            //m2 - role seeding
            modelBuilder.Entity<Role>()
                .HasData(
                new Role { Id = 1, Name = "Employee" },
                new Role { Id = 2, Name = "Manager" },
                new Role { Id = 3, Name = "Finance" },
                new Role { Id = 4, Name = "Admin" }
                );

            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.TokenHash)
                .IsUnique();

            //m3

            modelBuilder.Entity<TravelRequest>()
                .HasOne(tr => tr.Employee)
                .WithMany(e=> e.TravelRequests)
                .HasForeignKey(tr => tr.EmployeeId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TravelRequest>()
                .Property(tr => tr.EstimatedCost)
                .HasPrecision(18, 2);


            //m4

            modelBuilder.Entity<TravelPolicy>()
                .Property(tp => tp.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<TravelPolicy>()
               .Property(tp => tp.Description)
               .IsRequired()
               .HasMaxLength(500);


            modelBuilder.Entity<TravelPolicy>()
                .Property(tp => tp.NumericValue)
                .HasPrecision(18, 2);

            modelBuilder.Entity<TravelPolicy>()
                .Property(tp => tp.EffectiveFromUtc)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("SYSUTCDATETIME()");

            modelBuilder.Entity<TravelPolicy>()
               .Property(tp => tp.EffectiveToUtc)
               .HasColumnType("datetime2")
               .IsRequired(false);

            modelBuilder.Entity<TravelPolicy>()
                .Property(tp => tp.IsActive)
                .HasDefaultValue(true);

            modelBuilder.Entity<TravelPolicy>()
                .HasIndex(tp => new { tp.PolicyType, tp.IsActive });


            modelBuilder.Entity<TravelPolicy>()
                .HasOne(tp => tp.Grade)
                .WithMany()
                .HasForeignKey(tp => tp.GradeId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Grade)
                .WithMany(g => g.Employees)
                .HasForeignKey(e => e.GradeId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<EmployeeGrade>()
                .Property(eg => eg.GradeCode)
                .IsRequired()
                .HasMaxLength(10);

            modelBuilder.Entity<EmployeeGrade>()
                .HasIndex(eg => eg.GradeCode)
                .IsUnique();

            modelBuilder.Entity<EmployeeGrade>()
                .Property(eg => eg.GradeName)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<TravelPolicy>()
                .ToTable(table =>
                    table.HasCheckConstraint(
                        "CK_TravelPolicies_PolicyValue",
                        """
                        (
                            PolicyType = 1
                            AND NumericValue IS NOT NULL
                            AND NumericValue > 0
                            AND FlightClass IS NULL
                            AND TrainClass IS NULL
                        )
                        OR
                        (
                            PolicyType = 2
                            AND NumericValue IS NULL
                            AND FlightClass IS NOT NULL
                            AND TrainClass IS NULL
                        )
                        OR
                        (
                            PolicyType = 3
                            AND NumericValue IS NULL
                            AND FlightClass IS NULL
                            AND TrainClass IS NOT NULL
                        )
                        """));


            modelBuilder.Entity<EmployeeGrade>().HasData(
                new EmployeeGrade { Id = 1, GradeCode = "G1", GradeName = "Junior" },
                new EmployeeGrade { Id = 2, GradeCode = "G2", GradeName = "Associate" },
                new EmployeeGrade { Id = 3, GradeCode = "G3", GradeName = "Senior" },
                new EmployeeGrade { Id = 4, GradeCode = "G4", GradeName = "Manager" },
                new EmployeeGrade { Id = 5, GradeCode = "G5", GradeName = "Head of Department (HOD)" },
                new EmployeeGrade { Id = 6, GradeCode = "G6", GradeName = "Manager" }
            );

            //m5

            modelBuilder.Entity<TravelRequest>()
                .ToTable(table =>
                    table.HasCheckConstraint(
                        "CK_TravelRequests_TravelClass",
                        """
                        (
                            TravelMode = 1
                            AND FlightClass IS NOT NULL
                            AND TrainClass IS NULL
                        )
                        OR
                        (
                            TravelMode = 2
                            AND FlightClass IS NULL
                            AND TrainClass IS NOT NULL
                        )
                        """));

            //m6
            modelBuilder.Entity<TravelRequestPolicyViolation>()
                    .HasOne(v => v.TravelRequest)
                    .WithMany()
                    .HasForeignKey(v => v.TravelRequestId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TravelRequestPolicyViolation>()
                    .HasOne(v => v.TravelPolicy)
                    .WithMany()
                    .HasForeignKey(v => v.TravelPolicyId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.SetNull);

            //m7

            modelBuilder.Entity<TravelApproval>(entity =>
            {
                entity.HasOne(approval => approval.TravelRequest)
                .WithMany()
                .HasForeignKey(approval => approval.TravelRequestId)
                .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(approval => approval.ApproverEmployee)
                .WithMany()
                .HasForeignKey(approval => approval.ApproverEmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

                entity.Property(ta => ta.Comments)
                .HasMaxLength(1000);

                entity.Property(ta => ta.ApprovalStatus)
                .HasDefaultValue(ApprovalStatus.Pending);

                entity.Property(ta => ta.CreatedAtUtc)
                .HasDefaultValueSql("SYSUTCDATETIME()")
                .HasColumnType("datetime2");

                entity.Property(ta => ta.ActionDateUtc)
                .HasColumnType("datetime2");

                entity.Property(a => a.RowVersion)
                .IsRowVersion();

                entity.HasIndex(ta => new
                {
                    ta.ApproverEmployeeId,
                    ta.ApprovalType,
                    ta.ApprovalStatus
                });

                entity.HasIndex(ta => new
                {
                    ta.TravelRequestId,
                    ta.ApprovalType
                });

            });

            //m8

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.Property(a => a.Action)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(a => a.EntityName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(a => a.EntityId)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(a => a.OccurredAtUtc)
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.Property(a => a.CorrelationId)
                    .HasMaxLength(100);

                entity.HasOne(a => a.User)
                    .WithMany()
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(a => new { a.EntityName, a.EntityId });
                entity.HasIndex(a => a.UserId);
                entity.HasIndex(a => a.OccurredAtUtc);
                entity.HasIndex(a => a.CorrelationId);
            });

            //m9
            modelBuilder.Entity<ExpenseClaim>(entity =>
            {
                entity.HasOne(claim => claim.TravelRequest)
                    .WithOne()
                    .HasForeignKey<ExpenseClaim>(claim => claim.TravelRequestId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(claim => claim.Status)
                    .IsRequired()
                    .HasDefaultValue(ExpenseClaimStatus.Draft);

                entity.Property(claim => claim.CreatedAtUtc)
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.Property(claim => claim.SubmittedAtUtc)
                    .HasColumnType("datetime2");
            });

            modelBuilder.Entity<ExpenseItem>(entity =>
            {
                entity.HasOne(item => item.ExpenseClaim)
                    .WithMany(claim => claim.ExpenseItems)
                    .HasForeignKey(item => item.ExpenseClaimId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(item => item.Description)
                   .IsRequired()
                   .HasMaxLength(300);

                entity.Property(item => item.Amount)
                    .HasPrecision(18, 2);

                entity.ToTable(table =>
                    table.HasCheckConstraint(
                        "CK_ExpenseItems_Amount",
                        "[Amount] > 0"));
            });

            modelBuilder.Entity<ExpenseReceipt>(entity =>
            {
                entity.HasOne(receipt=>receipt.ExpenseItem)
                    .WithMany(item=>item.Receipts)
                    .HasForeignKey(receipt=>receipt.ExpenseItemId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(receipt => receipt.FileName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(receipt => receipt.FilePath)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(receipt => receipt.UploadedAtUtc)
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");
            });

            //m10

            modelBuilder.Entity<ExpenseClaimReview>(entity =>
            {
                entity.HasKey(review => review.Id);

                entity.Property(review => review.Decision)
                    .IsRequired();

                entity.Property(review => review.Comments)
                    .HasMaxLength(1000);

                entity.Property(review => review.ReviewedAtUtc)
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasOne(review => review.ExpenseClaim)
                    .WithMany()
                    .HasForeignKey(review => review.ExpenseClaimId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(review => review.FinanceEmployee)
                    .WithMany()
                    .HasForeignKey(review => review.FinanceEmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(review => review.ExpenseClaimId);

                entity.HasIndex(review => review.FinanceEmployeeId);

                entity.HasIndex(review => new
                {
                    review.ExpenseClaimId,
                    review.ReviewedAtUtc
                });
            });


            //m11

            modelBuilder.Entity<Reimbursement>(entity =>
            {
                entity.HasKey(reimbursement => reimbursement.Id);

                entity.Property(reimbursement => reimbursement.Amount)
                    .HasPrecision(18, 2)
                    .IsRequired();

                entity.Property(reimbursement => reimbursement.Status)
                    .HasDefaultValue(ReimbursementStatus.PendingPayment);

                entity.Property(reimbursement => reimbursement.CreatedAtUtc)
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.Property(reimbursement => reimbursement.PaidAtUtc)
                    .HasColumnType("datetime2");

                entity.Property(reimbursement => reimbursement.PaymentReference)
                    .HasMaxLength(100);

                // One reimbursement per expense claim
                entity.HasOne(reimbursement => reimbursement.ExpenseClaim)
                    .WithOne()
                    .HasForeignKey<Reimbursement>(reimbursement => reimbursement.ExpenseClaimId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Finance employee who recorded the payment
                entity.HasOne(reimbursement => reimbursement.PaidByEmployee)
                    .WithMany()
                    .HasForeignKey(reimbursement => reimbursement.PaidByEmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(reimbursement => reimbursement.ExpenseClaimId)
                    .IsUnique();

                entity.HasIndex(reimbursement => reimbursement.PaidByEmployeeId);

                entity.ToTable(table =>
                {
                    table.HasCheckConstraint(
                        "CK_Reimbursements_Amount",
                        "[Amount] > 0");

                    table.HasCheckConstraint(
                        "CK_Reimbursements_PaymentState",
                        """
                            (
                                [Status] = 1
                                AND [PaidAtUtc] IS NULL
                                AND [PaidByEmployeeId] IS NULL
                                AND [PaymentReference] IS NULL
                            )
                            OR
                            (
                                [Status] = 2
                                AND [PaidAtUtc] IS NOT NULL
                                AND [PaidByEmployeeId] IS NOT NULL
                            )
                            """);
                                    });


            });

        }
    }
}
