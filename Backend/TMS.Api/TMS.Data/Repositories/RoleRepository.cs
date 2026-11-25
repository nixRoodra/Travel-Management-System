using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class RoleRepository: IRoleRepository
    {
        private readonly ApplicationDbContext _context;
        public RoleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            //AsNoTracking()  Read - only queries
            return await _context.Roles.AsNoTracking().ToListAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(int id) 
        {
            return await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
