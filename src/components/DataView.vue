<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { tableFromIPC, type Table } from "apache-arrow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Toolbar from "openvue/toolbar";
import Tabs from 'openvue/tabs';
import TabList from 'openvue/tablist';
import Tab from 'openvue/tab';
import TabPanels from 'openvue/tabpanels';
import TabPanel from 'openvue/tabpanel';
import { X } from "@lucide/vue";

import DataGrid, { type CellCoords } from "./DataGrid.vue";

const route = useRoute();
const router = useRouter();

const path = computed(() => (route.query.path as string | undefined) ?? "");

const files = ref<string[]>([]);
const table = shallowRef<Table<any> | null>(null);
const loadedPath = ref("");

const height = computed(() => table.value?.numCols ?? 0);
const width = computed(() => table.value?.numRows ?? 0);
const selectedCell = ref<CellCoords | null>(null);

const baseName = (file: string) => file.split("/").pop() ?? file;

const loadData = async () => {
    selectedCell.value = null;
    if (!path.value) return;
    if (!files.value.includes(path.value)) files.value.push(path.value);

    const target = path.value;
    const loaded = tableFromIPC(
        await invoke<ArrayBuffer>("open_parquet", { path: target }),
    );
    if (target !== path.value) return;

    table.value = loaded;
    loadedPath.value = target;
};

const switchTab = (value: string | number) => {
    router.push({ path: "/data", query: { path: String(value) } });
};

const closeTab = (value: string | number) => {
    const file = String(value);
    const index = files.value.indexOf(file);
    if (index === -1) return;

    files.value.splice(index, 1);
    if (file !== path.value) return;

    const next = files.value[index] ?? files.value[index - 1];
    router.push(next ? { path: "/data", query: { path: next } } : { path: "/" });
};

watch(path, loadData, { immediate: true });

onMounted(async () => {
    await getCurrentWindow().maximize();
});
</script>

<template>
    <div class="relative flex flex-1 min-h-0">
        <Tabs lazy :value="path" class="flex flex-col flex-1 min-w-0 min-h-0" @update:value="switchTab">
            <TabList class="text-xs">
                <Tab v-for="file in files" :key="file" :value="file">
                    <span class="flex flex-row gap-2">
                        {{ baseName(file) }}
                        <X :size="16" @click.stop="closeTab(file)" class="opacity-75 hover:opacity-100" />
                    </span>
                </Tab>
            </TabList>
            <TabPanels class="flex flex-col flex-1 min-h-0 p-0">
                <TabPanel v-for="file in files" :key="file" :value="file" class="flex flex-col flex-1 min-h-0">
                    <DataGrid
                        v-if="table && loadedPath === file"
                        :key="file"
                        :table="table"
                        @cell-focused="selectedCell = $event"
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
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
