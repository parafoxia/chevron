// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

use polars::prelude::*;
use tauri::ipc::Response as IpcResponse;

pub struct ParquetFile {
    path: String,
}

impl ParquetFile {
    pub fn open(path: String) -> PolarsResult<Self> {
        Ok(Self { path })
    }

    pub fn scan(&self) -> PolarsResult<LazyFrame> {
        LazyFrame::scan_parquet(PlRefPath::new(&self.path), Default::default())
    }

    pub fn serialise_table(&self) -> PolarsResult<IpcResponse> {
        let mut df = self.scan()?.limit(1_000).collect()?;

        let mut buf = Vec::new();
        IpcWriter::new(&mut buf).finish(&mut df)?;

        Ok(IpcResponse::new(buf))
    }
}
