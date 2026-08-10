// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

use polars::prelude::*;
use serde::Serialize;
use tauri::ipc::Response as IpcResponse;

#[derive(Clone)]
pub struct ParquetFile {
    lf: LazyFrame,
}

#[derive(Serialize)]
pub struct Column {
    name: String,
    dtype: String,
    children: Vec<Column>,
}

impl Column {
    fn new(name: String, dtype: &DataType) -> Self {
        let children = match dtype {
            DataType::List(inner) => vec![Column::new("item".to_string(), inner)],
            DataType::Array(inner, _) => vec![Column::new("item".to_string(), inner)],
            DataType::Struct(fields) => fields
                .iter()
                .map(|field| Column::new(field.name.to_string(), &field.dtype))
                .collect(),
            _ => Vec::new(),
        };

        Self {
            name,
            dtype: dtype.to_string(),
            children,
        }
    }
}

#[derive(Serialize)]
pub struct Summary {
    columns: Vec<Column>,
    shape: (usize, usize),
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

    pub fn summary(&self) -> PolarsResult<Summary> {
        let schema = self.lf.clone().collect_schema()?;
        let columns = schema
            .iter()
            .map(|(name, dtype)| Column::new(name.to_string(), dtype))
            .collect();
        let height: usize = self
            .lf
            .clone()
            .select([len()])
            .collect()?
            .column("len")?
            .get(0)?
            .try_extract()?;
        let shape = (schema.len(), height);
        let summary = Summary { columns, shape };
        Ok(summary)
    }
}
