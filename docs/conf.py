# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors

from datetime import datetime
import os
import sys
from pathlib import Path

# -- Project information -----------------------------------------------------

project = "hamsci-mon"
author = "hamsci-mon contributors"
copyright = f"{datetime.now().year} {author}"

# -- General configuration ---------------------------------------------------

extensions = [
    "myst_parser",
    "sphinx_copybutton",
]

myst_enable_extensions = [
    "deflist",
    "colon_fence",
    "substitution",
]

# Source suffixes: use Markdown via MyST
source_suffix = {
    ".md": "markdown",
}

# Templates and language
templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

# -- Options for HTML output -------------------------------------------------

html_theme = "furo"
html_title = project
html_static_path = ["_static"]

# Furo theme options
html_theme_options = {
    "sidebar_hide_name": False,
}

# -- Cross links -------------------------------------------------------------

# GitHub links (if you publish on GitHub, update org/repo accordingly)
html_context = {
    "display_github": True,
    "github_user": "hamsci-mon",  # adjust if different
    "github_repo": "hamsci-mon",
    "github_version": "main",
    "conf_py_path": "/docs/",
}
