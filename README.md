# Wallet Rendering Library

## Overview

**Status:** IN PROGRESS

This project is currently just started, and a work in progress. Most of the
library doesn't work (yet), but stay tuned for future updates.

**Project Kick-Off Date:** January 12, 2023

## Introduction

A wallet rendering library built in native javascript based on the
[Decentralized Identity Foundation (DIF)
specification](https://identity.foundation/wallet-rendering/). It specifies how
an issuer of Verifiable Credentials can make generic, high-level rendering
suggestions to wallets and consumers of the credentials, working on the model of
"style guides" for other credential formats, like mobile phone OS wallets and
MSFT Authenticator use.

The implementation of this library was heavily inspired by how [JSONForm](https://github.com/jsonform/jsonform) and [Eclipse
JSONForm](https://github.com/eclipsesource/jsonforms) was built.

The project intends to host over `npm` once it matures.

You can find the [initial forum proposal](https://forums.tbd.website/t/incubator-proposal-shared-js-components/214/22)
along with the [initial requirements document](./docs/proposal.md)

## Architecture and Models

You can find the architecture [here](./docs/architecture.md).

Diagrams and other visuals are helpful here. Perhaps code snippets showing usage.

## Getting Started

The example below renders a basic wallet with a hero and thumbnail object:

TODO: In progress!

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Getting started with Wallet Rendering</title>
    <link rel="stylesheet" style="text/css" href="deps/opt/bootstrap.css" />
  </head>
  <body>
    <h1>Getting started with Wallet Rendering</h1>
    <div id="wr" />
    <div id="res" class="alert"></div>
    <script type="text/javascript" src="deps/jquery.min.js"></script>
    <script type="text/javascript" src="deps/underscore.js"></script>
    <script type="text/javascript" src="deps/opt/wr.js"></script>
    <script type="text/javascript" src="lib/wr.js"></script>
    <script type="text/javascript">
      $("#wr").renderWallet({
          data: {
              thumbnail: {
                   uri: "https://dol.wa.com/logo.png",
                   alt: "Washington State Seal"
              },
              hero: {
                   uri: "https://dol.wa.com/people-working.png",
                   alt: "People working on serious things"
              },
              background: {
                  color: "#ff0000"
              },
              text: {
                   color: "#d4d400"
              }
         },
         onSubmit: function (errors, values) {
          if (errors) {
            $("#res").html("<p>Can't update</p>");
          } else {
            $("#res").html(
                alert(values);
            );
          }
        },
      });
    </script>
  </body>
</html>
```

## Playground

If you're more of the acting type than of the reading type, the Wallet Rendering
Playground is a simple Wallet Rendering editor that lets you try out and extend all the examples in the doc.

## Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |
