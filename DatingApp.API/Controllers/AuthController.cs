using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers {
    [Route ("/api/[controller]")]
    public class AuthController : Controller {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _config;
        public AuthController (IAuthRepository authRepository, IConfiguration config) {
            _config = config;
            _authRepository = authRepository;
        }

        [HttpPost ("register")]
        public async Task<IActionResult> Register ([FromBody] UserForRegisterDto userForRegisterDto) {
            if (!string.IsNullOrWhiteSpace (userForRegisterDto.Username))
                userForRegisterDto.Username = userForRegisterDto.Username.ToLower ();
            if (await _authRepository.UserExists (userForRegisterDto.Username))
                ModelState.AddModelError ("Username", "Username already taken");

            //validate the data sent from the form
            if (!ModelState.IsValid)
                return BadRequest (ModelState);

            var userToCreate = new User {
                Username = userForRegisterDto.Username
            };

            var createdUser = await _authRepository.RegisterUser (userToCreate, userForRegisterDto.Password);

            return StatusCode (201);
        }

        [HttpPost ("login")]
        public async Task<IActionResult> Login ([FromBody] UserForLoginDto userForLoginDto) {
            //throw new Exception ("Computer says no!!!");

            var userFromAuthRepository = await _authRepository.Login (userForLoginDto.Username.ToLower (), userForLoginDto.Password);

            if (userFromAuthRepository == null)
                return Unauthorized ();

            // generate token using JSON Web Tokens
            var tokenHanlder = new JwtSecurityTokenHandler ();
            var key = Encoding.ASCII.GetBytes (_config.GetSection ("AppSettings:Token").Value);
            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity (new Claim[] {
                new Claim (ClaimTypes.NameIdentifier, userFromAuthRepository.Id.ToString ()),
                new Claim (ClaimTypes.Name, userForLoginDto.Username)
                }),
                Expires = DateTime.Now.AddDays (1),
                SigningCredentials = new SigningCredentials (new SymmetricSecurityKey (key),
                SecurityAlgorithms.HmacSha512Signature)
            };

            var token = tokenHanlder.CreateToken (tokenDescriptor);
            var tokenString = tokenHanlder.WriteToken (token);

            return Ok (new { tokenString });
        }
    }
}