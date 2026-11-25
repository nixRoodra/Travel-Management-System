using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services
{
    public interface IRoleService
    {
        Task<List<Role>> GetAllRolesAsync();

        Task<Role?> GetRoleByIdAsync(int id);
    }
}
