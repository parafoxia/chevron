// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "../components/HomeView.vue";
import DataView from "../components/DataView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/data", component: DataView },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
