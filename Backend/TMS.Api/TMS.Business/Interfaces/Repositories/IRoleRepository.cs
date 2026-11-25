using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories
{
    public interface IRoleRepository
    {
        Task<List<Role>> GetAllRolesAsync();

        Task<Role?> GetRoleByIdAsync(int id);
    }
}
