// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

import { open } from "@tauri-apps/plugin-dialog";

export async function selectFile(): Promise<string | null> {
  return await open({
    title: "Select a file",
    filters: [{ name: "Parquet", extensions: ["parquet"] }],
  });
}
