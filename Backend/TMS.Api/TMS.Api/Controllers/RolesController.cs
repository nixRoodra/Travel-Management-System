using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Services;

namespace TMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;
        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        // GET: api/roles
        [HttpGet]
        public async Task<ActionResult<List<Role>>> GetAllRolesAsync()
        {
            var roles = await _roleService.GetAllRolesAsync();

            return Ok(roles);
        }

        // GET: api/roles/id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Role>> GetRoleByIdAsync(int id)
        { 
            var role = await _roleService.GetRoleByIdAsync(id);

            if (role == null) 
            {
                return NotFound(new { message = $"Role {id} not Found" });
            }

            return Ok(role);

        }

    }
}




//public class RolesController(IRoleService roleService) : ControllerBase
//Less boilerplate, same constructor dependency injection pattern.