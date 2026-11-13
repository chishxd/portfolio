+++
title = "How I dropped LazyVim and wrote my own configuration from scratch"
date = "2026-11-14"
description = "A guide and devlog about how I wrote my neovim configurations"
+++

Neovim is one of the most popular text editors nowadays, and there are some very good reasons for that!
It is very fast, simple and most importantly-- It is VERY customizable. Numerous different plugins, each with their pros and cons make
it very difficult to decide what to choose and what not to choose, 3 different plugins, seemingly doing exactly same things could feel
VERY different, and even forums on internet seem to have very strong opinions about each of them... which made me spiral into [analysis
paralysis](https://en.wikipedia.org/wiki/Analysis_paralysis), so after some reading and suggestions I decided to just go with 
[LazyVim](https://www.lazyvim.org/) to stop this paralysis

But soon after using it, I realized that it is kind of.. bloated for my usecase.. lots of unnecessary UI sugar and plugins slowed down the
editor multiple times during rust projects. So during my recent vacations, I decided to write my neovim configuration from scratch.

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

Once I was done with making text editing QoL like I wanted it, my focus pivoted to getting some IDE-like features, with LSP
and treesitter. I thought LSPs and treesitter would be painful to setup-- But it was rather much easier than making my 
statusline look **right** heh. I could probably write another guide on how to get Zig setup on Neovim to be correct, because it
did need some setup, but to summarise it, just download tar.gz and extract it to `$PATH`

The final LSP setup consists of some LSP options:

```lua
vim.lsp.config("lua_ls", {
	settings = {
		Lua = {
			runtime = { version = "LuaJIT" },
			diagnostics = { globals = { "vim" } },
			workspace = { library = { vim.env.VIMRUNTIME } },
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

---


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

The entire configuration is now a single 350 lines of lua code now. Which feels more snappier
and feels more intuitive to my usecase, rather than something built for a more generic approach,
the venture gave me a fun sidequest and understanding of how nvim works.. I love the community and documentation
for neovim VERY much, I wish to contribute to the editor sometime soon <3

The entire config is available on [github](https://github.com/chishxd/dotfiles/blob/main/dot_config/nvim/init.lua)
