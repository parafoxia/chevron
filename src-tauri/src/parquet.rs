// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

use polars::prelude::*;
use std::fs::File;
use tauri::ipc::Response as IpcResponse;

pub struct ParquetFile {
    pub path: String,
    frame: DataFrame,
}

impl ParquetFile {
    pub fn open(path: String) -> PolarsResult<Self> {
        let mut file = File::open(&path)?;
        let df = ParquetReader::new(&mut file).finish()?;

        Ok(Self {
            path: path,
            frame: df,
        })
    }

    pub fn serialise(&self) -> PolarsResult<IpcResponse> {
        let mut buf = Vec::new();
        IpcWriter::new(&mut buf).finish(&mut self.frame.clone())?;

        Ok(IpcResponse::new(buf))
    }
}
