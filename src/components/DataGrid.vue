<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script lang="ts">
export type CellCoords = { row: number; col: string };
</script>

<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import {
    colorSchemeDark,
    themeQuartz,
    type CellFocusedEvent,
    type ColDef,
} from "ag-grid-community";

const darkTheme = themeQuartz
    .withPart(colorSchemeDark)
    .withParams({ wrapperBorderRadius: 0 });

defineProps<{
    rowData: Record<string, any>[];
    colDefs: ColDef[];
}>();

const emit = defineEmits<{ cellFocused: [cell: CellCoords | null] }>();

const onCellFocused = (e: CellFocusedEvent) => {
    const col = typeof e.column === "string" ? e.column : e.column?.getColId();
    emit(
        "cellFocused",
        e.rowIndex == null || !col ? null : { row: e.rowIndex, col },
    );
};
</script>

<template>
    <AgGridVue
        :rowData="rowData"
        :columnDefs="colDefs"
        class="flex-1 min-h-0"
        :theme="darkTheme"
        @cell-focused="onCellFocused"
    />
</template>
