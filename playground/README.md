# Wallet Rendering Verifiable Credential Playground

This playground is a simple application that allows you to test the wallet
rendering specifications with a live editor.

**Current Status:** IN PROGRESS

## Features

- Sample Wallet Rendering Spec
- Live Reload
- Linter

## Usage

You must run this over an HTTP server:

### Start a Server

1. Python Server

   `python -m http.server <port>`

2. Node Server

```
npm install -g http-server
http-server
```

3. Any other HTTP server (NGINX, Apache, Caddy, etc.)

### Visit your browser

Go to your browser and go to the URL: `http://localhost:<port>/playground/`
ex. http://localhost:8080/playground/

NB: The final / in the URL is needed.
