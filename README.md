# Async Text Editor

A small web application for writing text with dynamic placeholders and rendering a live preview with resolved cryptocurrency data.

## Overview

The application provides a two-panel editing flow:

- a raw text input area,
- a rendered output preview,
- inline resolution of custom placeholders based on external API data.

Supported placeholder format:

```text
{{ Name/BTC }}
{{ Price/BTC }}
```

Example output:

- `{{ Name/BTC }}` → `Bitcoin`
- `{{ Price/BTC }}` → current BTC price in USD

## Features

- Parses custom placeholders in the `{{ Method/Argument }}` format
- Resolves cryptocurrency names by symbol
- Resolves cryptocurrency prices in USD
- Reuses resolved values for repeated placeholders in the same input
- Displays parsing or API errors in the UI

## Supported methods

### `Name(symbol)`

Returns the full name of a cryptocurrency for a given symbol.

Example:

```text
{{ Name/BTC }} -> Bitcoin
```

### `Price(symbol)`

Returns the current price of a cryptocurrency in USD.

Example:

```text
{{ Price/BTC }} -> $855.53
```

## Data source

This project uses the CoinPaprika REST API:

[https://api.coinpaprika.com](https://api.coinpaprika.com)

## Current state

This repository contains an early implementation built with an older React-based setup.

The next iteration focuses on modernizing the project with:

- React
- TypeScript
- Vite
- Tailwind CSS
- native Fetch API
- improved project structure and developer tooling

## Development goals

The current modernization effort focuses on:

- clearer component boundaries,
- typed API integration,
- better error handling,
- improved UI structure,
- a cleaner and more maintainable frontend architecture.
