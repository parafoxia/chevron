<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { AgGridVue } from "ag-grid-vue3";
import { colorSchemeDark, themeQuartz } from "ag-grid-community";
import { tableFromIPC } from "apache-arrow";

const route = useRoute();
const path = route.query.path;

const darkTheme = themeQuartz.withPart(colorSchemeDark);

const rowData = ref<Record<string, any>[]>([]);
const colDefs = ref<{ field: string }[]>([]);

onMounted(async () => {
    const table = tableFromIPC(
        await invoke<ArrayBuffer>("open_parquet", { path: path as string }),
    );
    rowData.value = table.toArray().map((row) => row.toJSON());
    colDefs.value = table.schema.fields.map((field) => ({ field: field.name }));
});
</script>

<template>
    <AgGridVue
        :rowData="rowData"
        :columnDefs="colDefs"
        class="flex-1 min-h-0 rounded-none"
        :theme="darkTheme"
    />
</template>
