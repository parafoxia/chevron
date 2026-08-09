# Chevron

A Parquet reader. Very much a WIP!

## Building

Building Chevron requires [cargo-about](https://github.com/EmbarkStudios/cargo-about),
which collects the licences of the Rust crates Chevron ships:

```sh
cargo install cargo-about
```

`npm run tauri build` then runs `npm run licenses` for you. `npm run tauri dev` does
not, so cargo-about is only needed for release builds.

## License

Chevron is licensed under [MIT](LICENSES/MIT.txt) OR [Apache 2.0](LICENSES/Apache-2.0.txt), at your option.

### Third-party licenses

Chevron bundles third-party npm packages and Rust crates. `npm run licenses`
generates `src-tauri/resources/THIRD-PARTY-LICENSES.txt` from `package-lock.json` and
`Cargo.lock`, covering only what the build being made actually ships. That file is
bundled with every release and can be opened from the app's menubar.

The file is never committed — it is regenerated on every build so it cannot drift from
the lockfiles. In CI the generator runs strictly, failing the build if a dependency
introduces a licence that is not listed in [`src-tauri/about.toml`](src-tauri/about.toml),
or ships without a licence text and is not allowlisted in
[`attributions/manifest.json`](attributions/manifest.json). That file also carries
attributions for anything in neither lockfile, such as the interface font.
