+++
title = "How I dropped LazyVim and wrote my own configuration from scratch"
date = "2026-11-14"
description = "A guide and devlog about how I wrote my neovim configurations"
[taxonomies]
tags = ["neovim", "terminal", "config"]
+++

The hardest part of adopting Neovim isn't learning modal editing or deciphering Lua-- 
it's the overwhelming paralysis of choice. When three different plugins seemingly do the exact same job,
and every forum thread argues passionately for a different one, it is absurdly easy to spiral into 
[analysis paralysis](https://en.wikipedia.org/wiki/Analysis_paralysis). 

To escape that loop and just get back to writing code, I took the shortcut everyone recommends:
I installed [LazyVim](https://www.lazyvim.org/).

<!-- more -->

At first, it felt like magic. Everything worked out of the box. But over time, the cracks began to show. 

LazyVim is an impressive piece of engineering, but it is essentially an entire Linux distribution
disguised as a Neovim configuration. Between the UI sugar, background animations, 
and dozens of plugins I never asked for, the editor began to stutter and lag right in the middle of my Rust projects. 

I didn't move my workflow to the terminal just to run another bloated IDE. 
During my recent break, I decided it was time to drop the pre-packaged distro, clear the slate,
and write my own configuration from scratch -- only keeping what I actually understand.

## Moving out lazyvim configuration

So obviously, the first place to start would be to check Neovim's official site, and `:help` in nvim itself, but before that, we need to 
clear the existing configs to get a clear state. Instead of just deleting everything at once, I discovered that nvim can have multiple
configs side by side with a `NVIM_APPNAME` env variable.
So let's assume we have a folder named nvim-lazyvim with a working init.lua config.. Then I can just run 

```
NVIM_APPNAME="nvim-lazyvim" nvim
```
and neovim will load with configuration in nvim-lazyvim directory, so I just renamed the current `~/.config/nvim` folder to 
`~/.config/nvim-lazyvim` and created a new empty nvim folder:

```bash
mv ~/.config/nvim ~/.config/nvim-lazyvim
mkdir ~/.config/nvim
touch ~/.config/nvim/init.lua
```

## Starting with clean slate

Now, just typing `nvim` gives us the vanilla neovim with no modifications. With this new clean slate, we can start editing our
`init.lua`. The [documentation](https://neovim.io/doc/user/nvim/#nvim) helped to get me started with what I wanted, more like a launchpad,
neovim provides us with a example_init.lua, which comes prebaked in nvim's runtime directory, which can differ but is under env variable
named `$VIMRUNTIME`, so following commands let me get started with a basic example init file

```
:exe 'edit' stdpath('config') .. '/init.lua'
:read $VIMRUNTIME/example_init.lua
:write ++p
:restart
```

## The New Package Manager

After that restart, we have a kind of basic neovim configuration, which has some helpful plugins installed
like lspconfig, gitsigns, fzf, etc.

And to my surprise, the plugins were added as:

```lua
vim.pack.add({
....
})
```

I did not know neovim had a package manager built in, for LazyVim, I would just write all my plugins in a table, 
with configuration options inside it directly, but after searching I got to know that Neovim added their own package
manager in 0.12 release.

So the next thing I wanted with my neovim was to make it look good, so I installed gruvbox-material colorscheme,
and added some config
```lua 
vim.pack.add({
  ....
  -- gruvbox theme
  "https://github.com/sainnhe/gruvbox-material",
  ....
})

vim.o.background = "dark"
vim.g.gruvbox_material_background = "medium" -- 'hard', 'medium', or 'soft'
vim.g.gruvbox_material_transparent_background = 1
vim.cmd.colorscheme("gruvbox-material")

```

## The Statusline and some navigations

This gave me a more pleasant looking UI... After that I just configured my the statusline wih lualine
and installed wakatime for hack club's time tracking and added some personal keybinds for fzf-lua pickers 

```lua
-- ALL settings for FZF picker are here
require('fzf-lua').setup { fzf_colors = true }
local fzf = require('fzf-lua')
vim.keymap.set('n', '<leader>ff', fzf.files, { desc = "Find Files" })
vim.keymap.set('n', '<leader><leader>', fzf.files, { desc = "Find Files" })
vim.keymap.set('n', '<leader>fb', fzf.buffers, { desc = "Find Buffers" })
vim.keymap.set('n', '<leader>sg', fzf.live_grep, { desc = "Live Grep" })
vim.keymap.set('n', '<leader>sk', fzf.keymaps, { desc = "Search Keybinds" })
```

And simple navigations ones too.. like shift + h, and shift + l move the cursor to very beginning and end of the line.
```lua
-- to use shift + H and shift + L to go to start and end of line
vim.keymap.set({ 'n', 'v' }, 'H', '^')
vim.keymap.set({ 'n', 'v' }, 'L', '$')
```

## The "lightweight IDE" in lua

Once I was done with making text editing QoL like I wanted it, my focus pivoted to getting some IDE-like features, with LSP
and treesitter. I thought LSPs and treesitter would be painful to setup-- But it was rather much easier than making my 
statusline look **right** heh. I could probably write another guide on how to get Zig setup on Neovim to be correct, because it
did need some setup, but to summarise it, just download tar.gz and extract it to `$PATH`

The final LSP setup consists of some LSP options:

```lua
vim.lsp.config("lua_ls", {
  settings = {
    Lua = {
      runtime     = { version = "LuaJIT" },
      diagnostics = { globals = { "vim" } },
      workspace   = { library = { vim.env.VIMRUNTIME } },
      format      = {
        enable = true,
        defaultConfig = {
          indent_size = "2", -- Lua convention; use "4" if you really want 4
        },
      },
    },
  },
})

vim.lsp.config("rust_analyzer", {
  settings = { ["rust-analyzer"] = { check = { command = "clippy" } } },
})

vim.lsp.config("zls", {
  settings = {
    zls = {
      enable_build_on_save = true,
      -- build_on_save_step = "check", -- optional: if your build.zig defines a "check" step
    },
  },
})

vim.lsp.enable({ "rust_analyzer", "clangd", "zls", "lua_ls" })

vim.lsp.inlay_hint.enable()
```

And some autocmds for features like Code Action picker, quickfix list, etc.

## Folds not Folding

After writing some LSP code, I realized the folds were not working as they did on LazyVim.. turned out that Vim needed special
expressions to be marked as folds... So I tried writing an autocmd, which kinda failed, as the LSP would take longer than the set options
to start the fold. So, now without any autocmd, the fold techniques are directly plugged into global options as follows:

```lua
vim.o.foldmethod = "expr"
vim.o.foldexpr = "v:lua.vim.lsp.foldexpr()"
vim.o.foldlevel = 99
vim.o.foldlevelstart = 99
vim.o.foldenable = true
vim.o.foldtext = ""

vim.o.foldcolumn = "1"
```

Another Funny thing that happened was, I was referring to some Old docs which had some Treesitter setup code, it was some 10-liner like

```lua
require("nvim-treesitter.configs").setup({ ... })
```

But after pasting that code, Neovim was just throwing lots of errors, and then after going through some treesitter docs,
I realized that treesitter does not need any manual configuration block anymore and handles everything out-of-the-box
Simply deleting that setup block did the job.


## The Final collection of plugins

Finally, these are the plugins I have installed in my neovim right now.
```lua
vim.pack.add({
  -- Quickstart configs for LSP
  'https://github.com/neovim/nvim-lspconfig',
  -- Fuzzy picker
  'https://github.com/ibhagwan/fzf-lua',
  -- Autocompletion
  'https://github.com/nvim-mini/mini.completion',
  -- Enhanced quickfix/loclist
  'https://github.com/stevearc/quicker.nvim',
  -- Git integration
  'https://github.com/lewis6991/gitsigns.nvim',
  -- gruvbox theme
  "https://github.com/sainnhe/gruvbox-material",
  -- the wakatime for hackatime
  "https://github.com/wakatime/vim-wakatime",
  -- lualine
  'https://github.com/nvim-tree/nvim-web-devicons',
  'https://github.com/nvim-lualine/lualine.nvim',
  -- which-key for info
  "https://github.com/folke/which-key.nvim",
  --to automatically end starting parenthesis with ending one
  "https://github.com/nvim-mini/mini.pairs",
  -- to add surrounding brackets when needed
  "https://github.com/nvim-mini/mini.surround",
  -- for diff:
  'https://github.com/sindrets/diffview.nvim',
  -- zig stuff
  'https://codeberg.org/ziglang/zig.vim',
  "https://github.com/nvim-treesitter/nvim-treesitter",
})
```

## Conclusion

The entire configuration is now a single 350 lines of lua code now. Which feels more snappier
and feels more intuitive to my usecase, rather than something built for a more generic approach,
the venture gave me a fun sidequest and understanding of how nvim works.. I love the community and documentation
for neovim VERY much, I wish to contribute to the editor sometime soon <3

The entire config is available on [github](https://github.com/chishxd/dotfiles/blob/main/dot_config/nvim/init.lua)
