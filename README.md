# 3d-internet-app

Interactive 3D network explainer website built with Three.js and React.

It follows one HTTP request (`GET /index.html`) as it travels through four
low-poly stations:

| # | Station | What it teaches |
|---|---------|-----------------|
| 1 | **Laptop** | DNS, TCP/TLS handshakes, encapsulation, NIC → electrical signal |
| 2 | **Router** | NAT, routing tables, TTL, electrical → optical (ONT) |
| 3 | **Fibre optics** | Bits as laser light, total internal reflection, speed of light in glass, DWDM |
| 4 | **Server** | Load balancing, decapsulation, HTTP `200 OK` response and round-trip time |

A timeline at the bottom moves the camera between the stations while a glowing
request packet travels along the cables. Light pulses stream continuously in
both directions: cyan for requests, amber for responses, pale blue for
electrical signals on copper and magenta for a second fibre wavelength. Each
step has a side panel showing how the packet header (source/destination IP,
TTL, medium) changes along the way.

## Running it

Requires Node.js 18+.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

### Controls

- **Timeline**: click a station, use ‹ › to step, or ▶ to play the tour automatically
- **Keyboard**: `←` `→` step · `1`–`4` jump · `Space` play/pause · `O` overview
- **Click** a 3D object or its floating label to fly to it
- Move the mouse for a gentle parallax effect

## Project structure

```
src/
  App.jsx               state: current station, autoplay, keyboard shortcuts
  stations.js           camera poses + teaching content for each station
  paths.js              cable routes (Catmull-Rom curves) shared by cables, pulses and packet
  scene/
    Scene.jsx           <Canvas>, lights, bloom, clickable stations
    CameraRig.jsx       eased, arcing camera flights between stations
    Packet.jsx          request packet + looping response packet
    Cables.jsx          Ethernet + fibre tubes and instanced light-pulse streams
    Laptop.jsx Router.jsx Server.jsx Environment.jsx   low-poly models
  ui/
    Timeline.jsx        bottom timeline
    InfoPanel.jsx       explanation + packet-header panel
```

All models are built from Three.js primitives with `flatShading`, so there are
no external assets to download.

## Ideas for student extensions

- Add a **DNS resolver** station before the router.
- Make the request **lose a packet** and show TCP retransmission.
- Add a slider for **distance to the server** and compute propagation delay
  (≈ 5 µs per km in fibre).
- Show **TLS encryption** by scrambling the packet label after the laptop.
- Replace the single path with several routers and animate **traceroute** hops
  with TTL counting down.

Built with [React](https://react.dev), [Three.js](https://threejs.org),
[React Three Fiber](https://r3f.docs.pmnd.rs), drei and
react-three/postprocessing.
