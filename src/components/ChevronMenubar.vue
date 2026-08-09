<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { exit } from "@tauri-apps/plugin-process";
import { message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

import Menubar from "openvue/menubar";

import { selectFile } from "../lib/file";

const router = useRouter();

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
                command: async () => {
                    const version = await invoke<string>("get_version");
                    await message(`Chevron ${version}`, {
                        title: "About Chevron",
                        kind: "info",
                    });
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
