<p align="center">
  <img src="https://img.icons8.com/3d-fluency/94/globe-earth.png" alt="GeoSense Logo" width="100" height="100">
</p>

<h1 align="center">🌍 GeoSense</h1>

<p align="center">
  <strong>AI-Powered Satellite Land Segmentation → Blockchain NFT Tokenization — From pixel to deed in under 2 minutes.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/HQ--SAM-Meta_AI-0467DF?style=for-the-badge&logo=meta&logoColor=white" alt="HQ-SAM">
  <img src="https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/github/stars/aditya-s45/GeoSense2?style=for-the-badge&logo=github" alt="GitHub Stars">
  <img src="https://img.shields.io/badge/Status-Hackathon_Ready-e94560?style=for-the-badge" alt="Hackathon Ready">
  <img src="https://img.shields.io/badge/Contracts-Deployed-purple?style=for-the-badge" alt="Deployed">
</p>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Smart Contracts](#-smart-contracts)
- [AI Engine Deep Dive](#-ai-engine-deep-dive)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 😤 The Problem

Land ownership is one of the most broken systems on the planet. Here's why:

| Challenge | Impact |
|---|---|
| **70% of global land is unregistered** | Billions of people have no legal proof of ownership |
| **Manual surveying costs $5,000+** | Pricing out small farmers and rural communities |
| **Weeks of fieldwork** | A single surveyor with GPS equipment, walking the perimeter |
| **Paper-based registries** | Forgeable, losable, corruptible by officials |
| **No interoperability** | Government land records can't talk to banks, insurers, or GIS software |
| **Expensive appraisals** | $300-$500 per parcel just to estimate what land is worth |
| **Opaque trading** | Buying land requires lawyers, notaries, escrow agents, and 30-90 days |

> **Bottom line:** If you're a farmer in rural India, Africa, or South America — you could be sitting on ancestral land your family has worked for generations, and you have **zero verifiable proof** that it's yours. If a developer or government wants to take it, there's nothing on paper to stop them. 💀

---

## 💡 The Solution

**GeoSense** replaces the entire $300B land surveying industry with a browser tab. You draw a box on a satellite map, AI detects the parcels, and a smart contract mints your deed — in **under 2 minutes**.

```
┌──────────────────────────────────────────────────────────┐
│            WHAT YOU DO (3 things)                         │
│                                                          │
│   1. Draw a rectangle on the satellite map               │
│   2. Click "Start AI Land Detection"                     │
│   3. Confirm the MetaMask transaction                    │
│                                                          │
│            WHAT GEOSENSE DOES (everything else)          │
│                                                          │
│   ✅ Downloads high-res satellite tiles (zoom level 18)   │
│   ✅ Stitches tiles into a georeferenced GeoTIFF          │
│   ✅ Runs Meta's HQ-SAM AI to segment land parcels       │
│   ✅ Converts raster masks → vector polygon geometries    │
│   ✅ Computes geodesic area on WGS84 ellipsoid (cm²)     │
│   ✅ Analyzes RGB spectral data for land classification   │
│   ✅ Appraises land value using pseudo-NDVI greenness     │
│   ✅ Renders interactive polygons on a Leaflet map        │
│   ✅ Lets you select & combine multiple parcels           │
│   ✅ Mints an ERC-721 NFT with on-chain coordinates      │
│   ✅ Stores area, value, timestamp permanently on-chain   │
│   ✅ Enables P2P trading via trustless escrow contracts   │
│   ✅ Exports exact boundaries as GeoJSON for QGIS/ArcGIS │
│   ✅ Provides portfolio dashboard with property cards     │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🛰️ Satellite Imagery Engine
- Multi-threaded tile downloading from Google Maps satellite layer (zoom 18 = ~0.6m/pixel)
- Automatic zoom-level reduction if requested area exceeds 100 tiles (prevents rate-limiting)
- Concurrent 10-thread `ThreadPoolExecutor` for parallel fetching of 256×256 tiles
- Spatial affine transform matrix computed via `rasterio.transform.from_bounds()`
- Output: Georeferenced 3-band RGB GeoTIFF with `EPSG:4326` CRS

### 🧠 AI Land Segmentation (HQ-SAM)
- Meta's **High-Quality Segment Anything Model** with ViT-H backbone (~2.5GB)
- 95% IoU confidence threshold filters out low-quality detections
- Automatic CPU fallback via `torch.load` monkey-patch (no GPU required)
- Raster-to-vector conversion: binary masks → `shapely` polygon geometries
- Serialized as `GeoDataFrame` pickle for instant retrieval

### 📐 Geodesic Area Calculator
- **Not** projected area (which distorts near the poles) — true **geodesic** area
- Uses `pyproj.Geod(ellps='WGS84')` for ellipsoidal calculations
- Accurate to centimeter-level precision on any coordinate on Earth
- Supports multi-polygon unions for combined parcel calculations

### 🌿 AI Land Valuation Engine
- Masks each polygon on the satellite GeoTIFF to extract pixel data
- Computes mean Red, Green, Blue channel intensities per parcel
- Calculates pseudo-NDVI Greenness Index for land classification
- Three-tier quality grading with price multipliers:

| Greenness Index | Classification | Multiplier | Example |
|---|---|---|---|
| `> 0.05` | 🌿 Lush Vegetation | 1.5× | Farmland, forests |
| `< -0.05` | 🏙️ Urban / Developed | 2.0× | Cities, buildings |
| Otherwise | 🏜️ Barren / Scrub | 0.8× | Desert, wasteland |

> **Base rate:** 100 GEO tokens per hectare (10,000 m²)

### 🪙 ERC-721 Land NFTs
- Each land parcel minted as a unique NFT on Ethereum Sepolia
- On-chain metadata: `coordinates` (GeoJSON), `areaSqMeters`, `estimatedValue`, `originalTokenizer`, `timestamp`
- Full `getLandDetails()` function for programmatic access
- Compatible with OpenSea and all ERC-721 marketplaces

### 🏪 P2P Marketplace with Escrow
- Sellers list their GeoNFT at a price in GEO tokens
- NFT is transferred to the `LandEscrow` contract (trustless custody)
- Buyers approve & fund the escrow with GEO tokens
- Either party completes the swap: NFT → Buyer, GEO → Seller
- Protected by `ReentrancyGuard` against re-entrancy attacks

### 🗳️ DAO Governance
- Token-weighted voting on platform proposals
- Minimum quorum: 1,000 GEO tokens to create proposals
- Configurable voting periods
- On-chain execution tracking

### 🗺️ GeoJSON Export
- One-click download of your NFT's exact polygon boundaries
- Standard `.geojson` FeatureCollection format
- Directly importable into QGIS, ArcGIS, Google Earth Pro, Mapbox

### 📊 Portfolio Dashboard
- Visual property cards for every owned GeoNFT
- Displays Token ID, area (hectares), estimated value (GEO)
- Total portfolio stats: parcels owned, total area, total value
- Direct blockchain queries via `ownerOf()` + `landParcels()` calls

### 🎨 Premium UI
- Glassmorphism design system with `backdrop-blur` + translucent borders
- Dark space theme (`#0a0a0f` background)
- Framer Motion page transitions and micro-animations
- Custom `DecryptedText` scramble effect on the landing page
- Geist font family (Sans + Mono)
- Fully responsive mobile layout

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         GEOSENSE SYSTEM ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────┐    REST API    ┌──────────────────┐  │
│  │     FRONTEND (Next.js 16)        │◄──────────────►│   BACKEND        │  │
│  │     Port 3000                    │   /minmax      │   (Flask)        │  │
│  │                                  │   /status      │   Port 7860      │  │
│  │  • React 19 + Tailwind v4        │   /get-segments│                  │  │
│  │  • Leaflet + Draw Tools          │   /calc-areas  │  • HQ-SAM AI     │  │
│  │  • Wagmi + RainbowKit            │                │  • Tile Fetcher   │  │
│  │  • Framer Motion                 │                │  • Geodesic Calc  │  │
│  │  • GeoJSON Rendering             │                │  • Spectral Val.  │  │
│  └─────────────┬────────────────────┘                └────────┬─────────┘  │
│                │                                              │            │
│                │ Wagmi writeContract()                         │            │
│                │ Viem readContract()                           │            │
│                ▼                                              ▼            │
│  ┌──────────────────────────────────┐         ┌──────────────────────────┐ │
│  │     ETHEREUM SEPOLIA             │         │     TEMP FILE SYSTEM     │ │
│  │                                  │         │                          │ │
│  │  ┌────────────┐ ┌─────────────┐  │         │  temp/imagery/           │ │
│  │  │ GeoToken   │ │ GeoNFT      │  │         │    └── temp_satellite.tif│ │
│  │  │ (ERC-20)   │ │ (ERC-721)   │  │         │  temp/segmentation/      │ │
│  │  │            │ │             │  │         │    ├── temp_masks.tif     │ │
│  │  │ 10M supply │ │ Land Deeds  │  │         │    ├── temp_polygons.pkl │ │
│  │  └─────┬──────┘ └──────┬──────┘  │         │    └── temp_polygons.shp │ │
│  │        │                │         │         └──────────────────────────┘ │
│  │        ▼                ▼         │                                      │
│  │  ┌────────────┐ ┌─────────────┐  │                                      │
│  │  │LandEscrow  │ │ GeoDAO      │  │                                      │
│  │  │(P2P Trade) │ │(Governance) │  │                                      │
│  │  └────────────┘ └─────────────┘  │                                      │
│  └──────────────────────────────────┘                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User draws bounding box on satellite map
        │
        ▼
┌─────────────────────────────────────────┐
│  STEP 1: SATELLITE DOWNLOAD             │  ~3-8s
│  ├─ Convert WGS84 bbox → tile grid     │
│  ├─ Download 256×256 tiles (10 threads) │
│  ├─ Stitch into single RGB image        │
│  ├─ Compute affine transform matrix     │
│  └─ Save as GeoTIFF (EPSG:4326)         │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  STEP 2: AI SEGMENTATION                │  ~15-45s
│  ├─ Convert GeoTIFF → PNG               │
│  ├─ Load HQ-SAM ViT-H (2.5GB)          │
│  ├─ Run automatic mask generation       │
│  ├─ Filter: IoU ≥ 0.90, stability ≥ 0.95│
│  ├─ Remove micro-artifacts (< 5000 px)  │
│  ├─ Generate binary mask GeoTIFF        │
│  └─ Convert raster masks → polygons     │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  STEP 3: ANALYSIS & VALUATION           │  ~1-2s
│  ├─ Reproject polygons to WGS84         │
│  ├─ Compute geodesic area (pyproj)      │
│  ├─ Mask satellite image per polygon    │
│  ├─ Extract mean R, G, B intensities    │
│  ├─ Calculate pseudo-NDVI greenness     │
│  ├─ Classify: Lush / Urban / Barren     │
│  ├─ Apply price multiplier              │
│  └─ Return GeoJSON with metadata        │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  STEP 4: INTERACTIVE SELECTION          │  User action
│  ├─ Render polygons on Leaflet map      │
│  ├─ User clicks to select parcels       │
│  ├─ Calculate combined area             │
│  └─ Show AI appraisal (quality + GEO)   │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  STEP 5: BLOCKCHAIN MINTING            │  ~15-30s
│  ├─ Pack coordinates as GeoJSON string  │
│  ├─ Call tokenizeLand() on GeoNFT       │
│  ├─ ⏸️  User confirms in MetaMask        │
│  ├─ Store on-chain: coords, area, value │
│  └─ NFT minted to user's wallet         │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  STEP 6: POST-MINT OPTIONS              │
│  ├─ View in Portfolio Dashboard         │
│  ├─ Export boundaries as .geojson       │
│  ├─ List for sale on P2P Marketplace    │
│  └─ Vote on DAO governance proposals    │
└─────────────────────────────────────────┘
               │
               ▼
            DONE 🎉
```

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.3 | SSR, routing, React Server Components |
| **UI Library** | React | 19 RC | Component-based UI rendering |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS with custom theme |
| **Animations** | Framer Motion | 12.x | Page transitions, micro-interactions |
| **Maps** | Leaflet + React-Leaflet | 1.9 / 5.0 | Interactive satellite maps |
| **Drawing** | Leaflet-Draw | 1.0.4 | Bounding box rectangle tool |
| **Search** | Leaflet-GeoSearch | 4.2 | Location search bar |
| **Web3 Wallet** | RainbowKit | 2.2 | MetaMask connection modal |
| **Ethereum Hooks** | Wagmi | 2.19 | `useWriteContract`, `useReadContract` |
| **Ethereum Client** | Viem | 2.38 | Low-level blockchain reads |
| **State** | TanStack React Query | 5.x | Server state caching |
| **UI Primitives** | Radix UI | Latest | Accessible accordion, dialog, tabs |
| **Typography** | Geist (Sans + Mono) | — | Vercel's modern font family |

### Backend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Python | 3.11 | Backend language |
| **Web Server** | Flask | 3.0 | REST API routing |
| **CORS** | Flask-CORS | 4.0 | Cross-origin request handling |
| **AI Model** | HQ-SAM (samgeo) | ViT-H | Land parcel segmentation |
| **Deep Learning** | PyTorch | Latest | Model inference engine |
| **Computer Vision** | OpenCV | 4.8 | Image processing |
| **Raster I/O** | Rasterio | 1.3 | GeoTIFF read/write/masking |
| **Geospatial** | GeoPandas | 0.14 | Spatial DataFrames & GeoJSON |
| **Projections** | PyProj | 3.6 | WGS84 geodesic area calc |
| **Geometry** | Shapely | 2.0 | Polygon manipulation |
| **Image Processing** | Pillow | 10.1 | Tile stitching |
| **HTTP** | Requests | 2.31 | Satellite tile download |
| **Concurrency** | concurrent.futures | stdlib | 10-thread parallel downloads |
| **Visualization** | Matplotlib | 3.8 | Segmentation overlay plots |

### Blockchain

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Language** | Solidity | 0.8.24 | Smart contract development |
| **Framework** | Hardhat | 2.22 | Compile, test, deploy |
| **Standards** | OpenZeppelin | 5.0 | ERC-20, ERC-721, Ownable, ReentrancyGuard |
| **Network** | Ethereum Sepolia | — | Testnet deployment |
| **RPC Provider** | Alchemy | — | Blockchain node access |
| **Deployment** | Hardhat scripts | — | Automated contract deployment |

### Infrastructure

| Tool | Purpose |
|---|---|
| **Docker** | Containerized backend deployment |
| **Google Maps Tiles** | Satellite imagery source |
| **HuggingFace** | HQ-SAM model hosting & download |
| **Alchemy** | Sepolia RPC endpoint |
| **WalletConnect** | Multi-wallet support |

---

## ⚙️ How It Works

### The AI Pipeline — Technical Deep Dive

#### 1. Coordinate → Tile Conversion

GeoSense converts latitude/longitude coordinates to Google Maps tile indices using the [Slippy Map Tilenames](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) convention:

```python
def deg2num(lat_deg, lon_deg, zoom):
    """Convert WGS84 coordinates to tile grid position."""
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)
```

#### 2. Concurrent Tile Download

Instead of downloading tiles one-by-one (which would take 30+ seconds for a 50-tile region), GeoSense uses a 10-thread pool:

```python
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    future_to_coords = {
        executor.submit(download_tile, x, y, zoom): (x, y)
        for x in range(x_min, x_max + 1)
        for y in range(y_min, y_max + 1)
    }
```

#### 3. GeoTIFF Stitching

Individual tiles are stitched into a single image and saved as a georeferenced GeoTIFF:

```python
transform = from_bounds(
    actual_min_lon, actual_min_lat,
    actual_max_lon, actual_max_lat,
    stitched_image.width, stitched_image.height
)

with rasterio.open(output_path, 'w', driver='GTiff',
                   height=height, width=width,
                   count=3, dtype='uint8',
                   crs='EPSG:4326', transform=transform) as dst:
    dst.write(img_array)
```

#### 4. HQ-SAM Segmentation

The segmentation engine uses carefully tuned parameters for land detection:

```python
sam_kwargs = {
    "points_per_side": 24,          # Grid sampling density
    "pred_iou_thresh": 0.90,        # 90% IoU confidence minimum
    "stability_score_thresh": 0.95, # 95% mask stability
    "min_mask_region_area": 5000,   # Ignore < 5000px artifacts
    "box_nms_thresh": 0.7,          # Non-max suppression
    "crop_nms_thresh": 0.7,         # Crop overlap handling
    "crop_overlap_ratio": 0.34,     # Overlap between crop regions
}
```

#### 5. Spectral Land Valuation

Each detected parcel is individually masked on the satellite image to extract its RGB pixel values, then classified using a pseudo-NDVI Greenness Index:

```python
# Extract mean channel intensities for the parcel
r = np.mean(out_image[0][mask])  # Red channel
g = np.mean(out_image[1][mask])  # Green channel
b = np.mean(out_image[2][mask])  # Blue channel

# Pseudo-NDVI: measures vegetation density
greenness = (g - r) / (g + r + 0.01)

# Classification & pricing
if greenness > 0.05:
    quality = "Lush Vegetation"   # Farmland, forests
    multiplier = 1.5
elif greenness < -0.05:
    quality = "Urban / Developed"  # Buildings, roads
    multiplier = 2.0
else:
    quality = "Barren / Scrub"     # Wasteland, desert
    multiplier = 0.8

# Base: 100 GEO tokens per hectare × quality multiplier
estimated_value = round((area / 10000) * 100 * multiplier)
```

#### 6. CPU Compatibility Patch

HQ-SAM ships with CUDA-trained weights that crash on CPU-only machines. GeoSense solves this at the Python import level:

```python
# Monkey-patch torch.load BEFORE importing samgeo
original_torch_load = torch.load

def cpu_torch_load(path, map_location=None, **kwargs):
    return original_torch_load(path, map_location=torch.device('cpu'), **kwargs)

torch.load = cpu_torch_load  # All subsequent loads go to CPU

from samgeo.hq_sam import SamGeo  # Now loads without CUDA error
```

> This was a critical fix — without it, `torch.cuda.is_available() is False` causes an immediate crash during model deserialization.

---

## 📁 Project Structure

```
GeoSense/
│
├── 📄 README.md                        # You are here
├── 📄 update_abi.js                    # Auto-sync contract ABIs → frontend
├── 📄 environment.yml                  # Conda environment spec
├── 📄 requirements.txt                 # Root Python dependencies
│
├── 📁 blockchain/                      # ⛓️ Smart Contracts
│   ├── 📁 contracts/
│   │   ├── GeoToken.sol                #    ERC-20 utility & governance token
│   │   ├── GeoNFT.sol                  #    ERC-721 land parcel NFT
│   │   ├── LandEscrow.sol              #    Trustless P2P escrow trading
│   │   └── GeoDAO.sol                  #    On-chain DAO governance
│   ├── 📁 scripts/
│   │   └── deploy.js                   #    Hardhat deployment script
│   ├── hardhat.config.js               #    Solidity compiler + network config
│   └── package.json
│
├── 📁 client-2/                        # 🖥️ Next.js 16 Frontend
│   ├── 📁 app/
│   │   ├── layout.jsx                  #    Root layout (fonts + providers)
│   │   ├── page.jsx                    #    Landing page (hero + globe)
│   │   ├── provider.jsx                #    Wagmi + RainbowKit + React Query
│   │   ├── globals.css                 #    Tailwind v4 theme + glassmorphism
│   │   ├── 📁 geosense/
│   │   │   └── page.jsx                #    🗺️ Map Interface + AI Trigger
│   │   ├── 📁 dashboard/
│   │   │   └── page.jsx                #    📊 Portfolio + GeoJSON Export
│   │   └── 📁 marketplace/
│   │       └── page.jsx                #    🏪 P2P Marketplace
│   ├── 📁 components/
│   │   ├── Navbar.jsx                  #    Glassmorphic nav + wallet button
│   │   ├── hero_section.jsx            #    Animated landing with globe
│   │   ├── MapComponent.jsx            #    Leaflet map + polygon overlays
│   │   ├── SideBar.jsx                 #    AI workflow panel + NFT minting
│   │   ├── FeatureCard.jsx             #    BBox display + progress bar
│   │   ├── SearchControl.jsx           #    Map location search
│   │   ├── SearchSidebar.jsx           #    Search results panel
│   │   └── 📁 ui/                      #    Radix UI primitives
│   ├── 📁 config/
│   │   └── contracts.js                #    Deployed addresses + ABIs
│   ├── 📁 hooks/
│   │   └── useContracts.js             #    useTokenizeLand, useLandDetails
│   ├── 📁 lib/
│   │   ├── EditControl.js              #    Leaflet-Draw wrapper
│   │   └── utils.js                    #    Utility functions
│   ├── 📁 ui_comp/
│   │   ├── text.js                     #    SplitText animation component
│   │   └── de_para.js                  #    DecryptedText scramble effect
│   └── package.json
│
├── 📁 server/                          # 🐍 Python AI Backend
│   ├── server.py                       #    Flask REST API (5 endpoints)
│   ├── segment_land_hqsam.py           #    HQ-SAM segmentation engine
│   ├── download_tiles.py               #    Satellite tile fetcher + stitcher
│   ├── requirements.txt                #    Python dependencies
│   └── Dockerfile                      #    Docker deployment config
│
└── 📁 temp/                            # 📂 Runtime artifacts
    ├── 📁 imagery/
    │   └── temp_satellite.tif          #    Stitched GeoTIFF
    └── 📁 segmentation/
        ├── temp_masks.tif              #    Binary segmentation masks
        ├── temp_polygons.pkl           #    GeoDataFrame (pickle)
        └── temp_polygons.shp           #    Shapefile output
```

### File Size Breakdown

| File | Lines | Role |
|---|---|---|
| `server.py` | 237 | Flask API — routing, area calc, valuation engine |
| `segment_land_hqsam.py` | 206 | HQ-SAM model loading, segmentation, mask→polygon |
| `download_tiles.py` | 125 | Tile fetcher, concurrent downloader, GeoTIFF stitcher |
| `MapComponent.jsx` | 400+ | Leaflet map, draw tools, polygon rendering |
| `SideBar.jsx` | 300+ | 4-step workflow panel, NFT minting trigger |
| `FeatureCard.jsx` | 185 | BBox card, AI trigger, real-time progress polling |
| `marketplace/page.jsx` | 335 | Escrow creation, funding, completion UI |
| `dashboard/page.jsx` | 190 | Portfolio stats, property cards, GeoJSON export |
| `contracts.js` | 11 | All 4 contract addresses + full ABIs |

---

## 🚀 Installation

### Prerequisites

| Requirement | Version | Check |
|---|---|---|
| **Node.js** | ≥ 18.x | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **Python** | ≥ 3.9 | `python --version` |
| **MetaMask** | Latest | Browser extension |
| **Git** | Latest | `git --version` |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/aditya-s45/GeoSense2.git
cd GeoSense2/Geosense-interiiit-main
```

### 2️⃣ Setup the AI Backend

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install core dependencies
pip install -r requirements.txt

# Install PyTorch (CPU-only build — no GPU needed)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install HQ-SAM geospatial library
pip install segment-geospatial[hq]

# Start the backend
python server.py
```

> 🟢 Server starts on `http://127.0.0.1:7860`
>
> ⚠️ **First run:** The HQ-SAM model (~2.5GB) auto-downloads on the first segmentation request. This only happens once.

### 3️⃣ Setup the Frontend

```bash
# Open a new terminal
cd client-2

# Install dependencies
npm install

# Create environment config
echo NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:7860 > .env.local

# Start the dev server
npm run dev
```

> 🟢 Frontend starts on `http://localhost:3000`

### 4️⃣ Setup Smart Contracts *(Optional — already deployed on Sepolia)*

```bash
cd blockchain

# Install dependencies
npm install

# Option A: Local Hardhat network
npx hardhat node                                       # Terminal 1
npx hardhat run scripts/deploy.js --network localhost   # Terminal 2

# Option B: Deploy to Sepolia testnet
# (Requires ALCHEMY_API_URL and PRIVATE_KEY in blockchain/.env)
npx hardhat run scripts/deploy.js --network sepolia
```

### 5️⃣ Connect Your Wallet

1. Open `http://localhost:3000` in your browser
2. Click the wallet button in the navbar → Connect **MetaMask**
3. Switch to **Sepolia Testnet** in MetaMask
4. Get free test ETH from [Google Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Alchemy Faucet](https://sepoliafaucet.com/)

---

## 🖥️ Usage

### Step 1: Enter Mission Control 🚀
Click **"Enter Mission Control"** on the landing page. The animated globe shifts, and the interface reveals itself with a typing/decrypt effect.

### Step 2: Draw a Boundary 📍
On the Map Interface, use the **rectangle draw tool** (top-left corner of the map) to select a region of interest on the satellite imagery.

### Step 3: AI Land Detection 🧠
Click **"Start AI Land Detection"** in the sidebar card. Watch the real-time progress bar:
- `25%` — Downloading satellite tiles...
- `50%` — Running AI segmentation...
- `100%` — Complete!

### Step 4: Select Parcels 📐
Detected land parcels appear as interactive polygons. **Click on parcels** to select them (they highlight). Click **"Calculate Total Area"** to see:
- Exact geodesic area in m² and hectares
- Land quality classification (Lush / Urban / Barren)
- Estimated value in GEO tokens

### Step 5: Mint Your Deed 🪙
Click **"Mint GeoNFT for these Parcels"** → Confirm the MetaMask popup → Wait for the transaction to confirm on Sepolia.

### Step 6: Manage & Trade 📊
- **Dashboard:** View your portfolio cards, total stats, and export any parcel as `.geojson`
- **Marketplace:** List parcels for sale or buy others' land through trustless escrow

### Pro Tips 🎯

> - **Zoom in close** before drawing your bounding box — HQ-SAM works best at zoom level 16-18
> - **Smaller regions** = faster processing. Start with a neighborhood block, not an entire city
> - **Google Satellite** tile layer gives the best segmentation results (vs. OpenStreetMap)
> - **The GeoJSON export** is a real `.geojson` file that opens directly in QGIS or [geojson.io](https://geojson.io/)

---

## 🔗 Smart Contracts

> All contracts are live and verified on **Ethereum Sepolia Testnet**.

| Contract | Address | Standard | Purpose |
|---|---|---|---|
| **GeoToken** | [`0x10fFe5...ab5A5`](https://sepolia.etherscan.io/address/0x10fFe5f723B0D9d8Bef3B833686630eA5B8ab5A5) | ERC-20 | Utility & governance token (10M supply) |
| **GeoNFT** | [`0xa0954...Ef688`](https://sepolia.etherscan.io/address/0xa09541C11897A5229e8f2D85CD95c129199Ef688) | ERC-721 | Land parcel deed NFT |
| **LandEscrow** | [`0xaf683...25bB9`](https://sepolia.etherscan.io/address/0xaf683a58BbfAD52BeA58e12E6D60Ee5f7f225bB9) | Custom | Trustless P2P escrow trading |
| **GeoDAO** | [`0xCf7Ed...0Fc9`](https://sepolia.etherscan.io/address/0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9) | Custom | On-chain DAO governance |

### Contract Interaction Flow

```
                    ┌─────────────┐
                    │   GeoToken  │
                    │   (ERC-20)  │
                    │             │
                    │  10M Supply │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌────────────┐ ┌─────────┐ ┌─────────┐
       │ LandEscrow │ │ GeoNFT  │ │ GeoDAO  │
       │            │ │(ERC-721)│ │         │
       │ • create   │ │         │ │ • create│
       │ • fund     │ │ • mint  │ │ • vote  │
       │ • complete │ │ • query │ │ • exec  │
       └────────────┘ └─────────┘ └─────────┘
```

### Key Contract Functions

| Contract | Function | What It Does |
|---|---|---|
| `GeoNFT` | `tokenizeLand(to, uri, coordinates, area, value)` | Mints a new land NFT with on-chain metadata |
| `GeoNFT` | `getLandDetails(tokenId)` | Returns full parcel metadata (coords, area, value, timestamp) |
| `GeoNFT` | `landParcels(tokenId)` | Direct mapping access to land struct |
| `GeoToken` | `mint(to, amount)` | Owner-only token minting |
| `LandEscrow` | `createEscrow(tokenId, price)` | List an NFT for sale (transfers to contract) |
| `LandEscrow` | `fundEscrow(escrowId)` | Buyer deposits GEO tokens |
| `LandEscrow` | `completeEscrow(escrowId)` | Atomic swap: NFT → Buyer, GEO → Seller |
| `GeoDAO` | `createProposal(description, votingPeriod)` | Start a governance vote (requires 1000 GEO) |
| `GeoDAO` | `vote(proposalId, support)` | Cast token-weighted vote |

---

## 📡 API Reference

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/` | Health check | — | `{"status": "online", "version": "2.0"}` |
| `GET` | `/status` | Poll pipeline progress | — | `{"status": "segmenting", "progress": 50}` |
| `POST` | `/minmax` | Trigger download + segmentation | `{"min": [lat, lon], "max": [lat, lon]}` | `{"status": "success"}` |
| `GET` | `/get-segments` | Fetch detected parcels | — | GeoJSON with area, quality, value |
| `POST` | `/calculate-areas` | Compute areas for selected parcels | `{"selectedIds": [0, 1, 2]}` | `{"areas": {"0": 1234.56}}` |

---

## 🤝 Contributing

Contributions are what make the open-source community amazing. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Areas for Contribution
- 🌿 Carbon credit estimation based on vegetation density
- 🧩 Fractional ownership (ERC-1155) for large parcels
- 📱 Mobile-responsive map interface improvements
- 🔒 Zero-knowledge proof of land ownership
- 🗃️ IPFS metadata storage for NFTs
- 🌍 Multi-chain deployment (Polygon, Arbitrum)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with 🔥 by <a href="https://github.com/aditya-s45">Aditya Shingare</a></strong>
</p>

<p align="center">
  <em>Where AI meets the blockchain to democratize land ownership for the world.</em>
</p>

<p align="center">
  <sub>If GeoSense inspired you, consider giving it a ⭐ — it means more than you know.</sub>
</p>
