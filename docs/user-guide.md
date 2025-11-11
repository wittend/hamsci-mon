---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# User Guide

This guide explains the main UI areas and how to interact with the globe and objects.

## Layout
- Menubar and toolbar at the top
- Palette at the left (resizable via the vertical bar)
- Workspace (globe canvas + SVG overlay) fills the remaining space
- Status bar at the bottom with live coordinates and time

## Theme
- Toggle the Dark Mode checkbox on the toolbar.
- Your preference is saved in the browser (localStorage) and applied on next load.

## Globe interaction
- Drag with the mouse to rotate.
- Scroll wheel/trackpad to zoom.
- Click the "Fit" button to reset rotation and scale to fit the current window.

## Placing objects
Objects represent items of interest at geographic coordinates.

1. Drag an entry from the Palette into the workspace.
2. Drop it on the globe to place it at that location.
3. Hovering shows a tooltip; status bar displays the geographic coordinates and UTC/local time.

## Connectors between objects
You can conceptually connect objects. In the current build, connectors render from data within a project (when present). A future UI will let you draw connectors with the mouse.

## Projects and object definitions
For local development:
- Use File → Open/Save buttons (or toolbar) to load and save projects.
- Projects are JSON files with arrays of `objects` and `connectors`.
- Object definitions can be served by the local API (`/api/objects/...`) or bundled as static JSON.

On hosted platforms like Deno Deploy, write endpoints are disabled automatically.

## Keyboard shortcuts (planned)
- Fit to window: planned shortcut `f`
- Toggle theme: planned shortcut `t`

If you’d like specific shortcuts, open an issue with your preferences.
