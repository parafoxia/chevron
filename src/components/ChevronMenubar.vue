<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { exit } from "@tauri-apps/plugin-process";

import Menubar from "openvue/menubar";
import Dialog from "openvue/dialog";
import Button from "openvue/button";
import { ChevronsUp, X } from "@lucide/vue";

import { selectFile } from "../lib/file";

const router = useRouter();
const showAboutDialog = ref(false);

const onOpen = async () => {
    const path = await selectFile();
    if (path) router.push({ path: "/data", query: { path } });
};

const items = ref([
    {
        label: "Chevron",
        items: [
            {
                label: "About Chevron",
                command: () => {
                    showAboutDialog.value = true;
                },
            },
            { separator: true },
            {
                label: "Quit",
                command: async () => {
                    await exit(0);
                },
            },
        ],
    },
    {
        label: "File",
        items: [
            {
                label: "New",
                disabled: true,
            },
            {
                label: "Open...",
                command: onOpen,
            },
        ],
    },
]);
</script>

<template>
    <Dialog v-model:visible="showAboutDialog" modal class="min-w-70 min-h-70">
        <template #header>
            <span class="text-xl">About</span>
        </template>
        <template #default>
            <div class="flex flex-1 flex-col justify-center items-center">
                <ChevronsUp class="mb-4" :size="72" />
                <span>Chevron Alpha</span>
                <span>v0.1.0</span>
            </div>
        </template>
        <template #footer>
            <Button @click="showAboutDialog = false">
                <X :size="18" />
                <span>Close</span>
            </Button>
        </template>
    </Dialog>

    <Menubar
        :model="items"
        breakpoint="100px"
        class="text-sm h-8 border-none rounded-none relative z-50"
    >
        <template #submenuicon="{ root }">
            <ChevronRight v-if="!root" :size="14" />
        </template>
    </Menubar>
</template>
