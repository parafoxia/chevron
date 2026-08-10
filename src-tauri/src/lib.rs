// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

mod parquet;

use parquet::ParquetFile;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::ipc::Response as IpcResponse;
use tauri::{Manager, State};

#[derive(Default)]
struct Files(HashMap<String, ParquetFile>);

fn access_file(files: &State<'_, Mutex<Files>>, path: &String) -> ParquetFile {
    files
        .lock()
        .unwrap()
        .0
        .entry(path.clone())
        .or_insert_with(|| ParquetFile::open(path).expect("Failed to open Parquet file"))
        .clone()
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn read_table(files: State<'_, Mutex<Files>>, path: String) -> IpcResponse {
    access_file(&files, &path)
        .serialise_table()
        .expect("Failed to serialise table")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(Files::default()));
            Ok(())
        })
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_version, read_table])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
