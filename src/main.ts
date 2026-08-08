// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/global.css";
import OpenVue from "openvue/config";
import Aura from "@openvue/themes/aura";
import { router } from "./router";

const app = createApp(App);
app.use(OpenVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: "openvue",
        order: "theme, base, openvue, components, utilities",
      },
    },
  },
});
app.use(router);
app.mount("#app");
