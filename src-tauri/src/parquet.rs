// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

use polars::prelude::*;
use tauri::ipc::Response as IpcResponse;

#[derive(Clone)]
pub struct ParquetFile {
    lf: LazyFrame,
}

impl ParquetFile {
    pub fn open(path: &String) -> PolarsResult<Self> {
        let lf = LazyFrame::scan_parquet(PlRefPath::new(path), Default::default())?;
        Ok(Self { lf })
    }

    pub fn serialise_table(&self) -> PolarsResult<IpcResponse> {
        let mut df = self.lf.clone().limit(1_000).collect()?;

        let mut buf = Vec::new();
        IpcWriter::new(&mut buf).finish(&mut df)?;

        Ok(IpcResponse::new(buf))
    }
}
