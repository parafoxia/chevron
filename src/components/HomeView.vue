<script setup lang="ts">
import { useRouter } from "vue-router";

import Card from "openvue/card";
import { FilePlus, FolderOpen } from "@lucide/vue";
import { open } from "@tauri-apps/plugin-dialog";

const router = useRouter();

const onOpen = async () => {
    const result = await open({
        title: "Select a file",
        filters: [{ name: "Parquet", extensions: ["parquet"] }],
    });

    if (result) {
        router.push({ path: "/data", query: { path: result } });
    }
};
</script>

<template>
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
        <span class="text-3xl font-bold">Chevron</span>
        <span class="text-lg">What do you want to do?</span>

        <div class="flex flex-row gap-4">
            <Card class="w-40 opacity-50">
                <template #content>
                    <div class="flex flex-col items-center gap-2">
                        <FilePlus :size="48" />
                        <span class="text-lg">New</span>
                    </div>
                </template>
            </Card>
            <Card class="w-40" @click="onOpen">
                <template #content>
                    <div
                        class="flex flex-col items-center gap-2 cursor-pointer"
                    >
                        <FolderOpen :size="48" />
                        <span class="text-lg">Open</span>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
