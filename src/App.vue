<script setup lang="ts">
import { ref } from "vue";

import Menubar from "openvue/menubar";
import Dialog from "openvue/dialog";
import Button from "openvue/button";
import { ChevronsUp, X } from "@lucide/vue";

const showAboutDialog = ref(false);

const items = ref([
    {
        label: "Help",
        items: [
            {
                label: "About Chevron",
                command: () => {
                    showAboutDialog.value = true;
                },
            },
        ],
    },
]);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Dialog
            v-model:visible="showAboutDialog"
            modal
            class="min-w-70 min-h-70"
        >
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
            class="text-sm h-8 border-none rounded-none"
        />
        <RouterView />
    </div>
</template>
