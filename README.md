# Icon Sur: macOS Big Sur Adaptive Icon Generator

`iconsur` is a command line tool to easily generate macOS Big Sur styled adaptive icons for third-party apps.

The generation is based on the most related iOS App from the App Store, or, if there isn't one, is created from the original icon, in which case the background color and the scaling can be customized.

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

Start generating your first adaptive App icon:

```sh
sudo iconsur set /Applications/Microsoft\ Word.app/

# Update the system icon cache and reload Finder & Dock
sudo iconsur cache

# Then the new icon will appear, and will last until the App is updated next time.
```

This will search for the App Store and use the most related iOS App. For Apps from the Mac App Store, `sudo` is required to set the alternative icon.

By default, the name for the macOS App is used to search for a corresponding iOS App. You can change the keyword by specifying `-n`/`--name`.

For Apps that does not have a corresponding iOS App, an irrelevant App may be found. In these cases, you may need to specify the `-l`/`--local` option to forcibly generate an icon locally:

```sh
sudo iconsur set /Applications/Visual\ Studio\ Code.app/ -l
sudo iconsur cache
```

By default, the original App icon is scaled by 0.9 and is applied to a white background. You may like to change the scaling and background color of the icon:

```sh
sudo iconsur set /Applications/Visual\ Studio\ Code.app/ -l -s 0.8 -c 87cdf0
sudo iconsur cache
```

## Known Issues

- During generation of local adaptive icons, some original `.icns` file may be created in bad formats which will raise an error, such as `No icon was found in file AppIcon.icns` or `Unsupported MIME type: image/jp2`.
