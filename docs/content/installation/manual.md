---
title: "Manual"
linkTitle: "Manual Installation"
weight: 23
---

{{< block warn >}}
Only attempt this if you absolutely have to. It becomes much harder to debug and much harder to upgrade.
{{< /block >}}

If you don’t want to enable Advanced Mode for Vortex or want to install the extension yourself, you will have to install the extension files manually. Make sure you close Vortex before proceeding.

First, unpack the archive to somewhere convenient. You should have a directory named `game-sourcefilmmaker` with three files inside:

- `info.json`
- `index.js`
- `gameart.png`

Now, copy the whole *directory* to your Vortex folder. You can easily open your Vortex folder by opening a new File Explorer window and entering the following in to the location bar: `%APPDATA%/Vortex` and then opening the `plugins` directory (create it if it doesn’t exist).

Once you’re done, you should have three files at the following locations:

```text
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\game-sourcefilmmaker\info.json
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\game-sourcefilmmaker\index.js
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\game-sourcefilmmaker\gameart.png
```
