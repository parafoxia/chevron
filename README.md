# Chevron

A simple Parquet viewer and soon-to-be editor.

⚠️ Chevron is still very early in development, and so may contain bugs and incomplete features.

## Installation

Chevron is available as a standalone binary for Windows, macOS, and Linux. You can download it from the [releases page](https://github.com/parafoxia/chevron/releases).

For the most part, these binaries are unsigned, so you'll need to jump though some hoops to get these running. If you'd rather not deal with that, scroll down to the _Building from source_ section.

### Windows

SmartScreen will try and get in your way, but that is really your only obstacle.

### macOS
You will need to allow Chevron to open via the Privacy & Security settings:

1. Open the Setting app
2. Open the Privacy & Security tab
3. Scroll down to the Security section
4. Click "Open anyway"

### Linux
Chevron supports NVIDIA + Wayland setups [with some workarounds](./src-tauri/src/main.rs#L17), and probably only because that's my setup! It's entirely possible the app won't render correctly on your setup -- if that's the case, open an issue.

Only the AppImage has been tested. 

## Building from source

To build from source, you will need to install [NPM](https://www.npmjs.com/) and [Rust](https://rust-lang.org/). Once you have those, you can run the following commands:

```sh
git clone https://github.com/parafoxia/chevron
cd chevron
npm install
npm run tauri build
```

This will build binaries (or setup executables) for your operating system.

On Arch, you may need to run `NO_STRIP=1 npm run tauri build -- --bundles=appimage` instead.

## License

Chevron is licensed under [MIT](LICENSES/MIT.txt) OR [Apache 2.0](LICENSES/Apache-2.0.txt), at your option.
