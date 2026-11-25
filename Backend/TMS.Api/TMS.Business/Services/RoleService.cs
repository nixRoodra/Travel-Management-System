using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;

namespace TMS.Business.Services
{
    public class RoleService:IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public Task<List<Role>> GetAllRolesAsync()
        {
            return _roleRepository.GetAllRolesAsync();
        }

        public Task<Role?> GetRoleByIdAsync(int id) 
        {
            return _roleRepository.GetRoleByIdAsync(id);
        }

    }
}
