import { Vector3 } from 'three'
import { closestU, journeyCurve } from './paths.js'

// Camera pose for the intro fly-in and the "Overview" button.
export const OVERVIEW = {
  position: [1, 22, 32],
  target: [1, 0, -1],
}

// Each station: where the camera goes, where the request packet stops, and
// the teaching content shown in the side panel.
export const STATIONS = [
  {
    id: 'laptop',
    name: 'Laptop',
    role: 'Client',
    layer: 'OSI 7 → 2 · Application to Data Link',
    labelPosition: [-16, 2.9, 0.6],
    camera: { position: [-12.4, 3.2, 6.6], target: [-15.4, 1.35, 0.6] },
    packetAnchor: new Vector3(-16.0, 1.35, 0.85),
    title: 'The request is born',
    lead: 'You type example.com and press Enter. Before a single bit leaves the machine, the operating system prepares the request.',
    points: [
      'DNS resolves the name example.com to an IP address (93.184.216.34).',
      'TCP and TLS handshakes open a secure connection to port 443.',
      'The HTTP GET is split into packets, each wrapped in TCP, IP and Ethernet headers (encapsulation).',
      'The network card turns those bits into electrical signals on the copper Ethernet cable.',
    ],
    header: {
      Source: '192.168.1.23 : 52144',
      Destination: '93.184.216.34 : 443',
      TTL: '64',
      Medium: 'Copper · Cat6 Ethernet',
    },
  },
  {
    id: 'router',
    name: 'Router',
    role: 'Home gateway',
    layer: 'OSI 3 · Network',
    labelPosition: [-8, 2.85, -1],
    camera: { position: [-5.4, 2.9, 4.4], target: [-8, 0.9, -1] },
    packetAnchor: new Vector3(-8.0, 1.6, -0.85),
    title: 'Routing and NAT',
    lead: 'The home router is the doorway between your private network and the public Internet.',
    points: [
      'NAT rewrites the private source address 192.168.1.23 to the public address 203.0.113.7 and remembers the port mapping.',
      'It reads the destination IP, checks its routing table and sends the packet to the ISP via the default route.',
      'TTL (time to live) drops by one at every router hop, so lost packets cannot loop forever.',
      'The optical network terminal (ONT) converts electrical signals into pulses of laser light.',
    ],
    header: {
      Source: '203.0.113.7 : 52144',
      Destination: '93.184.216.34 : 443',
      TTL: '63',
      Medium: 'Electrical → Optical',
    },
  },
  {
    id: 'fiber',
    name: 'Fibre Optics',
    role: 'ISP backbone',
    layer: 'OSI 1 · Physical',
    labelPosition: [2, 1.0, 1],
    camera: { position: [3.6, 2.1, 4.4], target: [1.8, 0.1, 0.7] },
    packetAnchor: new Vector3(2.0, 0.08, 1.0),
    title: 'Bits become light',
    lead: 'In the backbone the packet is just a rapid flicker of laser light inside a hair-thin strand of glass.',
    points: [
      'A laser switches on and off billions of times per second: light = 1, dark = 0.',
      'Total internal reflection keeps the light trapped inside a ~9 µm glass core.',
      'Light in glass travels about 200,000 km/s (≈ ⅔ c), roughly 5 µs per kilometre.',
      'DWDM lets dozens of colours (wavelengths) share one strand; amplifiers boost the signal every ~80 km.',
    ],
    header: {
      Source: '203.0.113.7 : 52144',
      Destination: '93.184.216.34 : 443',
      TTL: '57 (after several ISP hops)',
      Medium: 'Single-mode fibre · 1550 nm',
    },
  },
  {
    id: 'server',
    name: 'Server',
    role: 'Data centre',
    layer: 'OSI 1 → 7 · back up the stack',
    labelPosition: [15.9, 4.1, -0.5],
    camera: { position: [11.2, 3.6, 6.2], target: [15.6, 1.7, -0.5] },
    packetAnchor: new Vector3(14.85, 1.55, 0.3),
    title: 'The server answers',
    lead: 'The packet reaches the data centre, where the layers are peeled off in reverse order (decapsulation).',
    points: [
      'A load balancer picks one of many web servers to handle the request.',
      'The OS reassembles the TCP segments in order; TLS decrypts them.',
      'The web server processes GET /index.html, perhaps querying a cache or database.',
      'An HTTP 200 OK response travels back along the same kind of path (amber pulses). Round trip: typically 10–100 ms.',
    ],
    header: {
      Source: '203.0.113.7 : 52144',
      Destination: '93.184.216.34 : 443',
      TTL: '52',
      Response: 'HTTP/1.1 200 OK',
    },
  },
]

// Where along the journey curve (0..1) the packet rests at each station.
STATIONS.forEach((s) => {
  s.u = closestU(journeyCurve, s.packetAnchor)
})

/** Shared animation length for camera moves and packet travel (seconds). */
export const TRAVEL_SECONDS = 2.6
