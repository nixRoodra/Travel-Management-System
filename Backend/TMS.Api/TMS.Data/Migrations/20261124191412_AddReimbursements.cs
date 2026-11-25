using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReimbursements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reimbursements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExpenseClaimId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    PaidAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaidByEmployeeId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reimbursements", x => x.Id);
                    table.CheckConstraint("CK_Reimbursements_Amount", "[Amount] > 0");
                    table.CheckConstraint("CK_Reimbursements_PaymentState", "(\r\n    [Status] = 1\r\n    AND [PaidAtUtc] IS NULL\r\n    AND [PaidByEmployeeId] IS NULL\r\n    AND [PaymentReference] IS NULL\r\n)\r\nOR\r\n(\r\n    [Status] = 2\r\n    AND [PaidAtUtc] IS NOT NULL\r\n    AND [PaidByEmployeeId] IS NOT NULL\r\n)");
                    table.ForeignKey(
                        name: "FK_Reimbursements_Employees_PaidByEmployeeId",
                        column: x => x.PaidByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reimbursements_ExpenseClaims_ExpenseClaimId",
                        column: x => x.ExpenseClaimId,
                        principalTable: "ExpenseClaims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reimbursements_ExpenseClaimId",
                table: "Reimbursements",
                column: "ExpenseClaimId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reimbursements_PaidByEmployeeId",
                table: "Reimbursements",
                column: "PaidByEmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reimbursements");
        }
    }
}
