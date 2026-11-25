using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelApprovals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TravelPolicies_Departments_DepartmentId",
                table: "TravelPolicies");

            migrationBuilder.DropIndex(
                name: "IX_TravelPolicies_DepartmentId",
                table: "TravelPolicies");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "TravelPolicies");

            migrationBuilder.CreateTable(
                name: "TravelApprovals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TravelRequestId = table.Column<int>(type: "int", nullable: false),
                    ApprovalType = table.Column<int>(type: "int", nullable: false),
                    ApprovalStatus = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    ApproverEmployeeId = table.Column<int>(type: "int", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ActionDateUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelApprovals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TravelApprovals_Employees_ApproverEmployeeId",
                        column: x => x.ApproverEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelApprovals_TravelRequests_TravelRequestId",
                        column: x => x.TravelRequestId,
                        principalTable: "TravelRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TravelApprovals_ApproverEmployeeId",
                table: "TravelApprovals",
                column: "ApproverEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelApprovals_TravelRequestId_ApprovalType",
                table: "TravelApprovals",
                columns: new[] { "TravelRequestId", "ApprovalType" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TravelApprovals");

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "TravelPolicies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TravelPolicies_DepartmentId",
                table: "TravelPolicies",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_TravelPolicies_Departments_DepartmentId",
                table: "TravelPolicies",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
