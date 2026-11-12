# Node-RED E.ON Spot Price

[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![NPM Total Downloads](https://img.shields.io/npm/dt/node-red-contrib-eon-spotprice.svg)](https://www.npmjs.com/package/node-red-contrib-eon-spotprice)
[![Dependencies](https://img.shields.io/librariesio/release/npm/node-red-contrib-eon-spotprice.svg)](https://libraries.io/github/TXC/node-red-contrib-eon-spotprice)

A Node-RED node that fetches electricity spot prices for Sweden from E.ON.

*Inspired by
[node-red-contrib-nordpool-api-plus](https://github.com/zinen/node-red-contrib-nordpool-api-plus).*

## Installation

Go to your Node-RED user folder (e.g. `~/.node-red`) and run:

```sh
npm i node-red-contrib-eon-spotprice
```

Requires Node.js 22 or newer.

## Usage

Add the **E.ON Spotprice** node (in the *request* category) and send it any
message, for example from an inject node. It replies with the prices in
`msg.payload`.

### Settings

| Setting          | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| Name             | Optional label for the node.                                       |
| Area             | Swedish price area: `SE1`, `SE2`, `SE3` or `SE4`.                  |
| Action on input  | Which day to fetch prices for (see below).                         |

Actions:

| Action                        | Fetches                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| Price for today (default)     | Today, or the day given in `msg.date`.                     |
| Price for tomorrow            | Tomorrow. Ignores `msg.date`.                              |
| Price for yesterday ... tomorrow | Currently only today's prices. Ignores `msg.date`.      |

Not sure which area you are in? See it on
[Vilket el­område tillhör du?](https://www.eon.se/el/elpriser/elprisomraden).

### Input

| Property   | Type   | Description                                                      |
| ---------- | ------ | ---------------------------------------------------------------- |
| `msg.area` | string | Overrides the area setting. An invalid value falls back to `SE1`. |
| `msg.date` | string | The day to fetch, e.g. `"2026-05-10"`. Any text that JavaScript's `new Date()` understands works. |

The day is worked out in the local time zone of the machine running
Node-RED. Tomorrow's prices are usually published in the early afternoon;
asking for them earlier may fail.

### Output

`msg.payload` is an array with one entry per price interval:

| Property       | Type    | Description                                          |
| -------------- | ------- | ---------------------------------------------------- |
| `timestamp`    | string  | When the price starts to apply (UTC).                |
| `priceExclVat` | number  | Price per kWh, excluding VAT.                        |
| `priceInclVat` | number  | Price per kWh, including VAT.                        |
| `definitive`   | boolean | `false` if the price may still change.               |
| `padded`       | boolean | `true` if the entry was filled in for missing data.  |
| `area`         | string  | The area the price applies to.                       |

If the request fails, or there is no data for the day, the node reports an
error that a *catch* node can handle, and shows it in the node's status.

## Examples

### Prices for a specific day

Put a function node between the inject node and this node. This one asks
for tomorrow's prices:

```js
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
// sv-SE formats as YYYY-MM-DD, in local time.
msg.date = tomorrow.toLocaleDateString('sv-SE');
return msg;
```

### Dashboard chart

To show the prices in a dashboard chart node, send each price as its own
message:

```js
for (const price of msg.payload) {
  node.send({
    topic: price.area,
    payload: price.priceInclVat,
    timestamp: price.timestamp,
  });
}
return null;
```

## Development

You need Node.js 22 or newer and pnpm. Install the dependencies with
`pnpm install`, then:

| Command            | What it does                                            |
| ------------------ | ------------------------------------------------------- |
| `pnpm build`       | Production build into `dist/`, minified.                |
| `pnpm build:dev`   | Development build, not minified.                        |
| `pnpm build:debug` | Minified build with source maps.                        |
| `pnpm test`        | Run the tests once.                                     |
| `pnpm test:watch`  | Run the tests on every change.                          |
| `pnpm lint`        | Check the code with ESLint.                             |
| `pnpm format`      | Format the code with Prettier.                          |

Each node lives in `src/nodes/<type>/`. A build produces two files per node
in `dist/nodes/<type>/`: `<type>.js` for the Node-RED runtime and
`<type>.html` for the editor.
