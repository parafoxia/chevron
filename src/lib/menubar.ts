// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

import { getName, getVersion } from "@tauri-apps/api/app";
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from "@tauri-apps/api/menu";
import { exit } from "@tauri-apps/plugin-process";

import { router } from "../router";
import { selectFile } from "./file";

const isMac = navigator.userAgent.includes("Mac");

const separator = () => PredefinedMenuItem.new({ item: "Separator" });

const onOpen = async () => {
  const path = await selectFile();
  if (path) router.push({ path: "/data", query: { path } });
};

async function appSubmenu() {
  const [name, version] = await Promise.all([getName(), getVersion()]);

  return Submenu.new({
    text: name,
    items: [
      await PredefinedMenuItem.new({
        text: `About ${name}`,
        item: {
          About: {
            name,
            version,
            copyright: "Copyright © 2026 Ethan Henderson",
            license: "MIT OR Apache-2.0",
          },
        },
      }),
      await separator(),
      ...(isMac
        ? [
            await PredefinedMenuItem.new({ item: "Hide" }),
            await PredefinedMenuItem.new({ item: "HideOthers" }),
            await PredefinedMenuItem.new({ item: "ShowAll" }),
            await separator(),
          ]
        : []),
      // The predefined one seemingly doesn't work on Linux.
      await MenuItem.new({
        id: "quit",
        text: `Quit ${name}`,
        accelerator: "CmdOrCtrl+Q",
        action: async () => await exit(0),
      }),
    ],
  });
}

async function fileSubmenu() {
  return Submenu.new({
    text: "File",
    items: [
      await MenuItem.new({
        id: "new",
        text: "New",
        enabled: false,
      }),
      await MenuItem.new({
        id: "open",
        text: "Open...",
        accelerator: "CmdOrCtrl+O",
        action: onOpen,
      }),
    ],
  });
}

async function editSubmenu() {
  return Submenu.new({
    text: "Edit",
    items: [
      await PredefinedMenuItem.new({ item: "Undo" }),
      await PredefinedMenuItem.new({ item: "Redo" }),
      await separator(),
      await PredefinedMenuItem.new({ item: "Cut" }),
      await PredefinedMenuItem.new({ item: "Copy" }),
      await PredefinedMenuItem.new({ item: "Paste" }),
      await PredefinedMenuItem.new({ item: "SelectAll" }),
    ],
  });
}

export async function initMenubar() {
  const menu = await Menu.new({
    items: [await appSubmenu(), await fileSubmenu(), await editSubmenu()],
  });

  await menu.setAsAppMenu();
  return menu;
}
