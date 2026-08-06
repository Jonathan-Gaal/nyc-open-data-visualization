# HPD Violations: Enforcement Gap Visualization

**One-Sentence Insight:** Violations fail due to lack of escalation mechanisms when landlords ignore notices, not due to lack of documentation.

## Quick Start (Local)

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the app
```bash
streamlit run app.py
```

The app opens at `http://localhost:8501`

### 3. Explore by ZIP Code
- Enter any NYC ZIP code in the sidebar
- Data updates live from NYC Open Data API
- **Default:** 11106 (Astoria)

---

## Deploy to Streamlit Cloud (Free)

### Step 1: Push to GitHub
```bash
cd /Users/jongaal/Documents/native_ai/L1/wk5/projects
git add visualizations/
git commit -m "Add HPD violations visualization"
git push
```

### Step 2: Deploy
1. Go to [streamlit.cloud](https://streamlit.io/cloud)
2. Click **"New app"**
3. Select your GitHub repo & `visualizations/app.py`
4. Click **Deploy**

**Your live URL will be:** `https://[username]-[repo]-[app-name].streamlit.app`

---

## Features

✅ **Live API Connection** — Pulls real-time violations from NYC Open Data  
✅ **Interactive ZIP Code Selector** — Explore any NYC neighborhood  
✅ **Hero Insight** — Reissuance multiplier effect (32 years vs 6 years)  
✅ **Chronic Offenders** — Top 10 buildings by violation count  
✅ **Status Analysis** — Which status codes trap violations longest  
✅ **Rent-Impairing Impact** — Direct tenant harm visualized  
✅ **Data Table** — Full violation records for deep dive  

---

## What It Shows

### The Enforcement Gap
- **Original violations** average ~6 years open
- **Reissued violations** average ~32 years open
- **5.3x worse** when a violation gets reissued

This proves: *The system doesn't fail to document violations — it fails to escalate them.*

### Chronic Offenders
- 10 buildings account for ~1,359 violations (in ZIP 11106)
- Shows geographic concentration of enforcement failure

### Dead-End Statuses
- "NOT COMPLIED WITH" → ~12 years stuck
- "SECOND NO ACCESS" → ~24 years stuck

### Rent-Impairing Impact
- Heat, hot water, safety violations average ~10 years
- Direct tenant harm with no escalation path

---

## Data Source

**NYC Open Data** — Housing Maintenance Code Violations  
Dataset: `wvxf-dwi5`  
Updated daily by NYC Department of Housing Preservation & Development (HPD)

---

## Files

```
visualizations/
├── app.py                  # Main Streamlit app
├── requirements.txt        # Python dependencies
├── .streamlit/config.toml  # Streamlit styling
└── README.md              # This file
```

---

## Next Steps

Once deployed, submit your live URL using the Assignment button.

Questions? Check Streamlit docs: https://docs.streamlit.io
# nyc-open-data-visualization
