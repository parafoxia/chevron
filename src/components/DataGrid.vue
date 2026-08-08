<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import { colorSchemeDark, themeQuartz } from "ag-grid-community";
import ColumnHeader from "./ColumnHeader.vue";

const darkTheme = themeQuartz
    .withPart(colorSchemeDark)
    .withParams({ wrapperBorderRadius: 0 });

const props = defineProps({
    rowData: {
        type: Array,
        required: true,
    },
    colDefs: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <AgGridVue
        :rowData="rowData"
        :columnDefs="colDefs"
        class="flex-1 min-h-0"
        :theme="darkTheme"
    />
</template>
