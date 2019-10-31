using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using static System.IO.Path;

namespace UpdateSearchPaths
{
    public class ModLocator
    {
        private readonly string _path;
        private const string ManagedFileName = "_folder_managed_by_vortex";
        private readonly List<string> _supportedTypes = new List<string> {"materials", "models", "sound", "settings", "maps"};

        public ModLocator(string gamePath)
        {
            _path = Combine(gamePath, "game");
        }

        public IEnumerable<string> FindVortexMods()
        {
            return GetDirectoriesForCondition(d =>
                d.GetFiles("*", SearchOption.TopDirectoryOnly)
                    .Any(f => f.Name.ToLower().Equals(ManagedFileName)));
//            var fsi = new DirectoryInfo(_path)
//                .EnumerateDirectories()
//                .Where(d =>
//                    d.GetFiles("*", SearchOption.TopDirectoryOnly)
//                        .Any(f => f.Name.ToLower().Equals(ManagedFileName)));
//            return fsi.Select(d => d.Name);
        }

        public IEnumerable<string> FindAllMods()
        {
            var fsi = GetDirectoriesForCondition(d => d.GetDirectories().Any(sd => _supportedTypes.Any(t => sd.Name.ToLower().Equals(t))));
            return fsi;
        }

        private IEnumerable<string> GetDirectoriesForCondition(Func<DirectoryInfo, bool> predicate)
        {
            var fsi = new DirectoryInfo(_path)
                .EnumerateDirectories()
                .Where(predicate);
            return fsi.Select(d => d.Name);
        }
    }
}