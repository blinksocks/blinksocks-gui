# sysproxy-cmd

A command line tool to change HTTP(s) proxy settings of the operating system.

Binaries included in repo. Simply `make` to build it again.

Note - you will need to run make separately on each platform.

# Usage

```sh
sysproxy show
sysproxy on  <proxy host> <proxy port>
sysproxy off <proxy host> <proxy port>
sysproxy wait-and-cleanup <proxy host> <proxy port>
```

`sysproxy off` and `sysproxy wait-and-cleanup` turns off proxy setting only if the
existing host and port equal <proxy host> <proxy port>.

`sysproxy wait-and-cleanup` differs from `sysproxy off` in that it waits for input
from stdin (or close) before turning off proxy setting. Any signal or Windows
system shutdown message triggers the cleanup too.


# Notes

*  **Mac**

Setting the system proxy is a privileged action on Mac OS. `sudo` or elevate it
as below.

There's an additional option to chown itself to root:wheel and add setuid bit.

```sh
sysproxy setuid
```

*  **Windows**

Install [MinGW-W64](http://sourceforge.net/projects/mingw-w64) to build sysproxy
as it has up to date SDK headers we require. The make command is `mingw32-make`.

To avoid bringing up console window, it doesn't show anything directly to
console. Piping the result to other utilities should work.

```
sysproxy show | cat
```

*  **Linux**

`sudo apt-get install libgtk2.0-dev`
