using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Gameloop.Vdf;
using Gameloop.Vdf.Linq;
using static System.IO.Path;

namespace UpdateSearchPaths
{
    public class GameInfoWriter
    {
        
        private readonly string _gamePath;
        private const string FileName = "GameInfo.txt";
        private readonly string _path;

        public GameInfoWriter(string gamePath)
        {
            _gamePath = gamePath;
            _path = Combine(gamePath, "game", "usermod", FileName);
        }

        public GameInfoWriter Backup()
        {
            var fi = new FileInfo(_path);
            fi.CopyTo($"{fi.FullName}.backup", true);
            return this;
        }

        private VProperty GetGameInfo()
        {
            var info = VdfConvert.Deserialize(File.ReadAllText(_path, Encoding.UTF8), VdfSerializerSettings.Common);
            return info;
        }

        public void EnableGame(params string[] games)
        {
            if (games.Length == 0) return;
            var info = GetGameInfo();
//            var obj = info.Value["FileSystem"]["SearchPaths"] as VObject;
            var paths = GetSearchPaths(info).Cast<VProperty>().ToList();
            foreach (var game in games) {
                var installed = paths.Any(v => v.Value.ToString() == game);
                if (!installed) {
                    GetSearchPaths(ref info).Add(new VProperty("Game", new VValue(game)));
                }
            }
            WriteGameInfo(info);
//            var updated = VdfConvert.Serialize(info);
        }

        private void WriteGameInfo(VToken info)
        {
            var updated = VdfConvert.Serialize(info, VdfSerializerSettings.Common);
            File.WriteAllText(_path, updated, Encoding.UTF8);
        }

        public void DisableGame(params string[] games)
        {
            if (games.Length == 0) return;
            var info = GetGameInfo();
            var paths = GetSearchPaths(info).Cast<VProperty>().ToList();
            foreach (var game in games) {
                var installed = paths.Any(v => v.Value.ToString() == game);
                if (installed) {
                    var existing = paths.Where(v => !string.Equals(v.Value.ToString(), game, StringComparison.CurrentCultureIgnoreCase)).Select(v => v.Value.ToString());
                    GetSearchPaths(ref info).Remove("Game");
                    foreach (var mod in existing) {
                        GetSearchPaths(ref info).Add(new VProperty("Game", new VValue(mod)));
                    }
                    paths = GetSearchPaths(info).Cast<VProperty>().ToList();
//                        .Add(new VProperty("Game", new VValue(game)));
                }
            }
            WriteGameInfo(info);
        }
        
        private static VObject GetSearchPaths(ref VProperty root)
        {
            return ((VObject) root.Value[Keys.FileSystem][Keys.SearchPaths]);
        }
        
        private static VObject GetSearchPaths(VProperty root)
        {
            return ((VObject) root.Value[Keys.FileSystem][Keys.SearchPaths]);
        }

        private struct Keys
        {
            internal const string FileSystem = "FileSystem";
            internal const string SearchPaths = "SearchPaths";
        }
    }
    
    internal static class KeyValuesExtensions
    {
        
        
        
    }
}