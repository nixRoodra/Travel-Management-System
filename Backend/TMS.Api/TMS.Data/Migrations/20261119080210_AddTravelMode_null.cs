using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelMode_null : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FlightClass",
                table: "TravelRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrainClass",
                table: "TravelRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TravelMode",
                table: "TravelRequests",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlightClass",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "TrainClass",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "TravelMode",
                table: "TravelRequests");
        }
    }
}
