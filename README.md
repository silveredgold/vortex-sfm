# vortex-sfm

## Vortex support for Source Filmmaker

### Introduction

The vortex-sfm project is intended to simplify managing external assets for SFM (for non-Workshop content) using Vortex. This allows for installing external models, maps or any other supported content as a Vortex-compatible mod.

The project currently consists of three components: two Vortex extensions and a standalone tool. The two extensions are simply different ways of managing SFM mods, one enforcing more separation, the other merging all content into a single SFM mod. Finally, the tool can be used to programmatically add a mod to the `usermod` search paths, something that usually requires manually launching the SFM SDK to perform.

### Vortex Extensions

#### `game-sourcefilmmaker`

This extension is the primary focus of the project. The extension adds SFM as a supported game to Vortex where it can be maanged like any other Vortex-managed game. Since Nexus doesn't support/host SFM mods, you won't be able to use the Nexus-specific Vortex features, but you can download and install ZIP archives (including from SFMLab). Click "Install From File" to install your SFM "mod".

##### Known Issues

- Hotfix packages don't work. Since they get installed as their own mod, they won't work. This limitation is why `game-sfmusermod` started development.
- Updates are sort of sketchy. This is also true for the merged mod (below). The problem is that mod authors will generally distribute updates with different filenames, which confuses Vortex into thinking they're a whole new mod.

#### `game-sfmusermod`

This is an experimental WIP as an alternative method of mod management. The main extension will deploy mods into their own folders, so SFM will see them as individual mods. This version uses Vortex's support for merged mods to a single `vortex` mod folder. Using this method, SFM will see only one mod ('vortex') that contains the content from every Vortex-installed mod. Aside from anything else, this would enable support for both hotfixes and shared mod resources using Vortex's built-in conflict management.

This version of the extension is still very much work-in-progress and not ready for use.

#### Search Paths Updater (`uspu`)

This standalone command-line app can be used to "enable" Vortex-installed mods. This tool simply adds the mod in question to the `usermod` search paths used by SFM to find content. This is the same step/process that is generally done from the "" feature of the SFM SDK.

If you do not use this tool, you will still need to follow the usual "Launch SDK..." steps to enable mods after they've been installed in Vortex. If you have this tool installed, simply launch it from the Vortex dashboard after you have installed any mods.