using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TravelMode",
                table: "TravelRequests",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_TravelRequests_TravelClass",
                table: "TravelRequests",
                sql: "(\r\n    TravelMode = 1\r\n    AND FlightClass IS NOT NULL\r\n    AND TrainClass IS NULL\r\n)\r\nOR\r\n(\r\n    TravelMode = 2\r\n    AND FlightClass IS NULL\r\n    AND TrainClass IS NOT NULL\r\n)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_TravelRequests_TravelClass",
                table: "TravelRequests");

            migrationBuilder.AlterColumn<int>(
                name: "TravelMode",
                table: "TravelRequests",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
