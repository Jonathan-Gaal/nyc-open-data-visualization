# HPD Violations React App - Setup & Deploy

## Quick Setup (5 minutes)

### Option 1: Create React App (Easiest)

```bash
# Create new React app
npx create-react-app hpd-violations

cd hpd-violations

# Install Chart.js
npm install chart.js react-chartjs-2

# Replace src/App.jsx with the provided App.jsx file
# (Copy the entire App.jsx content into src/App.jsx)

# Run locally
npm start
```

App opens at `http://localhost:3000`

---

### Option 2: Vite (Faster)

```bash
# Create with Vite
npm create vite@latest hpd-violations -- --template react

cd hpd-violations

# Install dependencies
npm install
npm install chart.js react-chartjs-2

# Replace src/App.jsx with provided App.jsx

# Run
npm run dev
```

---

## Deploy to Vercel (30 seconds)

1. Push to GitHub:
```bash
git add .
git commit -m "Add HPD violations visualization"
git push
```

2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"** → Select your GitHub repo
4. Vercel auto-detects React → Click **Deploy**
5. **Done** — Get your live URL

---

## Deploy to Netlify

1. Build production:
```bash
npm run build
```

2. Go to [netlify.com](https://netlify.com)
3. Drag the `build/` folder into Netlify
4. **Live URL instantly**

---

## Features

✅ Live API connection to NYC Open Data  
✅ Interactive ZIP code selector  
✅ Reissuance multiplier (hero insight)  
✅ Chronic buildings visualization  
✅ Status code analysis  
✅ Rent-impairing violations breakdown  
✅ Full data table  
✅ Responsive design  

---

## What the App Shows

### The Core Insight
- **Original violations** → ~6 years open
- **Reissued violations** → ~32 years open  
- **5.3x multiplier** = system fails to escalate

### Visualizations
1. **Reissuance Impact** — Bar chart original vs reissued
2. **Chronic Offenders** — Top 10 buildings by violation count
3. **Status Codes** — Which statuses trap violations longest
4. **Rent-Impairing** — Tenant harm by class
5. **Data Table** — First 50 violations with details

---

## File Structure (After Setup)

```
hpd-violations/
├── src/
│   ├── App.jsx          (the provided React component)
│   ├── index.jsx
│   └── ...
├── package.json
├── public/
└── ...
```

---

## Submit Your URL

Once deployed:
1. Copy your live URL (Vercel or Netlify)
2. Use Assignment button to submit

That's it!
