---
title: "Search Paths"
weight: 33
anchor: "search-paths"
---

As with any mod installed for SFM, whether manually or using SFM for Vortex, you will need to tell SFM about your new mod. You can do this manually or try the experimental auto-update.

### Manual Method

You need to enable the search paths for Vortex mods just like you would any other mod you have installed. Open the SFM SDK, by clicking Launch in your Steam library and selecting “Launch SDK” when prompted. In the SDK window that appears, click “Edit Search Paths for Selected Mod” and ensuring that the entry for `vortex` is checked (this is your Merged mods) and any other mods you have installed with Vortex (Isolated mods will appear separately). Close the SDK and relaunch SFM.

### Experimental Updater

SFM for Vortex includes an experimental feature that can automatically update your search paths for you. Once you enable the "*Enable paths update on deploy*" option in **Settings ➡ Mods ➡ Automatic search paths configuration**, Vortex will try and update the configured search paths whenever you deploy. This feature is still highly experimental, but should enable the merged `vortex` mod as well as any Vortex-managed mods you have installed in isolated mode, without affecting the rest of your configured search paths.

{{< block tip >}}
Automatic path updates are experimental and probably still have bugs I haven't spotted. Please report any issues you find [on GitHub](https://github.com/silveredgold/vortex-sfm/issues).
{{< /block >}}