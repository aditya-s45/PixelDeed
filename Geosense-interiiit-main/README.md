# GeoSense AI 🌍🚀

GeoSense is a Web3-powered Geospatial Intelligence Platform. It allows users to select land on a map, use AI to segment the land parcels and appraise their value based on vegetation greenness, and finally mint the land directly to the blockchain as an NFT.

This guide will walk you through setting up the project completely from scratch.

## Prerequisites
Before you start, ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher)
2. **Python** (v3.9 or higher) or Miniconda/Anaconda.
3. **Git**
4. **MetaMask** browser extension (for testing the Web3 integration).

---

## 🛠️ Step 1: Clone the Repository
Clone the repository and enter the project folder.
```bash
git clone https://github.com/aditya-s45/GeoSense2.git
cd GeoSense2/Geosense-interiiit-main
```

---

## ⛓️ Step 2: Set up the Blockchain Layer (Hardhat)
The blockchain layer contains the Smart Contracts (Solidity) for the GeoToken, GeoNFT, and DAO.

**1. Install dependencies:**
```bash
cd blockchain
npm install
```

**2. Start a local Ethereum Node:**
Open a dedicated terminal window (Terminal 1) for the blockchain node. This node will run locally on your machine.
```bash
npx hardhat node
```
*Leave this terminal open and running. It will output a list of Account Private Keys. Copy the very first Private Key (Account #0).*

**3. Deploy the Smart Contracts:**
Open a **new terminal window** (Terminal 2) in the `blockchain` directory. Deploy the contracts to your local node.
```bash
npx hardhat run scripts/deploy.js --network localhost
```

**4. Sync the Frontend (Important):**
Our React frontend needs to know the addresses of the newly deployed contracts. Go back to the root project folder and run the sync script:
```bash
cd ..
node update_abi.js
```

---

## 🧠 Step 3: Set up the AI Backend (Python & Flask)
The backend uses Python to download satellite imagery (`rasterio`) and segment it using AI heuristics. 

**1. Create a Virtual Environment (Highly Recommended):**
Open a **new terminal window** (Terminal 3) in the root project folder.
Using Conda:
```bash
conda create -n geosense python=3.9
conda activate geosense
```
Or using standard Python `venv`:
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

**2. Install Python Dependencies:**
```bash
pip install -r requirements.txt
pip install flask flask-cors geopandas rasterio shapely pyproj numpy pillow
```

**3. Start the Flask Server:**
```bash
python server/server.py
```
*Leave this terminal running. It should say: `Server running on http://127.0.0.1:5010`*

---

## 🖥️ Step 4: Set up the Frontend Client (Next.js)
The frontend (`client-2`) is a Next.js application that handles the interactive map and Web3 wallet connections.

**1. Install Frontend Dependencies:**
Open a **new terminal window** (Terminal 4).
```bash
cd client-2
npm install
```

**2. Start the Development Server:**
```bash
npm run dev
```

---

## ✅ Step 5: How to Run and Verify the Full Flow
With all 3 components running (Hardhat Node, Flask Server, Next.js Frontend), here is how to verify the app works from end-to-end!

### 1. Configure MetaMask for Local Testing
- Open the MetaMask extension in your browser.
- Click the network dropdown at the top left and select **Add network**.
- Scroll down and click **Add a network manually**.
- Enter the following details:
  - **Network Name:** Hardhat Localhost
  - **New RPC URL:** `http://127.0.0.1:8545`
  - **Chain ID:** `31337`
  - **Currency Symbol:** `ETH`
- Click Save and switch to this network.
- Click your profile icon -> **Import Account**. Paste the **Private Key** you copied from Terminal 1 during Step 2. You will now have 10,000 test ETH!

### 2. Connect to the App
- Open `http://localhost:3000` in your browser.
- Click **"Connect Wallet"** in the top right corner and connect your MetaMask test account.

### 3. Run the AI Pipeline
- Use the **Square/Rectangle tool** (on the left side of the map) to draw a bounding box over some land that contains green vegetation.
- Click the box you drew to open the popup.
- Click **"Start AI Land Detection"**.
- The right sidebar will open showing a **live progress bar**. The AI is downloading satellite imagery and segmenting the land.

### 4. Appraise and Mint
- Once the progress bar reaches 100%, blue polygons (land parcels) will appear on the map.
- Click on the polygons to select them.
- Look at the sidebar and click **"Calculate Total Area"**.
- The AI will calculate the Area and provide an **AI Appraised Value** based on the greenness of the satellite pixels!
- Finally, click the **"Mint GeoNFT"** button.
- MetaMask will ask you to confirm the transaction. Click **Confirm**.

🎉 **Congratulations! You have successfully appraised and tokenized land using AI and Web3!**
