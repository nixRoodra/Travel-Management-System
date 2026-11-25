using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExpenseClaimReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExpenseClaimReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExpenseClaimId = table.Column<int>(type: "int", nullable: false),
                    FinanceEmployeeId = table.Column<int>(type: "int", nullable: false),
                    Decision = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseClaimReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpenseClaimReviews_Employees_FinanceEmployeeId",
                        column: x => x.FinanceEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExpenseClaimReviews_ExpenseClaims_ExpenseClaimId",
                        column: x => x.ExpenseClaimId,
                        principalTable: "ExpenseClaims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseClaimReviews_ExpenseClaimId",
                table: "ExpenseClaimReviews",
                column: "ExpenseClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseClaimReviews_ExpenseClaimId_ReviewedAtUtc",
                table: "ExpenseClaimReviews",
                columns: new[] { "ExpenseClaimId", "ReviewedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseClaimReviews_FinanceEmployeeId",
                table: "ExpenseClaimReviews",
                column: "FinanceEmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExpenseClaimReviews");
        }
    }
}
