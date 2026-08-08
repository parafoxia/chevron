<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { computed, onMounted, ref, type Ref, watch } from "vue";
import { useRoute } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { tableFromIPC, DataType } from "apache-arrow";
import ColumnHeader from "./ColumnHeader.vue";
import { getCurrentWindow } from "@tauri-apps/api/window";

import DataLoading from "./DataLoading.vue";
import DataGrid from "./DataGrid.vue";

const route = useRoute();
const path = computed(() => route.query.path as string);

const rowData = ref<Record<string, any>[]>([]);
const colDefs = ref<{ field: string }[]>([]);

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
        valueFormatter: (params: Ref<any>) => {
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
    <DataGrid v-else :rowData="rowData" :colDefs="colDefs" />
</template>
