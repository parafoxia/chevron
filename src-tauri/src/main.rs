// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    apply_linux_display_workarounds();

    chevron_lib::run()
}

// Display-stack workarounds, applied before GTK is initialised in `run()`.
// Every variable is only set when absent, so anything set in the environment wins.
#[cfg(target_os = "linux")]
fn apply_linux_display_workarounds() {
    let on_wayland = std::env::var_os("WAYLAND_DISPLAY").is_some();

    // Force the GDK_BACKEND to use Wayland in AppImages.
    if on_wayland
        && std::env::var_os("CHEVRON_FORCE_X11").is_none()
        && std::env::var_os("APPDIR").is_some()
        && std::env::var("GDK_BACKEND").as_deref() == Ok("x11")
    {
        std::env::set_var("GDK_BACKEND", "wayland");
    }

    // Force dark theme.
    if std::env::var_os("APPDIR").is_some() && std::env::var_os("APPIMAGE_GTK_THEME").is_none() {
        std::env::set_var("GTK_THEME", "Adwaita:dark");
    }

    let on_x11 = !on_wayland || std::env::var("GDK_BACKEND").as_deref() == Ok("x11");

    // Stop the webview rendering blank on NVIDIA under X11.
    if on_x11
        && std::path::Path::new("/dev/nvidiactl").exists()
        && std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none()
    {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    // Workaround for NVIDIA + Wayland setups getting Error 71s.
    // See https://github.com/tauri-apps/tauri/issues/10702 for the open issue.
    if on_wayland && std::env::var_os("__NV_DISABLE_EXPLICIT_SYNC").is_none() {
        std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
    }
}
