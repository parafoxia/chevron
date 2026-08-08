<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script lang="ts">
export type CellCoords = { row: number; col: string };
</script>

<script setup lang="ts">
import { computed } from "vue";

import { AgGridVue } from "ag-grid-vue3";
import {
    colorSchemeDark,
    themeQuartz,
    type CellFocusedEvent,
} from "ag-grid-community";
import { type Table, DataType } from "apache-arrow";
import type { ValueFormatterParams } from "ag-grid-community";

import ColumnHeader from "./ColumnHeader.vue";

type FieldType = {
    name: string;
    type: DataType;
    nullable: boolean;
    metadata: Map<string, any>;
};

const props = defineProps<{
    table: Table<any>;
}>();
const emit = defineEmits<{
    cellFocused: [cell: CellCoords | null];
    firstDataRendered: [];
}>();

const darkTheme = themeQuartz
    .withPart(colorSchemeDark)
    .withParams({ wrapperBorderRadius: 0 });

const rowData = computed(() =>
    props.table.toArray().map((row) => row.toJSON()),
);
const columnDefs = computed(() => {
    return props.table.schema.fields.map((f: FieldType) => ({
        field: f.name,
        headerName: f.name,
        headerComponentParams: {
            innerHeaderComponent: ColumnHeader,
            innerHeaderComponentParams: {
                arrowDType: f.type.toString(),
            },
        },
        valueFormatter: (params: ValueFormatterParams) => {
            if (DataType.isDate(f.type) || DataType.isTimestamp(f.type)) {
                return new Date(params.value).toISOString();
            }
            return params.value;
        },
    }));
});

const onCellFocused = (e: CellFocusedEvent) => {
    const col = typeof e.column === "string" ? e.column : e.column?.getColId();
    emit(
        "cellFocused",
        e.rowIndex == null || !col ? null : { row: e.rowIndex, col },
    );
};

const onFirstDataRendered = () => {
    emit("firstDataRendered");
};
</script>

<template>
    <AgGridVue
        :rowData="rowData"
        :columnDefs="columnDefs"
        class="flex-1 min-h-0"
        :theme="darkTheme"
        @cell-focused="onCellFocused"
        @first-data-rendered="onFirstDataRendered"
    />
</template>
