<span align="center">
  
# IconSur: macOS Big Sur Adaptive Icon Generator

<a href="https://www.npmjs.com/package/iconsur"><img title="npm version" src="https://badgen.net/npm/v/iconsur" ></a>
<a href="https://www.npmjs.com/package/iconsur"><img title="npm downloads" src="https://badgen.net/npm/dt/iconsur" ></a>
<a href="https://github.com/rikumi/iconsur/commit"><img title="github commits" src="https://badgen.net/github/last-commit/rikumi/iconsur" ></a>

</p>

</span>

`iconsur` is a command line tool to easily generate macOS Big Sur styled adaptive icons for third-party apps.

The generation is based on the most related iOS app from the App Store, or, if there isn't one, is created from the original icon, in which case the background color and the scaling can be customized.

![image](https://user-images.githubusercontent.com/5051300/85926574-ebfb9d80-b8d2-11ea-836b-28e38d1f3447.png)

## Usage

Download the `iconsur` binary for macOS x64 from [Releases](https://github.com/rikumi/iconsur/releases), `chmod +x` and include it in your PATH.

Start generating your first adaptive app icon:

```sh
sudo iconsur set /Applications/Microsoft\ Word.app/

# Update the system icon cache and reload Finder & Dock
sudo iconsur cache

# Then the new icon will appear, and will last until the App is updated next time.
```

This will search for the App Store and use the most related iOS app. For apps from the Mac App Store, `sudo` is required to set the alternative icon.

By default, the name for the macOS app is used to search for a corresponding iOS app. You can change the keyword by specifying `-k`/`--keyword`.

If your app only has a corresponding iOS app in non-America store, you may like to specify the 2-letter country code with option `-r`/`--region`.

```sh
sudo iconsur set /Applications/QQMusic.app/ -r cn
sudo iconsur cache
```

For apps that does not have a corresponding iOS app, an irrelevant app can be found. In these cases, you may need to specify the `-l`/`--local` option to forcibly generate an icon locally:

```sh
sudo iconsur set /Applications/Visual\ Studio\ Code.app/ -l
sudo iconsur cache
```

You can also use your own original icon with the `-i`/`--input` option. Here IconSur plays the part of adding the background, masking the icon into continuous corners, and adding correct paddings around the masked icon.

```sh
sudo iconsur set /Applications/Visual\ Studio\ Code.app/ -l -i /path/to/your/icon
sudo iconsur cache
```

By default, the original app icon is scaled by 0.9 and is applied to a white background. You may like to change the scaling and background color of the icon. However, if the original icon is opaque, it will not get scaled down in case you specify an original opaque iOS icon from an app developer or a jailbreak icon pack.

```sh
sudo iconsur set /Applications/Visual\ Studio\ Code.app/ -l -s 0.8 -c 87cdf0
sudo iconsur cache
```

To remove the icon previously set for a specific app, use the `unset` subcommand:

```sh
sudo iconsur unset /Applications/Microsoft\ Word.app/
sudo iconsur unset /Applications/Visual\ Studio\ Code.app/
sudo iconsur cache
```

## Example

See [my personal iconsur setup](https://gist.github.com/rikumi/e2ac39882a7dcd29642f29343da5a54a) as an example.

## Credits

Thanks to [LiteIcon](https://freemacsoft.net/liteicon/) for the original inspiration, and [fileicon by mklement0](https://github.com/mklement0/fileicon) for the script for icon customization.
