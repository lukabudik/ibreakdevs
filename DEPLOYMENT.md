# Deployment Guide for IBreakDevs

This guide explains how to deploy IBreakDevs on Railway with a Cloudflare Proxy.

## Architecture

IBreakDevs consists of two separate services:

1. **Next.js Application**: The main web application
2. **WebSocket Server**: Handles real-time communication for AI code generation

Both services need to be deployed separately on Railway.

## Prerequisites

- Railway account
- Cloudflare account (for domain and proxy)
- OpenAI API key

## Deployment Steps

### 1. Set Up Environment Variables

Create a `.env` file based on the `.env.example` template:

```
# Next.js App Environment Variables
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-service.railway.app
OPENAI_API_KEY=your-openai-key

# WebSocket Server Environment Variables (when running separately)
PORT=8080
```

### 2. Deploy the WebSocket Server

1. Create a new Railway project
2. Connect your GitHub repository
3. Configure the service:
   - Use `railway.websocket.toml` for configuration
   - Set environment variables:
     - `PORT`: Railway will provide this automatically
     - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy the service
5. Generate a domain for the WebSocket server
6. Note the domain URL (e.g., `your-websocket-service.railway.app`)

### 3. Deploy the Next.js Application

1. Create another Railway project
2. Connect your GitHub repository
3. Configure the service:
   - Use `railway.toml` for configuration
   - Set environment variables:
     - `NEXT_PUBLIC_WEBSOCKET_URL`: Set to `wss://your-websocket-service.railway.app`
     - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy the service
5. Generate a domain for the Next.js application

### 4. Set Up Cloudflare

1. Add your domain to Cloudflare
2. Configure DNS records:
   - Create a CNAME record for your domain pointing to the Railway-provided domain
   - Enable the proxy (orange cloud)
3. Configure SSL/TLS settings:
   - Set SSL/TLS encryption mode to "Full" (not "Full (Strict)")
   - Enable Universal SSL
4. Configure WebSocket support:
   - In the Network tab, ensure WebSockets are enabled

## Troubleshooting

### WebSocket Connection Issues

If you're experiencing WebSocket connection issues:

1. Check that Cloudflare has WebSockets enabled
2. Verify SSL/TLS is set to "Full" mode
3. Ensure the `NEXT_PUBLIC_WEBSOCKET_URL` is correctly set with `wss://` protocol
4. Check Railway logs for any connection errors

### Railway Port Configuration

Both services should automatically use the `PORT` environment variable provided by Railway. If you encounter port-related issues:

1. Verify that the WebSocket server is using `process.env.PORT || 8080`
2. Check Railway logs for any port binding errors

## Multiple Service Management

Since this application requires two separate services, consider using Railway's project grouping feature to keep them organized. This allows you to manage both services from a single dashboard.
