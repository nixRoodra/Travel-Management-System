using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeGradesAndTravelPolicies_null : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GradeId",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmployeeGrades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GradeCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    GradeName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeGrades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TravelPolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PolicyType = table.Column<int>(type: "int", nullable: false),
                    NumericValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FlightClass = table.Column<int>(type: "int", nullable: true),
                    TrainClass = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    GradeId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EffectiveFromUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    EffectiveToUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelPolicies", x => x.Id);
                    table.CheckConstraint("CK_TravelPolicies_PolicyValue", "(\r\n    PolicyType = 1\r\n    AND NumericValue IS NOT NULL\r\n    AND NumericValue > 0\r\n    AND FlightClass IS NULL\r\n    AND TrainClass IS NULL\r\n)\r\nOR\r\n(\r\n    PolicyType = 2\r\n    AND NumericValue IS NULL\r\n    AND FlightClass IS NOT NULL\r\n    AND TrainClass IS NULL\r\n)\r\nOR\r\n(\r\n    PolicyType = 3\r\n    AND NumericValue IS NULL\r\n    AND FlightClass IS NULL\r\n    AND TrainClass IS NOT NULL\r\n)");
                    table.ForeignKey(
                        name: "FK_TravelPolicies_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TravelPolicies_EmployeeGrades_GradeId",
                        column: x => x.GradeId,
                        principalTable: "EmployeeGrades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "EmployeeGrades",
                columns: new[] { "Id", "GradeCode", "GradeName" },
                values: new object[,]
                {
                    { 1, "G1", "Junior" },
                    { 2, "G2", "Associate" },
                    { 3, "G3", "Senior" },
                    { 4, "G4", "Manager" },
                    { 5, "G5", "Head of Department (HOD)" },
                    { 6, "G6", "Manager" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_GradeId",
                table: "Employees",
                column: "GradeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeGrades_GradeCode",
                table: "EmployeeGrades",
                column: "GradeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TravelPolicies_DepartmentId",
                table: "TravelPolicies",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelPolicies_GradeId",
                table: "TravelPolicies",
                column: "GradeId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelPolicies_PolicyType_IsActive",
                table: "TravelPolicies",
                columns: new[] { "PolicyType", "IsActive" });

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_EmployeeGrades_GradeId",
                table: "Employees",
                column: "GradeId",
                principalTable: "EmployeeGrades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_EmployeeGrades_GradeId",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "TravelPolicies");

            migrationBuilder.DropTable(
                name: "EmployeeGrades");

            migrationBuilder.DropIndex(
                name: "IX_Employees_GradeId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "GradeId",
                table: "Employees");
        }
    }
}
