(function () {
  const API_BASE = 'http://localhost:5000';
  const SUPPORTED_SITES = ['hm.com', 'myntra.com', 'zara.com'];
  const site = SUPPORTED_SITES.find(s => location.hostname.includes(s));
  if (!site) return;

  const insertFloatingBtn = () => {
    if (document.getElementById('eco-inspector-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'eco-inspector-btn';
    btn.className = 'eco-inspector-floating-btn';
    btn.innerHTML = '<div class="eco-btn-content"><div class="eco-btn-icon">🌿</div><div class="eco-btn-text">ECO</div></div>';
    btn.onclick = toggleSidebar;
    document.body.appendChild(btn);
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('eco-inspector-sidebar');
    sidebar.classList.toggle('eco-sidebar-open');
    scrapeProduct();
  };

  const createSidebar = () => {
    if (document.getElementById('eco-inspector-sidebar')) return;
    const sidebar = document.createElement('div');
    sidebar.id = 'eco-inspector-sidebar';
    sidebar.className = 'eco-inspector-sidebar';
    sidebar.innerHTML = `
      <div class='eco-sidebar-header'>
        <span class='eco-sidebar-title'>🌿 Eco Inspector - ${site.toUpperCase()}</span>
        <button class='eco-close-btn' onclick='document.getElementById("eco-inspector-sidebar").classList.remove("eco-sidebar-open")'>×</button>
      </div>
      <div class='eco-sidebar-content'>
        <div class='eco-section'>
          <h3 class='eco-section-title'>📦 Product Information</h3>
          <div class='eco-product-info'>
            <div class='eco-product-title' id='eco-title'>Loading title...</div>
            <div class='eco-product-desc' id='eco-desc'>Scraping description...</div>
          </div>
        </div>
        <div class='eco-section'>
          <h3 class='eco-section-title'>🔍 Sustainability Analysis</h3>
          <button class='eco-analyze-btn' id='eco-analyze'>🧠 Analyze Sustainability</button>
        </div>
        <div class='eco-section' id='eco-result-section' style='display:none;'>
          <h3 class='eco-section-title'>📊 Score</h3>
          <div class='eco-score-card'>
            <div class='eco-score-display'><div class='eco-score-number' id='eco-score'>-</div><div class='eco-score-label'>/10</div></div>
          </div>
          <div class='eco-justification'><h4>🔍 Justification</h4><p id='eco-justification'></p></div>
          <button class='eco-save-btn' id='eco-save'>💾 Save to Reports</button>
          <div id='eco-save-status' style='margin-top: 10px; display: none; font-size: 0.9rem;'></div>
        </div>
      </div>`;
    document.body.appendChild(sidebar);
  };

  const scrapeProduct = () => {
    let title = '', desc = '', material = '', price = '', img = '';

    if (site === 'hm.com') {
      const clickSection = (label) => {
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes(label));
        if (btn && btn.getAttribute("aria-expanded") !== "true") btn.click();
      };

      title = document.querySelector('h1')?.innerText || '';
      price = document.querySelector('.price')?.innerText || '';
      img = document.querySelector('img')?.src || '';

      clickSection('Description & Fit');

      const waitForDescription = setInterval(() => {
        const descAccordion = document.getElementById('section-descriptionAccordion');
        const paragraph = descAccordion?.querySelector('p');

        if (paragraph && paragraph.innerText.trim().length > 30) {
          clearInterval(waitForDescription);
          desc = paragraph.innerText.trim();

          clickSection('Materials');

          const waitForMaterials = setInterval(() => {
            const matSection = [...document.querySelectorAll('section, div')]
              .find(el => el.innerText.toLowerCase().includes('composition'));

            if (matSection && matSection.innerText.includes('%')) {
              clearInterval(waitForMaterials);
              material = matSection.innerText
                .split('\n')
                .map(line => line.trim())
                .filter(line =>
                  /\d+%/.test(line) &&
                  !line.toLowerCase().includes('livaeco') &&
                  !line.toLowerCase().includes('contains')
                )
                .filter((val, i, arr) => arr.indexOf(val) === i)
                .join(', ') || '';

              updateSidebar(title, desc, material, price, img);
            }
          }, 300);
        }
      }, 300);

    } else if (site === 'myntra.com') {
      title = document.querySelector('h1')?.innerText || '';
      price = document.querySelector('.pdp-price strong')?.innerText || '';
      img = document.querySelector('img')?.src || '';

      const allSections = [...document.querySelectorAll('h4, h3')];

      for (const header of allSections) {
        const headingText = header.innerText.toLowerCase();

        if (headingText.includes('product details')) {
          const content = header.nextElementSibling?.innerText?.trim();
          if (content) desc = content;
        }

        if (headingText.includes('material') || headingText.includes('care')) {
          const content = header.nextElementSibling?.innerText?.trim();
          if (content) {
            const firstLine = content.split('\n')[0];
            material = firstLine;
          }
        }
      }

      updateSidebar(title, desc, material, price, img);

    } else if (site === 'zara.com') {
      title = document.querySelector('h1')?.innerText || '';
      price = document.querySelector('.price')?.innerText || '';
      img = document.querySelector('img')?.src || '';
      desc = document.querySelector('.product-detail-description')?.innerText || '';

      const compBtn = [...document.querySelectorAll('button,a')].find(el =>
        el.textContent.toLowerCase().includes('composition')
      );
      if (compBtn) compBtn.click();

      setTimeout(() => {
        const compPanel = [...document.querySelectorAll('[class*="composition"]')]
          .find(el => el.innerText.toLowerCase().includes('composition'));
        material = compPanel?.innerText || '';
        updateSidebar(title, desc, material, price, img);
      }, 1200);
    }
  };

  const updateSidebar = (title, desc, material, price, img) => {
    const full = [desc, material].filter(Boolean).join('\n\n').trim();
    document.getElementById('eco-title').innerText = title;
    document.getElementById('eco-desc').innerText = full;

    document.getElementById('eco-analyze').onclick = () => {
      fetch(`${API_BASE}/api/extension/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [full],
          product_name: title,
          site,
          price,
          image_url: img,
          url: location.href
        })
      })
        .then(res => res.json())
        .then(res => {
          const result = res.data[0];
          document.getElementById('eco-result-section').style.display = 'block';
          document.getElementById('eco-score').innerText = result.score;
          document.getElementById('eco-justification').innerText = result.justification;

          document.getElementById('eco-save').onclick = () => {
            fetch(`${API_BASE}/api/save-analysis`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title,
                description: full,
                score: result.score,
                justification: result.justification,
                price,
                imageUrl: img,
                url: location.href,
                site,
                analyzed_at: new Date().toISOString(),
                confidence: result.confidence
              })
            })
              .then(res => res.json())
              .then(res => {
                const status = document.getElementById('eco-save-status');
                if (res.success) {
                  status.innerText = '✅ Saved successfully!';
                  status.style.display = 'block';
                  status.style.color = 'green';
                  setTimeout(() => status.style.display = 'none', 3000);
                } else {
                  status.innerText = '❌ Save failed.';
                  status.style.display = 'block';
                  status.style.color = 'red';
                }
              })
              .catch(() => {
                const status = document.getElementById('eco-save-status');
                status.innerText = '❌ Save error.';
                status.style.display = 'block';
                status.style.color = 'red';
              });
          };
        });
    };
  };

  insertFloatingBtn();
  createSidebar();
})();
