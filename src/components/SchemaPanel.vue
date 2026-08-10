<script setup lang="ts">
import Tree from "openvue/tree";
import { computed } from "vue";
import { Columns3, Hash } from "@lucide/vue";

import { Column, Summary } from "./DataView.vue";

const props = defineProps({
    summary: Object as () => Summary,
});

interface SchemaNode {
    key: string;
    label: string;
    data: Column;
    children: SchemaNode[];
}

const toNode = (column: Column, key: string): SchemaNode => ({
    key,
    label: `${column.name}: ${column.dtype}`,
    data: column,
    children: column.children.map((child, index) =>
        toNode(child, `${key}-${index}`),
    ),
});

const summaryNodes = computed(() =>
    (props.summary?.columns ?? []).map((column, index) =>
        toNode(column, `column-${index}`),
    ),
);
</script>

<template>
    <div class="flex flex-1 min-w-0 min-h-0">
        <Tree
            :value="summaryNodes"
            scroll-height="flex"
            class="text-sm text-nowrap px-0"
        >
            <template #nodeicon="{ node }">
                <Columns3 v-if="node.children?.length" :size="14" />
                <Hash v-else :size="14" />
            </template>
        </Tree>
    </div>
</template>
