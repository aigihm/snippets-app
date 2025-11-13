# App Icons Needed

To complete the iOS app setup, create icons in these sizes:

## Quick Generate (Easiest)

Go to **[realfavicongenerator.net](https://realfavicongenerator.net/)**:
1. Upload a 512x512 PNG of your logo/icon
2. Download the generated package
3. Copy icons to `public/` folder

## Manual Creation

Create a square image (no transparency for iOS) and export in these sizes:

### iOS (Apple Touch Icons)
- `public/icon-180.png` - 180x180px (iPhone)
- `public/icon-167.png` - 167x167px (iPad Pro)
- `public/icon-152.png` - 152x152px (iPad)
- `public/icon-120.png` - 120x120px (iPhone Retina)

### PWA Icons
- `public/icon-512.png` - 512x512px (high res)
- `public/icon-384.png` - 384x384px
- `public/icon-192.png` - 192x192px (Android)
- `public/icon-144.png` - 144x144px
- `public/icon-128.png` - 128x128px
- `public/icon-96.png` - 96x96px
- `public/icon-72.png` - 72x72px

## Design Tips

**Good Icon Design:**
- Simple, recognizable symbol
- Works at small sizes
- High contrast
- Solid background color (Spotify green #1DB954?)
- White symbol/text

**Icon Ideas for Snippets:**
- 🎙️ Microphone icon
- 🎧 Headphones
- ▶️ Play button with audio waves
- "S" letter in modern font
- Waveform visualization

## Quick Placeholder

For testing, you can use a solid color square:
```bash
# Create a simple colored icon (requires ImageMagick)
convert -size 512x512 xc:'#1DB954' -pointsize 200 -fill white -gravity center -annotate +0+0 'S' public/icon-512.png
```

## Or Use Figma/Canva

1. Create 512x512 artboard
2. Add background color (#1DB954)
3. Add white icon/text
4. Export as PNG
5. Use realfavicongenerator.net to generate all sizes

## Free Icon Resources

- [Flaticon](https://www.flaticon.com/) - Free icons
- [Icons8](https://icons8.com/) - Free icons
- [Heroicons](https://heroicons.com/) - Free SVG icons
- [Feather Icons](https://feathericons.com/) - Minimalist icons

Once you have your 512px icon, the generator will create all sizes automatically!
