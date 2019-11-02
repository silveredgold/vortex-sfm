using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Spectre.Cli;

namespace UpdateSearchPaths
{
    class Program
    {
        static int Main(string[] args)
        {
            var app = new CommandApp<EnableAllCommand>();
//            var w = new GameInfoWriter("/tmp/sfm");
//            w.Backup().EnableGame("swarm", "wot");
            app.Configure(c =>
            {
                c.SetApplicationName("Usermod Search Paths Updater");
                c.AddCommand<EnableAllCommand>("enable-all");
                c.AddCommand<EnableSingleCommand>("enable");
                c.AddCommand<DisableAllCommand>("disable-all");
                c.AddCommand<DisableSingleCommand>("disable");
            });
            return app.Run(args);
            return 0;
        }
    }

    public class EnableAllCommand : AsyncCommand<EnableAllCommand.Settings>
    {
        public class Settings : ModSettings
        {   
            [CommandOption("--all")]
            [Description("Includes all 'mods', not just Vortex-managed ones")]
            public bool IncludeAll { get; set; }

            // [CommandOption("--formatted")]
            // [Description("Enabled")]
        }

        public override Task<int> ExecuteAsync(CommandContext context, Settings settings)
        {
            var writer = new GameInfoWriter(settings.InstallPath);
            var locator = new ModLocator(settings.InstallPath);
            var modNames = (settings.IncludeAll ? locator.FindAllMods() : locator.FindVortexMods()).ToArray();
            if (modNames.Length > 0) {
                Console.WriteLine($"Enabling SearchPaths for {string.Join(";", modNames)}");
                writer.Backup().EnableGame(modNames);
                return Task.FromResult(0);
            }
            else {
                Console.WriteLine("No mods found. Exiting.");
                return Task.FromResult(404);
            }
        }
    }

    public abstract class ModSettings : CommandSettings
    {
        [Required]
        [Description("The path to the base installation folder for SFM.")]
        [CommandArgument(0, "<PATH>")]
        public string InstallPath { get; set; }
    }

    public class EnableSingleCommand : AsyncCommand<EnableSingleCommand.Settings>
    {
        public class Settings : ModSettings
        {
            [CommandArgument(1, "<MOD-NAME>")]
            public string ModName { get; set; }
        }

        public override Task<int> ExecuteAsync(CommandContext context, Settings settings)
        {
            var writer = new GameInfoWriter(settings.InstallPath);
            Console.WriteLine($"Enabling SearchPath for {settings.ModName}");
            writer.Backup().EnableGame(settings.ModName);
            return Task.FromResult(0);
        }
    }

    public class DisableAllCommand : AsyncCommand<EnableAllCommand.Settings>
    {
        public override Task<int> ExecuteAsync(CommandContext context, EnableAllCommand.Settings settings)
        {
            var locator = new ModLocator(settings.InstallPath);
            var writer = new GameInfoWriter(settings.InstallPath);
            var modNames = (settings.IncludeAll ? locator.FindAllMods() : locator.FindVortexMods()).ToArray();
            if (modNames.Length > 0) {
                Console.WriteLine($"Removing SearchPaths for {string.Join(";", modNames)}");
                writer.Backup().DisableGame(modNames);
                return Task.FromResult(0);
            }
            else {
                Console.WriteLine("No mods found. Exiting.");
                return Task.FromResult(404);
            }
//            var modNames = settings.IncludeAll ? locator.FindAllMods() : locator.FindVortexMods();
//            writer.DisableGame(modNames.ToArray());
//            return Task.FromResult(0);
        }
    }
    
    public class DisableSingleCommand : AsyncCommand<EnableSingleCommand.Settings>
    {
        public override Task<int> ExecuteAsync(CommandContext context, EnableSingleCommand.Settings settings)
        {
            var writer = new GameInfoWriter(settings.InstallPath);
            Console.WriteLine($"Removing SearchPath for {settings.ModName}");
            writer.Backup().DisableGame(settings.ModName);
            return Task.FromResult(0);
        }
    }
}
