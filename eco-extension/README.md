# 🚀 Eco Inspector Extension - Quick Setup Checklist

## ✅ Pre-Setup Checklist

- [ ] Python Flask backend is running at `http://localhost:5000`
- [ ] React web dashboard is running at `http://localhost:3000`
- [ ] Chrome browser is installed and updated
- [ ] All extension files are downloaded

## 📂 File Setup Checklist

Create folder `eco-inspector-extension` with these files:

- [ ] `manifest.json` ✅ (Extension configuration)
- [ ] `content-script.js` ✅ (Main extension logic with advanced scraping)
- [ ] `content-styles.css` ✅ (Beautiful extension styling)
- [ ] `background.js` ✅ (Service worker for background tasks)
- [ ] `popup.html` ✅ (Extension popup interface)
- [ ] `popup.js` ✅ (Popup functionality)
- [ ] `icons/` folder with icon files (16px, 32px, 48px, 128px)

## 🔧 Installation Steps

- [ ] **Step 1**: Open Chrome and go to `chrome://extensions/`
- [ ] **Step 2**: Enable "Developer mode" (top right toggle)
- [ ] **Step 3**: Click "Load unpacked" button
- [ ] **Step 4**: Select your `eco-inspector-extension` folder
- [ ] **Step 5**: Extension appears in extensions list ✅

## 🧪 Testing Checklist

### Basic Functionality Test
- [ ] Visit H&M product page: `https://www2.hm.com/en_us/productpage.*`
- [ ] Floating 🌿 button appears in bottom right corner
- [ ] Click button opens extension sidebar smoothly
- [ ] Product information is auto-scraped and displayed
- [ ] Click "Analyze Product" triggers analysis
- [ ] Results show sustainability score and justification
- [ ] "Save to Reports" button works
- [ ] Sidebar can be collapsed/expanded

### Multi-Site Compatibility Test
- [ ] **Myntra**: `https://www.myntra.com/*/p/*` - Product detection works
- [ ] **Zara**: `https://www.zara.com/*/product/*` - Auto-scraping works
- [ ] **SHEIN**: `https://www.shein.com/*/p-*` - Analysis completes
- [ ] **ASOS**: `https://www.asos.com/*/prd/*` - Reports save correctly

### Extension Popup Test
- [ ] Click extension icon in Chrome toolbar
- [ ] Popup shows current site status
- [ ] Statistics display correctly (products analyzed, eco-friendly choices, carbon saved)
- [ ] Recent analysis section populates
- [ ] "Open Dashboard" and "View Reports" buttons work

### Backend Integration Test
- [ ] Analysis requests reach backend successfully
- [ ] Backend returns sustainability scores
- [ ] Error handling works when backend is offline
- [ ] Reports sync with web dashboard

## 🔍 Verification Steps

### Visual Verification
- [ ] Extension UI matches the modern, eco-friendly design
- [ ] Smooth animations and transitions
- [ ] Responsive design works on different screen sizes
- [ ] Colors and branding are consistent

### Functional Verification
- [ ] Auto-scraping extracts: Product title, description, price, brand
- [ ] AI analysis provides: Score (1-10), detailed justification, material insights
- [ ] Reports include: All product data, analysis results, timestamp, source
- [ ] Statistics update in real-time across all interfaces

### Performance Verification
- [ ] Extension loads quickly (< 2 seconds)
- [ ] Scraping completes within 3-5 seconds
- [ ] Analysis completes within 5-10 seconds
- [ ] No significant impact on page loading speed
- [ ] Memory usage remains reasonable

## 🛠️ Troubleshooting Quick Fixes

### Extension Not Loading
```bash
# Check extension errors
1. Go to chrome://extensions/
2. Click "Errors" button if red error appears
3. Fix any JavaScript errors shown
```

### Floating Button Not Appearing
```bash
# Check if you're on a supported site
Supported patterns:
- myntra.com/*/p/*
- zara.com/*/product/*
- hm.com/*/productpage.*
- shein.com/*/p-*
- asos.com/*/prd/*
```

### Backend Connection Issues  
```bash
# Verify backend is running
curl http://localhost:5000/api/health-check

# Should return: {"status": "operational"}
```

### Scraping Not Working
```bash
# Common fixes:
1. Wait 3-5 seconds for page to fully load
2. Scroll down to trigger dynamic content loading
3. Try refreshing the page
4. Check if site structure has changed
```

## 🎯 Success Indicators

You'll know everything is working perfectly when:

✅ **Visual Success Signs**:
- Floating button appears instantly on product pages
- Sidebar opens with smooth animation
- Extension UI looks polished and professional
- All buttons and interactions work flawlessly

✅ **Functional Success Signs**:
- Product data is scraped accurately (title, description, price)
- AI analysis returns meaningful sustainability scores
- Reports are saved and visible in web dashboard
- Statistics update across all components

✅ **Performance Success Signs**:
- Page loading is not noticeably affected
- Extension responds quickly to user interactions
- Analysis completes within expected timeframes
- No browser crashes or memory issues

## 🚀 Advanced Features Working

- [ ] **Smart Scraping**: Automatically expands "Show More" sections
- [ ] **Multi-Selector Fallbacks**: Works even when sites update their HTML
- [ ] **Real-Time Updates**: Stats update across extension and dashboard
- [ ] **Offline Handling**: Graceful degradation when backend unavailable
- [ ] **Cross-Tab Sync**: Data syncs between multiple browser tabs
- [ ] **Memory Management**: Cleans up resources properly

## 📊 Analytics Verification

Check these metrics to ensure everything is tracking correctly:

- [ ] Products analyzed counter increases
- [ ] Eco-friendly purchases tracked when marked
- [ ] Carbon saved calculations appear reasonable
- [ ] Recent analysis list updates correctly
- [ ] Source attribution (extension, manual, web, backend) works

## 🎉 Final Success Confirmation

**The extension is fully operational when you can:**

1. **Visit any supported e-commerce site** → Product detected automatically
2. **Click the floating eco button** → Sidebar opens smoothly  
3. **Auto-scraping completes** → Product info displayed accurately
4. **Click analyze** → AI returns sustainability score + justification
5. **Save to reports** → Report appears in web dashboard immediately
6. **View extension popup** → Shows updated statistics and recent activity
7. **Test across multiple sites** → Consistent experience everywhere

---

## 🔄 Quick Reset (If Something Goes Wrong)

```bash
# Reset extension completely:
1. Go to chrome://extensions/
2. Remove the extension
3. Close all browser tabs
4. Reload the extension from folder
5. Test on fresh product page
```

## 📞 Immediate Help

If any step fails:

1. **Check browser console** (F12) for error messages
2. **Verify all files are in correct locations**
3. **Ensure backend and frontend are running**
4. **Try testing on H&M first** (most reliable scraping)
5. **Refresh the page** after extension installation

---

**🌿 Once this checklist is complete, your Eco Inspector Advanced Extension is ready to help make fashion shopping more sustainable!**