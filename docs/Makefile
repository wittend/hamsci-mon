# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
# Minimal Sphinx makefile

# You can set these variables from the command line.
SPHINXOPTS    =
SPHINXBUILD   = sphinx-build
SOURCEDIR     = .
BUILDDIR      = _build

.PHONY: help clean html live

help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

clean:
	rm -rf "$(BUILDDIR)"

html:
	@$(SPHINXBUILD) -M html "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

live:
	@sphinx-autobuild --watch ../ --open-browser --delay 1 "$(SOURCEDIR)" "$(BUILDDIR)/html"