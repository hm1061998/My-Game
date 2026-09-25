using System.Security.Cryptography;
using System.Text;

namespace OfficeCaseFiles.Api.Application;

public static class SessionToken
{
    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
