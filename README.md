# Icon Sur: macOS Big Sur Adaptive Icon Generator

![](https://img.shields.io/npm/v/iconsur) ![](https://img.shields.io/github/last-commit/rikumi/iconsur)

`iconsur` is a command line tool to easily generate macOS Big Sur styled adaptive icons for third-party apps.

The generation is based on the most related iOS app from the App Store, or, if there isn't one, is created from the original icon, in which case the background color and the scaling can be customized.

![image](https://user-images.githubusercontent.com/5051300/85924963-3b889c00-b8c8-11ea-957a-bf10f5efa068.png)

## Usage

You need to have latest Node.js installed:

```sh
brew install nodejs
```

Install `iconsur` from NPM:

```sh
npm i -g iconsur
```

Start generating your first adaptive app icon:

```sh
sudo iconsur set /Applications/Microsoft\ Word.app/

# Update the system icon cache and reload Finder & Dock
sudo iconsur cache

# Then the new icon will appear, and will last until the App is updated next time.
```

This will search for the App Store and use the most related iOS App. For apps from the Mac App Store, `sudo` is required to set the alternative icon.

By default, the name for the macOS App is used to search for a corresponding iOS App. You can change the keyword by specifying `-k`/`--keyword`.

For apps that does not have a corresponding iOS App, an irrelevant app may be found. In these cases, you may need to specify the `-l`/`--local` option to forcibly generate an icon locally:

```sh
sudo iconsur set /Applications/Visual\ Studio\ Code.app/ -l
sudo iconsur cache
```

By default, the original app icon is scaled by 0.9 and is applied to a white background. You may like to change the scaling and background color of the icon:

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

## Known Issues

- The iOS app search is provided by the App Store (America) which means some apps, although existing, may not be found. Currently there's no point in changing this for me myself because the App Store (China) does not provide the very search page to get the same thing done.
- During generation of local adaptive icons, some original `.icns` file may be created in bad or unsupported formats, which will raise an error, for example `No icon was found in file AppIcon.icns` or `Unsupported MIME type: image/jp2`.

## Credits

Thanks to [LiteIcon](https://freemacsoft.net/liteicon/) for the original inspiration, and [fileicon by mklement0](https://github.com/mklement0/fileicon) for the script for icon customization.