<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { tableFromIPC, type Table } from "apache-arrow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Toolbar from "openvue/toolbar";

import { type CellCoords } from "./DataGrid.vue";
import DataTabs from "./DataTabs.vue";

const route = useRoute();

const path = computed(() => (route.query.path as string | undefined) ?? "");

const files = ref<string[]>([]);
const table = shallowRef<Table<any> | null>(null);
const loadedPath = ref("");

const width = computed(() => table.value?.numCols ?? 0);
const height = computed(() => table.value?.numRows ?? 0);
const selectedCell = ref<CellCoords | null>(null);

const loadData = async () => {
    selectedCell.value = null;
    if (!path.value) return;
    if (!files.value.includes(path.value)) files.value.push(path.value);

    const target = path.value;
    const loaded = tableFromIPC(
        await invoke<ArrayBuffer>("read_table", { path: target }),
    );
    if (target !== path.value) return;

    table.value = loaded;
    loadedPath.value = target;
};

watch(path, loadData, { immediate: true });

onMounted(async () => {
    await getCurrentWindow().maximize();
});
</script>

<template>
    <div class="relative flex flex-1 min-h-0">
        <DataTabs
            :path="path"
            :loaded-path="loadedPath"
            v-model:files="files"
            :table="table"
            @cell-focused="selectedCell = $event"
        />
    </div>
    <Toolbar class="border-none rounded-none h-8 text-xs py-0">
        <template #end>
            <span v-if="selectedCell" class="mr-4">
                {{ selectedCell.col }}:{{ selectedCell.row + 1 }}
            </span>
            <span>({{ width }}, {{ height }})</span>
        </template>
    </Toolbar>
</template>
