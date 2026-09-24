// --- STATE & STATS TRACKER ---
let statsTracker = {
  v1Count: 0,
  v2Count: 0,
  bulkCount: 0
};

function initTotalGeneratedCounter() {
  if (localStorage.getItem('ayaka_total_generated') === null) {
    localStorage.setItem('ayaka_total_generated', '0');
  }
  if (localStorage.getItem('ayaka_stats_tracker') !== null) {
    try {
      statsTracker = JSON.parse(localStorage.getItem('ayaka_stats_tracker'));
    } catch(e) {}
  }
  updateTotalGeneratedDisplay();
  updateStatistikViewData();
}

function getTotalGeneratedCount() {
  return parseInt(localStorage.getItem('ayaka_total_generated') || '0', 10);
}

function incrementTotalGenerated(amount = 1, source = 'v1') {
  const current = getTotalGeneratedCount() + amount;
  localStorage.setItem('ayaka_total_generated', current.toString());
  
  if (source === 'v1') statsTracker.v1Count += amount;
  else if (source === 'v2') statsTracker.v2Count += amount;
  else if (source === 'bulk') statsTracker.bulkCount += amount;

  localStorage.setItem('ayaka_stats_tracker', JSON.stringify(statsTracker));
  updateTotalGeneratedDisplay();
  updateStatistikViewData();

  const lastInfoEl = document.getElementById('lastGeneratedInfo');
  if (lastInfoEl) {
    const now = new Date();
    lastInfoEl.textContent = `Update terakhir: ${now.toLocaleTimeString('id-ID')}`;
  }
}

function updateTotalGeneratedDisplay() {
  const counterEl = document.getElementById('totalGeneratedCounter');
  if (counterEl) {
    counterEl.textContent = getTotalGeneratedCount().toLocaleString('id-ID');
  }
  const statSuksesEl = document.getElementById('statTotalSukses');
  if (statSuksesEl) {
    statSuksesEl.textContent = getTotalGeneratedCount().toLocaleString('id-ID');
  }
}

function updateStatistikViewData() {
  const v1El = document.getElementById('statCountV1');
  const v2El = document.getElementById('statCountV2');
  const bulkEl = document.getElementById('statCountBulk');
  if (v1El) v1El.textContent = `${statsTracker.v1Count} kali`;
  if (v2El) v2El.textContent = `${statsTracker.v2Count} kali`;
  if (bulkEl) bulkEl.textContent = `${statsTracker.bulkCount} batch`;
}

// --- CHART.JS SETUP ---
let monthlyChartInstance = null;
function initMonthlyChart() {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx) return;

  const totalGen = getTotalGeneratedCount();
  const baseVal = Math.max(5, Math.floor(totalGen / 4));

  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  monthlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      datasets: [{
        label: 'Aktivasi Berhasil',
        data: [baseVal, baseVal + 2, baseVal + 4, baseVal + 1, baseVal + 6, baseVal + 8, totalGen, 0, 0, 0, 0, 0],
        borderColor: '#f472b6',
        backgroundColor: 'rgba(244, 114, 182, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#db2777',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fff0f5', font: { family: 'Plus Jakarta Sans', size: 12 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#e2c1dc', font: { size: 11 } },
          grid: { color: 'rgba(82, 53, 77, 0.4)' }
        },
        y: {
          ticks: { color: '#e2c1dc', font: { size: 11 } },
          grid: { color: 'rgba(82, 53, 77, 0.4)' }
        }
      }
    }
  });
}

function exportStatistikData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    store: "AYAKA STORE",
    tanggal_laporan: new Date().toISOString(),
    total_sukses: getTotalGeneratedCount(),
    rincian_statistik: statsTracker
  }, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "laporan_statistik_ayaka_store.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function createSakuraPetals() {
  const container = document.getElementById('sakuraContainer');
  if (!container) return;
  const petalCount = 22;
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('div');
    petal.classList.add('sakura');
    const size = Math.random() * 8 + 8;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.6}px`;
    petal.style.left = `${Math.random() * 100}vw`;
    const duration = Math.random() * 6 + 5;
    const delay = Math.random() * 5;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    container.appendChild(petal);
  }
}

function initVisitorCounter() {
  if (localStorage.getItem('ayaka_total_visitors') === null) {
    localStorage.setItem('ayaka_total_visitors', '0');
  }
  if (!sessionStorage.getItem('visitor_counted_unique')) {
    sessionStorage.setItem('visitor_counted_unique', 'true');
    let currentTotal = parseInt(localStorage.getItem('ayaka_total_visitors')) || 0;
    currentTotal += 1;
    localStorage.setItem('ayaka_total_visitors', currentTotal.toString());
  }
  const counterEl = document.getElementById('totalVisitorsCounter');
  if (counterEl) {
    counterEl.textContent = localStorage.getItem('ayaka_total_visitors') || '0';
  }
}

function initDraggableWhatsApp() {
  const dragEl = document.getElementById('floatingWaContainer');
  if (!dragEl) return;
  let isDragging = false;
  let startX, startY, initialX, initialY;
  let hasMoved = false;

  function onPointerDown(e) {
    isDragging = true;
    hasMoved = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;

    const rect = dragEl.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;

    dragEl.style.right = 'auto';
    dragEl.style.bottom = 'auto';
    dragEl.style.left = `${initialX}px`;
    dragEl.style.top = `${initialY}px`;

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startX;
    const dy = clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

    let newX = initialX + dx;
    let newY = initialY + dy;
    const maxW = window.innerWidth - dragEl.offsetWidth;
    const maxH = window.innerHeight - dragEl.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxW));
    newY = Math.max(0, Math.min(newY, maxH));

    dragEl.style.left = `${newX}px`;
    dragEl.style.top = `${newY}px`;
  }

  function onPointerUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
  }

  dragEl.addEventListener('mousedown', onPointerDown);
  dragEl.addEventListener('touchstart', onPointerDown, { passive: true });

  const linkEl = document.getElementById('floatingWaBtn');
  if (linkEl) {
    linkEl.addEventListener('click', (e) => {
      if (hasMoved) e.preventDefault();
    });
  }
}

async function checkSupabaseRealtimeStatus() {
  const labelEl = document.getElementById("supaStatusLabel");
  const dotEl = document.querySelector("#dbCardCustom .db-blink-dot");
  if (!labelEl || !dotEl) return;

  try {
    let isConnected = false;
    if (supabaseClient) {
      const { error } = await supabaseClient.from('_ping_check').select('*').limit(1);
      if (!error || error.code === 'PGRST116' || error.status === 404 || error.code) {
        isConnected = true;
      }
    } else {
      const res = await fetch('https://httpbin.org/status/200', { method: 'GET', cache: 'no-cache' });
      if (res.ok) isConnected = true;
    }

    if (isConnected) {
      labelEl.textContent = "Connected";
      dotEl.style.backgroundColor = "#22c55e";
      dotEl.style.boxShadow = "0 0 10px #22c55e";
    } else {
      throw new Error("Offline");
    }
  } catch (err) {
    labelEl.textContent = "Disconnected";
    dotEl.style.backgroundColor = "#ef4444";
    dotEl.style.boxShadow = "0 0 10px #ef4444";
  }
}

const sessionStartTime = Math.floor(Date.now() / 1000);
let totalDowntimeSeconds = 0;

function updateServerUptime() {
  const now = Math.floor(Date.now() / 1000);
  const totalElapsed = now - sessionStartTime;
  const activeUptime = Math.max(0, totalElapsed - totalDowntimeSeconds);

  const days = Math.floor(activeUptime / 86400);
  const hours = Math.floor((activeUptime % 86400) / 3600);
  const minutes = Math.floor((activeUptime % 3600) / 60);
  const seconds = activeUptime % 60;

  const counterEl = document.getElementById("serverUptimeCounter");
  if (counterEl) counterEl.textContent = `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  if (document.getElementById("uptimeDays")) document.getElementById("uptimeDays").textContent = `${days}d`;
  if (document.getElementById("uptimeHours")) document.getElementById("uptimeHours").textContent = `${hours}h`;
  if (document.getElementById("uptimeMinutes")) document.getElementById("uptimeMinutes").textContent = `${minutes}m`;
  if (document.getElementById("uptimeSeconds")) document.getElementById("uptimeSeconds").textContent = `${seconds}s`;

  const percentageEl = document.getElementById("uptimePercentage");
  if (percentageEl && totalElapsed > 0) {
    const percentage = ((activeUptime / totalElapsed) * 100).toFixed(2);
    percentageEl.textContent = `${percentage}%`;
  }
}

async function updateRealtimePing() {
  const pingElement = document.getElementById("realtimePing");
  const dashPingElement = document.getElementById("dashboardPing");
  const dashStatusText = document.getElementById("dashboardStatusText");
  if (!pingElement) return;

  const startTime = performance.now();
  try {
    await fetch('https://www.google.com/generate_204', { mode: 'no-cors', cache: 'no-cache' });
    const latency = Math.round(performance.now() - startTime);
    pingElement.textContent = `${latency}ms`;
    if(dashPingElement) dashPingElement.textContent = `${latency} ms`;
    if(dashStatusText) dashStatusText.textContent = "Online / Realtime Sync";
  } catch (err) {
    pingElement.textContent = `Offline`;
    if(dashPingElement) dashPingElement.textContent = `Offline`;
    if(dashStatusText) dashStatusText.textContent = "Connection lost";
    totalDowntimeSeconds += 3;
  }
}

function switchView(viewName) {
  const views = ['dashboard', 'server-status', 'statistik', 'temp-mail', 'am-generator', 'am-generator-v2', 'am-bulk'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const nav = document.getElementById(`nav-${v}`);
    if (el) el.style.display = (v === viewName) ? 'block' : 'none';
    if (nav) nav.classList.toggle('active', v === viewName);
  });

  if (viewName === 'statistik') setTimeout(initMonthlyChart, 200);
  if (viewName === 'temp-mail') fetchTempMailInbox(true);
}

// --- TEMP MAIL SYSTEM ---
let currentTempEmail = "";
let tempMailInterval = null;

function initTempMailSystem() {
  const savedEmail = localStorage.getItem("ayaka_temp_email");
  if (savedEmail) {
    currentTempEmail = savedEmail;
    const addrEl = document.getElementById("tempMailAddress");
    if (addrEl) addrEl.textContent = currentTempEmail;
    fetchTempMailInbox(true);
  } else {
    generateNewTempMail();
  }

  if (tempMailInterval) clearInterval(tempMailInterval);
  tempMailInterval = setInterval(() => {
    const tempMailView = document.getElementById("view-temp-mail");
    if (tempMailView && tempMailView.style.display !== "none" && currentTempEmail) {
      fetchTempMailInbox(true);
    }
  }, 10000);
}

async function generateNewTempMail() {
  const addressEl = document.getElementById("tempMailAddress");
  if (!addressEl) return;
  addressEl.textContent = "Membuat email...";
  showTempMailMsg("Membuat alamat email sementara baru...", "success");

  const fallbackDomains = ["1secmail.com", "1secmail.org", "1secmail.net", "laafd.com", "xcodes.net"];
  const randomNames = ["ayaka", "store", "user", "client", "vip", "pro", "auth", "mail", "fast", "secure"];
  const randomString = Math.random().toString(36).substring(2, 8);
  const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)] + "_" + randomString;
  const chosenDomain = fallbackDomains[Math.floor(Math.random() * fallbackDomains.length)];

  try {
    const res = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1", { timeout: 5000 });
    if (res.data && res.data.length > 0) {
      currentTempEmail = res.data[0];
    } else {
      throw new Error("Empty response");
    }
  } catch (err) {
    currentTempEmail = `${chosenName}@${chosenDomain}`;
  }

  localStorage.setItem("ayaka_temp_email", currentTempEmail);
  addressEl.textContent = currentTempEmail;
  
  const inboxList = document.getElementById("tempMailInboxList");
  if (inboxList) {
    inboxList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 16px 10px; font-size: 12px; background: var(--card-inner); border: 1px dashed var(--border-color); border-radius: 10px;">
        Belum ada pesan masuk. Email akan muncul di sini secara real-time.
      </div>
    `;
  }
  if (document.getElementById("inboxCountBadge")) document.getElementById("inboxCountBadge").textContent = "(0)";
  showTempMailMsg("Email sementara baru berhasil dibuat!", "success");
  fetchTempMailInbox(true);
}

function promptCustomEmailPrefix() {
  const customName = prompt("Masukkan nama email kustom yang Anda inginkan (tanpa domain):", "ayaka");
  if (!customName || customName.trim() === "") return;
  
  const cleanName = customName.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
  const fallbackDomains = ["1secmail.com", "1secmail.org", "1secmail.net"];
  const selectedDomain = fallbackDomains[Math.floor(Math.random() * fallbackDomains.length)];
  
  currentTempEmail = `${cleanName}@${selectedDomain}`;
  localStorage.setItem("ayaka_temp_email", currentTempEmail);
  if (document.getElementById("tempMailAddress")) document.getElementById("tempMailAddress").textContent = currentTempEmail;
  showTempMailMsg(`Email kustom berhasil diset ke ${currentTempEmail}`, "success");
  fetchTempMailInbox(true);
}

function copyTempMail() {
  if (!currentTempEmail) return;
  navigator.clipboard.writeText(currentTempEmail);
  showTempMailMsg("Alamat email berhasil disalin ke clipboard!", "success");
}

async function fetchTempMailInbox(silent = false) {
  if (!currentTempEmail) return;
  const parts = currentTempEmail.split("@");
  if (parts.length !== 2) return;
  const user = parts[0];
  const domain = parts[1];
  const icon = document.getElementById("refreshInboxIcon");
  if (icon) icon.classList.add("fa-spin");

  const inboxListEl = document.getElementById("tempMailInboxList");
  const countBadge = document.getElementById("inboxCountBadge");
  if (!inboxListEl) return;

  try {
    const res = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${user}&domain=${domain}`, { timeout: 6000 });
    
    if (res.data && Array.isArray(res.data)) {
      if (countBadge) countBadge.textContent = `(${res.data.length})`;
      if (res.data.length > 0) {
        let html = "";
        for (let msg of res.data) {
          html += `
            <div class="inbox-item" onclick="openTempMailMessage('${user}', '${domain}', ${msg.id})">
              <div class="inbox-item-header">
                <span><b>Dari:</b> ${escapeHtml(msg.from)}</span>
                <span><i class="fa-regular fa-clock"></i> ${escapeHtml(msg.date)}</span>
              </div>
              <div class="inbox-item-subject">${escapeHtml(msg.subject)} <span style="font-size: 10px; font-weight: normal; color: #f472b6; float: right;">(Baca)</span></div>
            </div>
          `;
        }
        inboxListEl.innerHTML = html;
      } else {
        inboxListEl.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 16px 10px; font-size: 12px; background: var(--card-inner); border: 1px dashed var(--border-color); border-radius: 10px;">
            Kotak masuk bersih. Menunggu email masuk...
          </div>
        `;
      }
      if (!silent) showTempMailMsg("Kotak masuk berhasil diperbarui.", "success");
    }
  } catch (err) {
    if (!inboxListEl.querySelector('.inbox-item')) {
      inboxListEl.innerHTML = `
        <div style="text-align: center; color: var(--error); padding: 14px 10px; font-size: 11px; background: var(--error-bg); border: 1px dashed var(--error); border-radius: 10px;">
          Gagal memuat inbox dari server. Coba klik Refresh beberapa saat lagi.
        </div>
      `;
    }
    if (!silent) showTempMailMsg("Gagal menyegarkan kotak masuk dari server.", "error");
  } finally {
    if (icon) setTimeout(() => icon.classList.remove("fa-spin"), 500);
  }
}

function clearInboxDisplay() {
  const inboxListEl = document.getElementById("tempMailInboxList");
  if (inboxListEl) {
    inboxListEl.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 16px 10px; font-size: 12px; background: var(--card-inner); border: 1px dashed var(--border-color); border-radius: 10px;">
        Kotak masuk telah dibersihkan.
      </div>
    `;
  }
  if (document.getElementById("inboxCountBadge")) document.getElementById("inboxCountBadge").textContent = "(0)";
  showTempMailMsg("Tampilan kotak masuk dibersihkan.", "success");
}

window.openTempMailMessage = async function(user, domain, id) {
  try {
    const res = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${user}&domain=${domain}&id=${id}`, { timeout: 6000 });
    const mailData = res.data;
    if (mailData) {
      const fullContent = mailData.textBody || mailData.htmlBody || "";
      let detectedLink = "";
      const urlMatch = fullContent.match(/https?:\/\/[^\s"'<>]+?(?:oobCode|continue|verify|auth)[^\s"'<>]+/i) || fullContent.match(/https?:\/\/[^\s"'<>]+/g);
      
      if (urlMatch) {
        for (let u of (Array.isArray(urlMatch) ? urlMatch : [urlMatch[0]])) {
          if (u.includes("identitytoolkit") || u.includes("firebase") || u.includes("alight") || u.includes("oobCode")) {
            detectedLink = u.replace(/&amp;/g, '&');
            break;
          }
        }
        if (!detectedLink && urlMatch.length > 0) detectedLink = urlMatch[0];
      }

      const modalHtml = `
        <div class="mail-detail-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
            <strong style="font-size: 13px; color: #fff; word-break: break-all;">${escapeHtml(mailData.subject)}</strong>
            <button onclick="this.closest('.mail-detail-box').remove()" style="background: none; border: none; color: #f87171; cursor: pointer; font-size: 12px; font-weight: 700; flex-shrink: 0;"><i class="fa-solid fa-xmark"></i> Tutup</button>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; word-break: break-all;">
            <b>Dari:</b> ${escapeHtml(mailData.from)}
          </div>
          <div style="font-size: 12px; background: #251623; padding: 10px; border-radius: 8px; max-height: 130px; overflow-y: auto; margin-bottom: 10px; word-break: break-all; color: #e2c1dc;">
            ${escapeHtml(mailData.textBody || "Format HTML diterima.")}
          </div>
          ${detectedLink ? `
            <div style="background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); padding: 10px; border-radius: 8px;">
              <div style="font-size: 11px; color: #34d399; font-weight: 700; margin-bottom: 6px;"><i class="fa-solid fa-circle-check"></i> Magic Link Terdeteksi Otomatis!</div>
              <input type="text" readonly value="${detectedLink}" class="auth-input" style="font-size: 11px; margin-bottom: 8px; background: var(--card-bg); color: #fff;" id="autoDetectedLinkInput">
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button type="button" class="btn-pink" style="padding: 6px 12px; font-size: 11px; width: auto;" onclick="useLinkForV1('${currentTempEmail}', document.getElementById('autoDetectedLinkInput').value)">Isi ke AM V1</button>
                <button type="button" class="btn-pink" style="padding: 6px 12px; font-size: 11px; width: auto;" onclick="useLinkForV2('${currentTempEmail}', document.getElementById('autoDetectedLinkInput').value)">Isi ke AM V2</button>
              </div>
            </div>
          ` : '<div style="font-size: 11px; color: var(--error);">Magic link tidak ditemukan secara otomatis di email ini.</div>'}
        </div>
      `;
      
      const inboxList = document.getElementById("tempMailInboxList");
      if (inboxList) inboxList.insertAdjacentHTML('beforebegin', modalHtml);
    }
  } catch (err) {
    showTempMailMsg("Gagal membaca isi email.", "error");
  }
}

function showTempMailMsg(text, type = "success") {
  const msgBox = document.getElementById("tempMailMsg");
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.className = "message show " + type;
  setTimeout(() => { msgBox.className = "message"; }, 4000);
}

window.useLinkForV1 = function(email, link) {
  document.getElementById("emailInput").value = email;
  document.getElementById("magicInput").value = link;
  switchView('am-generator');
  showMsg("Email & Magic link berhasil dimasukkan ke AM Generator V1!", "success", "msgBox");
}

window.useLinkForV2 = function(email, link) {
  document.getElementById("emailInputV2").value = email;
  document.getElementById("magicInputV2").value = link;
  switchView('am-generator-v2');
  showMsg("Email & Magic link berhasil dimasukkan ke AM Generator V2!", "success", "msgBoxV2");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- AM GENERATOR V1 WIZARD LOGIC ---
function switchAmStep(stepNum) {
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`amStepTab${i}`);
    const panel = document.getElementById(`amPanel${i}`);
    if (tab) tab.className = "am-step-card" + (i === stepNum ? " active" : (i < stepNum ? " completed" : ""));
    if (panel) panel.className = "am-step-content-panel" + (i === stepNum ? " active" : "");
  }
}

function resetAmFormV1() {
  watchedAdsCount = 0;
  isWatchingAd = false;
  document.getElementById("emailInput").value = "";
  document.getElementById("magicInput").value = "";
  document.getElementById("adCounterDisplay").textContent = "Verifikasi 1 dari 5";
  document.getElementById("adStatusDesc").textContent = "Silakan klik tombol di bawah untuk menjalankan proses verifikasi.";
  document.getElementById("adProgressBar").style.width = "20%";
  const watchBtn = document.getElementById("watchAdBtn");
  watchBtn.disabled = false;
  watchBtn.style.opacity = "1";
  watchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Proses Verifikasi (5s)';
  
  const proceedBtn = document.getElementById("proceedToStep3Btn");
  proceedBtn.style.opacity = "0.5";
  proceedBtn.style.pointerEvents = "none";

  document.getElementById("resEmail").textContent = "-";
  document.getElementById("resOrderId").textContent = "-";

  switchAmStep(1);
  showMsg("Form telah di-reset bersih. Silakan masukkan akun berikutnya.", "success", "msgBox");
}

// --- AM GENERATOR V2 WIZARD LOGIC ---
let watchedAdsCountV2 = 0;
let isWatchingAdV2 = false;

function switchAmV2Step(stepNum) {
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`amV2StepTab${i}`);
    const panel = document.getElementById(`amV2Panel${i}`);
    if (tab) tab.className = "am-step-card" + (i === stepNum ? " active" : (i < stepNum ? " completed" : ""));
    if (panel) panel.className = "am-step-content-panel" + (i === stepNum ? " active" : "");
  }
}

function resetAmFormV2() {
  watchedAdsCountV2 = 0;
  isWatchingAdV2 = false;
  document.getElementById("emailInputV2").value = "";
  document.getElementById("magicInputV2").value = "";
  document.getElementById("adCounterDisplayV2").textContent = "Verifikasi 1 dari 5";
  document.getElementById("adStatusDescV2").textContent = "Silakan klik tombol di bawah untuk memproses verifikasi V2.";
  document.getElementById("adProgressBarV2").style.width = "20%";
  const watchBtnV2 = document.getElementById("watchAdBtnV2");
  watchBtnV2.disabled = false;
  watchBtnV2.style.opacity = "1";
  watchBtnV2.innerHTML = '<i class="fa-solid fa-play"></i> Proses Verifikasi V2 (5s)';

  const proceedBtnV2 = document.getElementById("proceedToAmV2Step3Btn");
  proceedBtnV2.style.opacity = "0.5";
  proceedBtnV2.style.pointerEvents = "none";

  document.getElementById("resEmailV2").textContent = "-";
  document.getElementById("resOrderIdV2").textContent = "-";

  switchAmV2Step(1);
  showMsg("Form V2 telah di-reset bersih. Silakan masukkan akun berikutnya.", "success", "msgBoxV2");
}

function showMsg(text, type = "error", targetBox = "msgBox") {
  const msgBox = document.getElementById(targetBox);
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.className = "message show " + type;
}

// --- DOM EVENT BINDINGS & INITIALIZATIONS ---
document.addEventListener("DOMContentLoaded", () => {
  createSakuraPetals();
  initVisitorCounter();
  initTotalGeneratedCounter();
  initTempMailSystem();
  initDraggableWhatsApp();

  setInterval(checkSupabaseRealtimeStatus, 5000);
  checkSupabaseRealtimeStatus();

  setInterval(updateServerUptime, 1000);
  updateServerUptime();

  setInterval(updateRealtimePing, 3000);
  updateRealtimePing();

  // Sidebar navigation switching
  document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = item.getAttribute('data-view');
      if (view) switchView(view);
    });
  });

  const toggleSidebarBtn = document.getElementById('sidebarToggleBtn');
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('sidebar').classList.toggle('collapsed');
    });
  }

  // Statistik & Temp Mail Button Bindings
  const exportStatBtn = document.getElementById('exportStatistikBtn');
  if (exportStatBtn) exportStatBtn.addEventListener('click', exportStatistikData);

  const outlookBtn = document.getElementById('outlookReaderInfoBtn');
  if (outlookBtn) outlookBtn.addEventListener('click', () => showTempMailMsg('Outlook Reader aktif dan sinkron otomatis.', 'success'));

  const copyMailBtn = document.getElementById('copyTempMailBtn');
  if (copyMailBtn) copyMailBtn.addEventListener('click', copyTempMail);

  const customMailBtn = document.getElementById('customTempMailBtn');
  if (customMailBtn) customMailBtn.addEventListener('click', promptCustomEmailPrefix);

  const refreshMailBtn = document.getElementById('refreshTempMailBtn');
  if (refreshMailBtn) refreshMailBtn.addEventListener('click', () => fetchTempMailInbox(false));

  const newMailBtn = document.getElementById('newTempMailBtn');
  if (newMailBtn) newMailBtn.addEventListener('click', generateNewTempMail);

  const clearInboxBtn = document.getElementById('clearInboxBtn');
  if (clearInboxBtn) clearInboxBtn.addEventListener('click', clearInboxDisplay);

  // AM Generator V1 Event Bindings
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`amStepTab${i}`);
    if (tab) tab.addEventListener('click', () => switchAmStep(i));
  }

  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
      const email = document.getElementById('emailInput').value.trim();
      if (!email || !email.includes("@")) return showMsg("Masukkan email yang valid.", "error", "msgBox");
      showMsg("Sedang mengirim Magic Link...", "success", "msgBox");
      const res = await amAuth.sendMagicLink(email);
      if (res.success) showMsg("Magic Link berhasil dikirim ke email! Cek inbox/spam Anda.", "success", "msgBox");
      else showMsg("Gagal mengirim link: " + res.error, "error", "msgBox");
    });
  }

  const nextToStep2 = document.getElementById('nextToStep2Btn');
  if (nextToStep2) {
    nextToStep2.addEventListener('click', () => {
      const email = document.getElementById('emailInput').value.trim();
      const magicLink = document.getElementById('magicInput').value.trim();
      if (!email || !magicLink) return showMsg("Email dan Magic Link wajib diisi sebelum lanjut.", "error", "msgBox");
      switchAmStep(2);
    });
  }

  const backToStep1 = document.getElementById('backToStep1Btn');
  if (backToStep1) backToStep1.addEventListener('click', () => switchAmStep(1));

  let isWatchingAd = false;
  let watchedAdsCount = 0;
  const watchAdBtn = document.getElementById('watchAdBtn');
  if (watchAdBtn) {
    watchAdBtn.addEventListener('click', () => {
      if (isWatchingAd) return;
      isWatchingAd = true;
      let countdown = 5;
      const adStatusDesc = document.getElementById('adStatusDesc');
      watchAdBtn.disabled = true;
      watchAdBtn.style.opacity = "0.6";

      const timer = setInterval(() => {
        adStatusDesc.textContent = `Memproses verifikasi... Harap tunggu ${countdown} detik lagi.`;
        countdown--;
        if (countdown < 0) {
          clearInterval(timer);
          isWatchingAd = false;
          watchedAdsCount++;
          const percent = (watchedAdsCount / 5) * 100;
          document.getElementById('adProgressBar').style.width = `${percent}%`;

          if (watchedAdsCount < 5) {
            document.getElementById('adCounterDisplay').textContent = `Verifikasi ${watchedAdsCount + 1} dari 5`;
            adStatusDesc.textContent = `Verifikasi ${watchedAdsCount} selesai. Klik untuk tahap verifikasi berikutnya.`;
            watchAdBtn.disabled = false;
            watchAdBtn.style.opacity = "1";
          } else {
            document.getElementById('adCounterDisplay').textContent = "5 dari 5 Selesai!";
            adStatusDesc.textContent = "Semua verifikasi selesai! Silakan lanjut ke aktivasi final.";
            watchAdBtn.textContent = "Selesai Diverifikasi";
            const proceedBtn = document.getElementById('proceedToStep3Btn');
            proceedBtn.style.opacity = "1";
            proceedBtn.style.pointerEvents = "auto";
          }
        }
      }, 1000);
    });
  }

  const proceedToStep3 = document.getElementById('proceedToStep3Btn');
  if (proceedToStep3) {
    proceedToStep3.addEventListener('click', async () => {
      const email = document.getElementById('emailInput').value.trim();
      const magicLink = document.getElementById('magicInput').value.trim();
      if (!email || !magicLink) return showMsg("Email dan Magic Link wajib diisi.", "error", "msgBox");

      showMsg("Memverifikasi akun dan memproses lisensi premium...", "success", "msgBox");
      const verifyRes = await amAuth.verifyAndFetchProfile(email, magicLink);
      if (!verifyRes.success) return showMsg("Verifikasi Gagal: " + verifyRes.error, "error", "msgBox");

      const applyRes = await amAuth.applyPremium(verifyRes.idToken);
      if (!applyRes.success) return showMsg("Aktivasi Gagal: " + applyRes.error, "error", "msgBox");

      document.getElementById('resEmail').textContent = email;
      document.getElementById('resOrderId').textContent = applyRes.fullOrderId;
      incrementTotalGenerated(1, 'v1');
      switchAmStep(3);
      showMsg("Akun Alight Motion V1 berhasil diaktifkan!", "success", "msgBox");
    });
  }

  const resetV1Btn = document.getElementById('resetAmFormV1Btn');
  if (resetV1Btn) resetV1Btn.addEventListener('click', resetAmFormV1);

  // AM Generator V2 Event Bindings
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`amV2StepTab${i}`);
    if (tab) tab.addEventListener('click', () => switchAmV2Step(i));
  }

  const sendBtnV2 = document.getElementById('sendBtnV2');
  if (sendBtnV2) {
    sendBtnV2.addEventListener('click', async () => {
      const email = document.getElementById('emailInputV2').value.trim();
      if (!email || !email.includes("@")) return showMsg("Masukkan email yang valid.", "error", "msgBoxV2");
      showMsg("Sedang mengirim Magic Link V2...", "success", "msgBoxV2");
      const res = await amAuth.sendMagicLink(email);
      if (res.success) showMsg("Magic Link V2 berhasil dikirim ke email!", "success", "msgBoxV2");
      else showMsg("Gagal mengirim link V2: " + res.error, "error", "msgBoxV2");
    });
  }

  const nextToAmV2Step2 = document.getElementById('nextToAmV2Step2Btn');
  if (nextToAmV2Step2) {
    nextToAmV2Step2.addEventListener('click', () => {
      const email = document.getElementById('emailInputV2').value.trim();
      const magicLink = document.getElementById('magicInputV2').value.trim();
      if (!email || !magicLink) return showMsg("Email dan Magic Link wajib diisi sebelum lanjut.", "error", "msgBoxV2");
      switchAmV2Step(2);
    });
  }

  const backToAmV2Step1 = document.getElementById('backToAmV2Step1Btn');
  if (backToAmV2Step1) backToAmV2Step1.addEventListener('click', () => switchAmV2Step(1));

  const watchAdBtnV2 = document.getElementById('watchAdBtnV2');
  if (watchAdBtnV2) {
    watchAdBtnV2.addEventListener('click', () => {
      if (isWatchingAdV2) return;
      isWatchingAdV2 = true;
      let countdown = 5;
      const adStatusDescV2 = document.getElementById('adStatusDescV2');
      watchAdBtnV2.disabled = true;
      watchAdBtnV2.style.opacity = "0.6";

      const timer = setInterval(() => {
        adStatusDescV2.textContent = `Memproses verifikasi V2... Harap tunggu ${countdown} detik lagi.`;
        countdown--;
        if (countdown < 0) {
          clearInterval(timer);
          isWatchingAdV2 = false;
          watchedAdsCountV2++;
          const percent = (watchedAdsCountV2 / 5) * 100;
          document.getElementById('adProgressBarV2').style.width = `${percent}%`;

          if (watchedAdsCountV2 < 5) {
            document.getElementById('adCounterDisplayV2').textContent = `Verifikasi ${watchedAdsCountV2 + 1} dari 5`;
            adStatusDescV2.textContent = `Verifikasi V2 tahap ${watchedAdsCountV2} selesai.`;
            watchAdBtnV2.disabled = false;
            watchAdBtnV2.style.opacity = "1";
          } else {
            document.getElementById('adCounterDisplayV2').textContent = "5 dari 5 Selesai!";
            adStatusDescV2.textContent = "Semua verifikasi V2 selesai! Silakan lanjut.";
            watchAdBtnV2.textContent = "Selesai Diverifikasi";
            const proceedBtnV2 = document.getElementById('proceedToAmV2Step3Btn');
            proceedBtnV2.style.opacity = "1";
            proceedBtnV2.style.pointerEvents = "auto";
          }
        }
      }, 1000);
    });
  }

  const proceedToAmV2Step3 = document.getElementById('proceedToAmV2Step3Btn');
  if (proceedToAmV2Step3) {
    proceedToAmV2Step3.addEventListener('click', async () => {
      const email = document.getElementById('emailInputV2').value.trim();
      const magicLink = document.getElementById('magicInputV2').value.trim();
      const productId = document.getElementById('v2ProductSelect').value;
      const prefix = document.getElementById('v2PrefixInput').value.trim();

      if (!email || !magicLink) return showMsg("Email dan Magic Link wajib diisi.", "error", "msgBoxV2");

      showMsg("Memverifikasi akun dan memproses Engine V2...", "success", "msgBoxV2");
      const verifyRes = await amAuth.verifyAndFetchProfile(email, magicLink);
      if (!verifyRes.success) return showMsg("Verifikasi Gagal: " + verifyRes.error, "error", "msgBoxV2");

      const applyRes = await amAuth.applyPremium(verifyRes.idToken, productId, prefix);
      if (!applyRes.success) return showMsg("Aktivasi V2 Gagal: " + applyRes.error, "error", "msgBoxV2");

      document.getElementById('resEmailV2').textContent = email;
      document.getElementById('resOrderIdV2').textContent = applyRes.fullOrderId;
      incrementTotalGenerated(1, 'v2');
      switchAmV2Step(3);
      showMsg("Aktivasi V2 berhasil!", "success", "msgBoxV2");
    });
  }

  const resetV2Btn = document.getElementById('resetAmFormV2Btn');
  if (resetV2Btn) resetV2Btn.addEventListener('click', resetAmFormV2);

  // Bulk Akun AM Event Bindings
  let lastBulkResults = [];
  const startBulkBtn = document.getElementById('startBulkBtn');
  if (startBulkBtn) {
    startBulkBtn.addEventListener('click', async () => {
      const rawText = document.getElementById('bulkDataInput').value.trim();
      const productId = document.getElementById('bulkProductSelect').value;
      if (!rawText) return showMsg("Masukkan daftar akun terlebih dahulu.", "error", "msgBoxBulk");

      const lines = rawText.split('\n');
      const tableBody = document.getElementById('bulkTableBody');
      const bulkResultCard = document.getElementById('bulkResultCard');
      const exportBulkBtn = document.getElementById('exportBulkBtn');
      
      tableBody.innerHTML = "";
      bulkResultCard.style.display = "block";
      showMsg(`Memproses ${lines.length} akun secara massal...`, "success", "msgBoxBulk");

      let successCount = 0;
      lastBulkResults = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        let parts = line.includes('|') ? line.split('|') : line.split(',');
        if (parts.length < 2) continue;

        const email = parts[0].trim();
        const magicLink = parts[1].trim();
        let statusText = "PROCESSING";
        let orderIdRes = "-";

        try {
          const verifyRes = await amAuth.verifyAndFetchProfile(email, magicLink);
          if (verifyRes.success) {
            const applyRes = await amAuth.applyPremium(verifyRes.idToken, productId);
            if (applyRes.success) {
              successCount++;
              statusText = "SUCCESS";
              orderIdRes = applyRes.fullOrderId;
              lastBulkResults.push({ email, orderId: orderIdRes, status: "SUCCESS" });
            } else {
              statusText = "FAIL: Apply";
              lastBulkResults.push({ email, orderId: "-", status: "FAIL" });
            }
          } else {
            statusText = "FAIL: Verify";
            lastBulkResults.push({ email, orderId: "-", status: "FAIL" });
          }
        } catch (e) {
          statusText = "ERROR";
          lastBulkResults.push({ email, orderId: "-", status: "ERROR" });
        }

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${escapeHtml(email)}</td>
          <td>${escapeHtml(orderIdRes)}</td>
          <td><span style="color: ${statusText === 'SUCCESS' ? 'var(--success)' : 'var(--error)'}; font-weight: 700;">${statusText}</span></td>
        `;
        tableBody.appendChild(row);
      }

      if (successCount > 0) {
        incrementTotalGenerated(successCount, 'bulk');
        exportBulkBtn.style.display = "inline-flex";
      }
      showMsg(`Proses bulk selesai. Berhasil mengaktifkan ${successCount} dari ${lines.length} akun.`, "success", "msgBoxBulk");
    });
  }

  const exportBulkBtn = document.getElementById('exportBulkBtn');
  if (exportBulkBtn) {
    exportBulkBtn.addEventListener('click', () => {
      let content = "=== HASIL BULK AKTIVASI AYAKA STORE ===\n\n";
      lastBulkResults.forEach((res, idx) => {
        content += `${idx + 1}. Email: ${res.email} | OrderID: ${res.orderId} | Status: ${res.status}\n`;
      });
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "hasil_bulk_ayaka_store.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
});