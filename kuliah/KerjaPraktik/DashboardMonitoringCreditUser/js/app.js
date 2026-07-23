/* ===== AI Credit Monitoring — QA Dashboard ===== */
/* Data dummy, render model bars, table logs, Chart.js charts */

/* ---------- DATA DUMMY ---------- */
const days = ['17 Jul', '18 Jul', '19 Jul', '20 Jul', '21 Jul', '22 Jul', '23 Jul'];
const usage   = [3200, 4100, 3800, 4600, 5200, 5900, 4740]; // kredit terpakai/hari
const wasted  = [180, 240, 210, 380, 920, 1180, 610];       // kredit terbuang krn gagal
const failRate = [4, 6, 5, 8, 18, 22, 13];                  // % kegagalan

const models = [
  { name: 'wan/2-7-image-to-video', total: 210, fail: 88, color: '#ef4444' },
  { name: 'qwen2/image-edit',       total: 340, fail: 14, color: '#22c55e' },
  { name: 'flux/dev',               total: 150, fail: 26, color: '#f59e0b' },
  { name: 'sdxl/turbo',             total: 95,  fail: 9,  color: '#3b82f6' },
];

const logs = [
  { id: '#AI-1521', date: '23 Jul 06:31', user: 'Omcuki', mail: 'curhatantofix@gmail.com', type: 'IMAGE TO IMAGE', model: 'qwen2/image-edit', used: 6, status: 'success', err: '' },
  { id: '#AI-1520', date: '23 Jul 06:28', user: 'thomasbenson', mail: 'thomasben2806@gmail.com', type: 'IMAGE TO VIDEO', model: 'wan/2-7-image-to-video', used: 160, status: 'timeout', err: 'Request Timeout \u2014 provider tidak merespons dalam 120s (durasi video 8s @720p)' },
  { id: '#AI-1519', date: '22 Jul 23:14', user: 'rania.dev', mail: 'rania@studio.id', type: 'IMAGE TO VIDEO', model: 'wan/2-7-image-to-video', used: 160, status: 'failed', err: 'HTTP 503 Service Unavailable dari KIE upstream' },
  { id: '#AI-1518', date: '22 Jul 21:02', user: 'bagus_p', mail: 'bagus.p@gmail.com', type: 'TEXT TO IMAGE', model: 'flux/dev', used: 12, status: 'failed', err: 'NSFW content flagged \u2014 output diblokir moderation filter' },
  { id: '#AI-1517', date: '22 Jul 19:47', user: 'linda_qa', mail: 'linda@team.co', type: 'IMAGE TO IMAGE', model: 'qwen2/image-edit', used: 6, status: 'success', err: '' },
  { id: '#AI-1516', date: '22 Jul 18:20', user: 'thomasbenson', mail: 'thomasben2806@gmail.com', type: 'IMAGE TO VIDEO', model: 'wan/2-7-image-to-video', used: 160, status: 'timeout', err: 'Request Timeout \u2014 antrian GPU penuh (queue depth 34)' },
  { id: '#AI-1515', date: '22 Jul 15:10', user: 'devi.art', mail: 'devi@art.io', type: 'TEXT TO IMAGE', model: 'sdxl/turbo', used: 4, status: 'success', err: '' },
  { id: '#AI-1514', date: '21 Jul 22:33', user: 'Omcuki', mail: 'curhatantofix@gmail.com', type: 'TEXT TO IMAGE', model: 'flux/dev', used: 12, status: 'failed', err: 'Invalid dimension: 1536x1536 melebihi batas model (max 1024)' },
];

/* ---------- RENDER MODEL BARS ---------- */
const ml = document.getElementById('modelList');
models.forEach(m => {
  const failPct = Math.round(m.fail / m.total * 100);
  ml.innerHTML += `
    <div class="model-row">
      <div class="top">
        <span class="name">${m.name}</span>
        <span style="color:${failPct > 25 ? '#ef4444' : failPct > 10 ? '#f59e0b' : '#22c55e'}">${failPct}% gagal \u00B7 ${m.total} req</span>
      </div>
      <div class="bar"><span style="width:${failPct}%;background:${m.color}"></span></div>
    </div>`;
});

/* ---------- RENDER TABLE ---------- */
const tb = document.getElementById('rows');
logs.forEach(l => {
  tb.innerHTML += `
    <tr>
      <td><b>${l.id}</b><br><small style="color:var(--muted)">${l.date}</small></td>
      <td class="user"><b>${l.user}</b><small>${l.mail}</small></td>
      <td><span class="pill model">${l.type}</span><br><small style="color:var(--muted)">${l.model}</small></td>
      <td class="credit-used">-${l.used} Cr</td>
      <td><span class="pill ${l.status}">${l.status.toUpperCase()}</span></td>
      <td class="err ${l.err ? '' : 'ok'}">${l.err || '\u2014'}</td>
    </tr>`;
});

/* ---------- CHARTS ---------- */
Chart.defaults.color = '#8b93a7';
Chart.defaults.font.family = "'Segoe UI',sans-serif";

new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: {
    labels: days,
    datasets: [
      { label: 'Kredit Terpakai', data: usage, borderColor: '#7c5cff', backgroundColor: 'rgba(124,92,255,.12)', fill: true, tension: 0.35, pointRadius: 3 },
      { label: 'Kredit Terbuang (Gagal)', data: wasted, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.10)', fill: true, tension: 0.35, pointRadius: 3 },
      { label: '% Kegagalan', data: failRate, borderColor: '#f59e0b', borderDash: [5, 4], yAxisID: 'y1', tension: 0.35, pointRadius: 3 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } } },
    scales: {
      y: { grid: { color: '#282d3b' }, title: { display: true, text: 'Kredit' } },
      y1: { position: 'right', grid: { display: false }, min: 0, max: 40, title: { display: true, text: '% Gagal' } },
      x: { grid: { color: '#282d3b' } }
    }
  }
});

new Chart(document.getElementById('doughnut'), {
  type: 'doughnut',
  data: {
    labels: ['Success', 'Timeout', 'Failed'],
    datasets: [{ data: [82.3, 9.4, 8.3], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 15 } } }
  }
});

