# dmesg.js

> Print or control the kernel ring buffer

`dmesg` is used to examine or control the kernel ring buffer.
The default action is to display all messages from the kernel ring buffer in a format similar to the --raw output from the [`dmesg`](http://man7.org/linux/man-pages/man1/dmesg.1.html) utility in `util-linux`

## Install
```
npm i -g dmesg
```
or simply run it with

```
npx dmesg
```

## Usage

```
$ dmesg --help

  Usage
    $ dmesg

  Options
    -w, --follow
        Wait for new messages. This feature issupported only on systems with a readable dev/kmsg (since kernel 3.5.0).
    -h, --help
        Show this help message.
```
## License

MIT
