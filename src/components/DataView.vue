<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { tableFromIPC, DataType } from "apache-arrow";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import ColumnHeader from "./ColumnHeader.vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Toolbar from "openvue/toolbar";

import DataLoading from "./DataLoading.vue";
import DataGrid, { type CellCoords } from "./DataGrid.vue";

const route = useRoute();
const path = computed(() => route.query.path as string);

const rowData = ref<Record<string, any>[]>([]);
const colDefs = ref<ColDef[]>([]);
const height = ref(0);
const width = ref(0);
const selectedCell = ref<CellCoords | null>(null);

type FieldType = {
    name: string;
    type: DataType;
    nullable: boolean;
    metadata: Map<string, any>;
};

let loadToken = 0;
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    const token = ++loadToken;
    const table = tableFromIPC(
        await invoke<ArrayBuffer>("open_parquet", {
            path: path.value,
        }),
    );

    if (token !== loadToken) return;

    selectedCell.value = null;
    height.value = table.numCols;
    width.value = table.numRows;
    rowData.value = table.toArray().map((row) => row.toJSON());
    colDefs.value = table.schema.fields.map((f: FieldType) => ({
        field: f.name,
        headerName: f.name,
        headerComponentParams: {
            innerHeaderComponent: ColumnHeader,
            innerHeaderComponentParams: {
                arrowDType: f.type.toString(),
            },
        },
        valueFormatter: (params: ValueFormatterParams) => {
            if (DataType.isDate(f.type)) {
                return new Date(params.value).toDateString();
            }
            return params.value;
        },
    }));
    isLoading.value = false;
};

watch(path, loadData, { immediate: true });

onMounted(async () => {
    await getCurrentWindow().maximize();
});
</script>

<template>
    <DataLoading v-if="isLoading" />
    <DataGrid
        v-else
        :rowData="rowData"
        :colDefs="colDefs"
        @cell-focused="selectedCell = $event"
    />
    <Toolbar class="border-none rounded-none h-8 text-xs py-0">
        <template #end>
            <span v-if="selectedCell" class="mr-4">
                {{ selectedCell.col }}:{{ selectedCell.row + 1 }}
            </span>
            <span>({{ height }}, {{ width }})</span>
        </template>
    </Toolbar>
</template>
