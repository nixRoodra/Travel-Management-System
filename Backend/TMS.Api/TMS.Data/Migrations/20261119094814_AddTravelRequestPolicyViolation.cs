using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelRequestPolicyViolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TravelRequestPolicyViolations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TravelRequestId = table.Column<int>(type: "int", nullable: false),
                    TravelPolicyId = table.Column<int>(type: "int", nullable: true),
                    PolicyType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ActualValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AllowedValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DetectedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelRequestPolicyViolations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TravelRequestPolicyViolations_TravelPolicies_TravelPolicyId",
                        column: x => x.TravelPolicyId,
                        principalTable: "TravelPolicies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TravelRequestPolicyViolations_TravelRequests_TravelRequestId",
                        column: x => x.TravelRequestId,
                        principalTable: "TravelRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequestPolicyViolations_TravelPolicyId",
                table: "TravelRequestPolicyViolations",
                column: "TravelPolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_TravelRequestPolicyViolations_TravelRequestId",
                table: "TravelRequestPolicyViolations",
                column: "TravelRequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TravelRequestPolicyViolations");
        }
    }
}
