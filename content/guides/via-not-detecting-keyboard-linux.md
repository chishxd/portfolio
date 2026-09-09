+++
title = "VIA Not Detecting Your Keyboard on Linux? It Might Be a Stale udev Rule"
date = 2026-09-04
description = "Debugging why VIA web refused to talk to my Rainy75 Pro on Fedora, and how a single udev rule was the culprit the whole time."
+++

So I got a Rainy75 Pro keyboard. Great board, VIA support, the works. Plugged it
into my Fedora 44 machine, opened VIA in Brave, and... nothing. VIA showed the
device but immediately threw errors:

```text
NotAllowedError: Failed to write the report.
Received invalid protocol version from device
```

Keyboard worked perfectly fine for typing. VIA worked perfectly fine on Windows.
Just... not on Linux.

### The Red Herring: SELinux

First instinct on Fedora is always SELinux. The `chrome://device-log` output
was showing `Access denied opening device read-write, trying read-only`, which
screams permission issue. So I went down the SELinux rabbit hole:

```bash
sudo setsebool -P usbhid_access 1
# Boolean usbhid_access is not defined
```

Cool. Created a new udev rule with `MODE="0666"` and `TAG+="uaccess"`.
Reloaded rules, replugged keyboard... still broken. Set SELinux to permissive
with `setenforce 0`... still broken. At this point I was convinced it was
something weird with the VIA web protocol on Linux.

### The Actual Problem

Turns out I had a `92-via.rules` file sitting in `/etc/udev/rules.d/` from
when I first tried to get VIA working (via some online guide). Here's what
it had:

```text
KERNEL=="hidraw*", SUBSYSTEM=="hidraw", MODE="0664", TAG+="uaccess"
```

Looks fine right? Except... `0664`. That's **not** writable by the user.
And because it matches `KERNEL=="hidraw*"` as a catch-all, it was hitting
ALL hidraw devices — including the ones my new `99-rainy75.rules` was trying
to fix with `MODE="0666"`.

The catch-all with the wrong permissions was silently overriding my fix.

### The Fix

Literally one line:

```bash
echo 'KERNEL=="hidraw*", SUBSYSTEM=="hidraw", MODE="0666", TAG+="uaccess"' | sudo tee /etc/udev/rules.d/92-via.rules
```

Changed `0664` to `0666`, removed the redundant `99-rainy75.rules`, reloaded
udev, replugged the keyboard, and VIA connected immediately. No SELinux
tweaks needed. No browser flags. No desktop app install.

### How I Figured It Out

The real breakthrough was checking `chrome://device-log` in Brave (which is
Chromium-based, so same internals as Chrome). It showed the full chain:

1. Chrome detects the HID device (vendor `0x320F`, product `0x5055`)
2. Tries to open `/dev/hidraw3` read-write
3. Gets `FILE_ERROR_ACCESS_DENIED`
4. Falls back to read-only
5. Tries to write the VIA config report
6. Gets `Bad file descriptor (9)` because it opened read-only

Then I ran `ls -la /dev/hidraw*` and noticed the Rainy75 devices had
`crw-rw-r--.` (664, no ACLs) while other devices had `crw-rw-r--+` (666
with ACLs). The `+` means ACLs from `TAG+="uaccess"` were applied, but the
underlying mode was still `664` from that old rule.

### Takeaway

If you're fighting VIA (or any WebHID/WebUSB tool) on Linux:

1. **Check ALL udev rules**, not just the one you created. A stale rule from
   a previous attempt might be overriding your fix. Look at every `.rules`
   file in `/etc/udev/rules.d/` and `lib/udev/rules.d/`.
2. **`chrome://device-log`** is your best friend for debugging WebHID issues.
   It shows exactly which device, which operation, and which error.
3. **Don't trust SELinux as the first suspect.** In my case it was a
   perfectly innocent bystander. Always verify file permissions first with
   `ls -la` and `getfacl`.
