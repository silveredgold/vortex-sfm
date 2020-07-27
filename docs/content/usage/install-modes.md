---
title: "Install Modes"
weight: 31
---

Before you get to installing your favourite mod files, there's one more thing you should know about: install modes.

Install modes were introduced in 0.1.0 and allow you to control how and where mods are installed and how they interact with SFM.

#### Merged mode

Merged mode is the default install mode for new mods and will install your mods merged into a single `vortex` folder in your SFM directory, so SFM will see them as one mod with a lot of assets. Vortex itself will still be able to managed mods independently, but SFM will not be aware of that (similar to Workshop mod content).

#### Isolated mode

Conversely, 'Isolated' mode will deploy every mod you install separately as its own mod in its own folder in your installation directory. SFM will then see each mod you install as a separate mod (named after the archive file) so you can browse your installed assets by the mod they came from.

### Choosing your mode

SFM for Vortex will default to Merged mode for new installs, but this can be changed at any time. To change the default for new installs, open the Mods tab of your Vortex settings and change the *Default SFM installation mode* setting to your preferred. You can also individually change the mode of any installed mod by changing its mod type: double-click the mod in your Mods list and use the Mod Type dropdown in the panel on the right to change its mode.

{{< block note >}}
Mods installed in 'Isolated' mode will need to be individually enabled in the SFM SDK, but Vortex can also attempt to do this automatically for you. See below.
{{< /block >}}