<script setup lang="ts">
import { ref } from "vue";

import Card from "openvue/card";
import FileUpload from "openvue/fileupload";
import Message from "openvue/message";
import { FilePlus, FolderOpen } from "@lucide/vue";

const fileupload = ref();
const messages = ref<string[]>([]);

const onChoose = () => {
    fileupload.value.choose();
};

const onUpload = () => {
    messages.value = ["Uploaded!"];
};

const onSelect = () => {
    const uploadMessages = fileupload.value.messages as string[];
    if (!uploadMessages) return;

    messages.value = uploadMessages;
    fileupload.value.messages = [];
};
</script>

<template>
    <div class="flex min-h-screen flex-col items-center justify-center gap-4">
        <FileUpload
            ref="fileupload"
            class="hidden"
            mode="basic"
            :auto="true"
            accept=".parquet"
            invalidFileTypeMessage="Chevron only supports Parquet files."
            custom-upload
            @select="onSelect"
            @uploader="onUpload"
        />

        <span class="text-3xl font-bold">Chevron</span>
        <span class="text-lg">What do you want to do?</span>

        <Message :key="msg" v-for="msg of messages" severity="error">
            {{ msg }}
        </Message>

        <div class="flex flex-row gap-4">
            <Card class="w-40 opacity-50">
                <template #content>
                    <div class="flex flex-col items-center gap-2">
                        <FilePlus :size="48" />
                        <span class="text-lg">New</span>
                    </div>
                </template>
            </Card>
            <Card class="w-40" @click="onChoose">
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
