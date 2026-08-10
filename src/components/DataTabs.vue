<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import Tabs from "openvue/tabs";
import TabList from "openvue/tablist";
import Tab from "openvue/tab";
import TabPanels from "openvue/tabpanels";
import TabPanel from "openvue/tabpanel";

import { useRouter } from "vue-router";
import type { Table } from "apache-arrow";
import { X } from "@lucide/vue";

import DataGrid, { type CellCoords } from "./DataGrid.vue";

const props = defineProps<{
    path: string;
    loadedPath: string;
    table: Table<any> | null;
}>();
defineEmits<{
    cellFocused: [cell: CellCoords | null];
}>();

const router = useRouter();

const files = defineModel<string[]>("files", { required: true });
const baseName = (file: string) => file.split("/").pop() ?? file;

const openFile = (file: string) =>
    router.push({ path: "/data", query: { path: file } });

const switchTab = (value: string | number) => openFile(String(value));

const closeTab = (value: string) => {
    const file = String(value);
    const index = files.value.indexOf(file);
    if (index === -1) return;

    files.value.splice(index, 1);
    if (file !== props.path) return;

    const next = files.value[index] ?? files.value[index - 1];
    if (next) openFile(next);
    else router.push({ path: "/" });
};
</script>

<template>
    <Tabs
        lazy
        :value="path"
        class="flex flex-col flex-1 min-w-0 min-h-0"
        @update:value="switchTab"
    >
        <TabList class="text-xs">
            <Tab v-for="file in files" :key="file" :value="file">
                <span class="flex flex-row gap-2">
                    {{ baseName(file) }}
                    <X
                        :size="16"
                        class="opacity-75 hover:opacity-100"
                        @click.stop="closeTab(file)"
                    />
                </span>
            </Tab>
        </TabList>
        <TabPanels class="flex flex-col flex-1 min-h-0 p-0">
            <TabPanel
                v-for="file in files"
                :key="file"
                :value="file"
                class="flex flex-col flex-1 min-h-0"
            >
                <DataGrid
                    v-if="table && loadedPath === file"
                    :table="table"
                    @cell-focused="$emit('cellFocused', $event)"
                />
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>
