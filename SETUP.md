# HPD Violations React App - Complete Setup

## Files You Have

Download all these files:
- `package.json`
- `.gitignore`
- `.env`
- `App.jsx` (copy to `src/App.jsx`)
- `index.jsx` (copy to `src/index.jsx`)
- `index.html` (copy to `public/index.html`)
- `vercel.json`

## Local Setup (5 minutes)

```bash
# Remove old visualization folder
rm -rf /Users/jongaal/Documents/native_ai/L1/wk5/projects/nyc-open-data-project/visualization

# Create fresh folder
mkdir visualization
cd visualization

# Create folder structure
mkdir src public

# Copy all downloaded files into this folder:
# - package.json → root
# - .gitignore → root
# - .env → root
# - vercel.json → root
# - App.jsx → src/App.jsx
# - index.jsx → src/index.jsx
# - index.html → public/index.html

# Install dependencies
npm install

# Test locally
npm start
```

App opens at `http://localhost:3000`

## Deploy to Vercel (2 minutes)

```bash
# Initialize git
git init

# Add your remote
git remote add origin https://github.com/Jonathan-Gaal/nyc-open-data-visualization.git

# Commit everything
git add .
git commit -m "HPD violations visualization"

# Push
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Select your GitHub repo
4. Click **Deploy**
5. Copy your live URL
6. Submit via Assignment button

Done.
