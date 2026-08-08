<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { computed, onMounted, ref, watch, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { tableFromIPC, type Table } from "apache-arrow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Toolbar from "openvue/toolbar";

import DataLoading from "./DataLoading.vue";
import DataGrid, { type CellCoords } from "./DataGrid.vue";

const route = useRoute();
const path = computed(() => route.query.path as string);

const table = shallowRef<Table<any> | null>(null);
const height = ref(0);
const width = ref(0);
const selectedCell = ref<CellCoords | null>(null);

let loadToken = 0;
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    const token = ++loadToken;
    const loaded = tableFromIPC(
        await invoke<ArrayBuffer>("open_parquet", {
            path: path.value,
        }),
    );
    if (token !== loadToken) return;
    table.value = loaded;

    selectedCell.value = null;
    height.value = table.value.numCols;
    width.value = table.value.numRows;
};

watch(path, loadData, { immediate: true });

onMounted(async () => {
    await getCurrentWindow().maximize();
});
</script>

<template>
    <div class="relative flex flex-1 min-h-0">
        <DataGrid
            v-if="table"
            :table="table"
            @cell-focused="selectedCell = $event"
            @first-data-rendered="isLoading = false"
        />
        <DataLoading
            v-if="isLoading"
            class="absolute inset-0 bg-(--p-content-background)"
        />
    </div>
    <Toolbar class="border-none rounded-none h-8 text-xs py-0">
        <template #end>
            <span v-if="selectedCell" class="mr-4">
                {{ selectedCell.col }}:{{ selectedCell.row + 1 }}
            </span>
            <span>({{ height }}, {{ width }})</span>
        </template>
    </Toolbar>
</template>
