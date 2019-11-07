# vortex-sfm

## Vortex support for Source Filmmaker

### Introduction

The vortex-sfm project is intended to simplify managing external assets for SFM (for non-Workshop content) using Vortex. This allows for installing external models, maps or any other supported content as a Vortex-compatible mod.

> Full details of the extension project and how to get started are available at [vortex-sfm.silveredgold.vip](vortex-sfm.silveredgold.vip)

The project currently consists of three components: two Vortex extensions and a standalone tool. The two extensions are simply different ways of managing SFM mods, one enforcing more separation, the other merging all content into a single SFM mod. Finally, the tool can be used to programmatically add a mod to the `usermod` search paths, something that usually requires manually launching the SFM SDK to perform.

### Vortex Extensions

#### `game-sourcefilmmaker`

This extension is the primary focus of the project. The extension adds SFM as a supported game to Vortex where it can be maanged like any other Vortex-managed game. Since Nexus doesn't support/host SFM mods, you won't be able to use the Nexus-specific Vortex features, but you can download and install ZIP archives (including from SFMLab). Click "Install From File" to install your SFM "mod".

#### `game-sourcefilmmaker-alt`

This is an alternative method of managing SFM mods. The main extension (above) will install mods into a single mod folder so SFM will see them all as one large mod. This version uses Vortex's support for separate mod folders to deploy each archive as its own mod. This does mean that hotfixes and partial upgrades won't work, but SFM will be able to see each installed mod as its own mod.

#### Search Paths Updater (`uspu`)

This standalone command-line app can be used to "enable" Vortex-installed mods. This tool simply adds the mod in question to the `usermod` search paths used by SFM to find content. This is the same step/process that is generally done from the "Edit Search Paths for Selected Mod" feature of the SFM SDK.

If you do not use this tool, you will still need to follow the usual "Launch SDK..." steps to enable mods after they've been installed in Vortex. If you have this tool installed, simply launch it from the Vortex dashboard after you have installed any mods.
