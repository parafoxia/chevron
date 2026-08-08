// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    disable_nvidia_explicit_sync();

    chevron_lib::run()
}

// Workaround for NVIDIA + Wayland setups getting Error 71s.
// See https://github.com/tauri-apps/tauri/issues/10702 for the open issue.
#[cfg(target_os = "linux")]
fn disable_nvidia_explicit_sync() {
    if std::env::var_os("WAYLAND_DISPLAY").is_some()
        && std::env::var_os("__NV_DISABLE_EXPLICIT_SYNC").is_none()
    {
        std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
    }
}
