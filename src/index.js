#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const glob = require('glob');
const jimp = require('jimp');
const plist = require('plist');
const icns = require('icns-lib');
const cheerio = require('cheerio');
const { program } = require('commander');
const { default: fetch } = require('node-fetch');

const { version } = require('../package.json');

process.on('unhandledRejection', (e) => { throw e });
process.on('uncaughtException', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

program.name('iconsur');
program.version(version);
program.option('-l, --local', 'Directly create an icon locally without searching for an iOS App');
program.option('-k, --keyword <keyword>', 'Specify custom keyword to search for an iOS App');
program.option('-s, --scale <float>', 'Specify scale for adaptive icon (default: 0.9)');
program.option('-c, --color <hex>', 'Specify color for adaptive icon (default: ffffff)');

program.command('set <dir> [otherDirs...]').action(async (dir, otherDirs) => {
  if (!otherDirs.length && ~dir.indexOf('*')) {
    [dir, ...otherDirs] = glob.sync(dir);
  }

  for (let appDir of [dir, ...otherDirs]) {
    console.log(`Processing ${appDir}...`);

    appDir = path.resolve(process.cwd(), appDir);
    if (!fs.statSync(appDir).isDirectory()) {
      console.error(`${appDir}: No such directory`);
      process.exit(1);
    }
    
    if (!appDir.endsWith('.app')) {
      console.error(`${appDir}: Not an App directory`);
      process.exit(1);
    }
    
    let appName = program.keyword;
    let srcIconFile;
    
    try {
      const infoPlist = path.join(appDir, 'Contents/Info.plist');
      const infoPlistContents = plist.parse(fs.readFileSync(infoPlist, 'utf-8'));
      if (!appName) {
        appName = infoPlistContents['CFBundleDisplayName'] || path.basename(appDir).replace(/\.app$/, '');
      }
      srcIconFile = path.resolve(appDir, 'Contents/Resources', infoPlistContents['CFBundleIconFile']);
      if (!/\.icns$/.test(srcIconFile)) {
        srcIconFile += '.icns';
      }
    } catch (e) {
      if (!program.keyword) {
        console.log(`Plist file might be corrupted; using fallback name and AppIcon.icns as default icon location.`);
        console.log('Re-run with option -n or --name to specify custom app name to search for.');
      } else {
        console.log(`Plist file might be corrupted; using AppIcon.icns as default icon location.`);
      }
      appName = path.basename(appDir).replace(/\.app$/, '');
      srcIconFile = path.resolve(appDir, 'Contents/Resources/AppIcon.icns');
    }
    
    const imageSize = 256;
    const iconPadding = Math.floor(imageSize * 0.1);
    const iconSize = imageSize - 2 * iconPadding;
    const originalIconScaleSize = parseFloat(program.scale || '0.9');
    const mask = (await jimp.read(path.resolve(__dirname, 'mask.png'))).resize(iconSize, iconSize);
    let resultIcon;
    let iOSApp = null;
  
    if (!program.local) {
      console.log(`Searching iOS App with name: ${appName}`);
      const safeName = encodeURIComponent(appName.replace(/\s+/g, '-'));
      const res = await fetch(`https://www.apple.com/search/${safeName}?page=1&sel=explore&src=globalnav`);
      const $ = cheerio.load(await res.text());
      iOSApp = $('.as-explore-product');
    }
  
    if (iOSApp && iOSApp.length) {
      const appName = iOSApp.find('.as-productname').eq(0).text();
      const iconUrl = iOSApp.find('.as-explore-img').eq(0).attr('src');
      console.log(`Found iOS app: ${appName} with icon: ${iconUrl}`);
      console.log(`If this app is incorrect, specify the correct name with -k or --keyword, or generate an icon locally with option -l or --local`);
      const res = await fetch(iconUrl);
      const iconData = await res.buffer();
      const unmaskedImage = (await jimp.read(iconData)).resize(iconSize, iconSize);
      resultIcon = unmaskedImage.mask(mask, 0, 0);
    } else {
      if (!program.local) {
        console.log(`Cannot find iOS App with name: ${appName}`);
      }

      console.log(`Generating adaptive icon...`);
      if (!fs.existsSync(srcIconFile)) {
        console.error(`Cannot find icon at ${srcIconFile}`);
        process.exit(1);
      }
      
      const scalePosition = iconSize * (1 - originalIconScaleSize) / 2;
      const iconBuffer = Object.entries(icns.parse(fs.readFileSync(srcIconFile)))
        .filter(([k]) => icns.isImageType(k))
        .map(([, v]) => v)
        .sort((a, b) => b.length - a.length)[0];
      
      if (!iconBuffer) {
        console.error(`No icon was found in file ${srcIconFile}`);
        process.exit(1);
      }
      const originalIcon = (await jimp.read(iconBuffer)).resize(iconSize * originalIconScaleSize, iconSize * originalIconScaleSize);
      resultIcon = (await jimp.create(iconSize, iconSize, program.color || '#ffffff')).composite(originalIcon, scalePosition, scalePosition).mask(mask, 0, 0);
    }
  
    const image = (await jimp.create(imageSize, imageSize, 0)).composite(resultIcon, iconPadding, iconPadding);
    const tmpFile = path.resolve(os.tmpdir(), `tmp-${Math.random().toFixed(16).substr(2, 6)}.png`);
    await image.writeAsync(tmpFile);
  
    const { status } = cp.spawnSync(path.join(__dirname, 'fileicon.sh'), ['set', appDir, tmpFile], { stdio: 'inherit' });
    if (status) {
      console.error(`Failed to set custom icon: fileicon script exited with error ${status}`);
      process.exit(1);
    }

    console.log(`Successfully set icon for ${appDir}\n`);
  };
});

program.command('unset <dir> [otherDirs...]').action(async (dir, otherDirs) => {
  if (!otherDirs.length && ~dir.indexOf('*')) {
    [dir, ...otherDirs] = glob.sync(dir);
  }

  for (let appDir of [dir, ...otherDirs]) {
    const { status } = cp.spawnSync(path.join(__dirname, 'fileicon.sh'), ['rm', appDir], { stdio: 'inherit' });
    if (status) {
      console.error(`Failed to remove custom icon: fileicon script exited with error ${status}`);
      process.exit(1);
    }
  }
});

program.command('cache').action(() => {
  try {
    cp.execSync('sudo rm -rf /Library/Caches/com.apple.iconservices.store', { stdio: 'inherit' });
  } catch (e) { }
  
  try {
    cp.execSync('sudo find /private/var/folders/ \\( -name com.apple.dock.iconcache -or -name com.apple.iconservices \\) -exec rm -rf {} \\;', { stdio: 'inherit' });
  } catch (e) { }
  
  cp.execSync('sleep 3; sudo touch /Applications/*', { stdio: 'inherit' });
  cp.execSync('killall Dock', { stdio: 'inherit' });
  cp.execSync('killall Finder', { stdio: 'inherit' });
  process.exit();
});

program.parse(process.argv);
