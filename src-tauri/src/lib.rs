// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

use tauri::ipc::Response as IpcResponse;

mod parquet;

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn read_table(path: String) -> IpcResponse {
    parquet::ParquetFile::open(path)
        .expect("Failed to open Parquet file")
        .serialise_table()
        .expect("Failed to serialise table")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_version, read_table])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
