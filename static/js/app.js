// DOM elements
const gpaForm = document.getElementById('gpaForm');
const rollNumberInput = document.getElementById('rollNumber');
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const gpaChartImg = document.getElementById('gpaChart');
const displayRollNumber = document.getElementById('displayRollNumber');
const downloadBtn = document.getElementById('downloadBtn');
const errorText = document.getElementById('errorText');

// Session DOM
let sessionForm, firstRollInput, lastRollInput, sessionSection, sessionGrid;

function $(id){ return document.getElementById(id); }

window.addEventListener('DOMContentLoaded', () => {
  sessionForm = $('sessionForm');
  firstRollInput = $('firstRoll');
  lastRollInput = $('lastRoll');
  sessionSection = $('session');
  sessionGrid = $('sessionGrid');

  if (sessionForm) {
    sessionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const first = firstRollInput.value.trim();
      const last = lastRollInput.value.trim();
      const pattern = /^FA\d{2}-[A-Z]{3}-\d{3}$/;
      if (!pattern.test(first) || !pattern.test(last) || first.split('-')[0] !== last.split('-')[0] || first.split('-')[1] !== last.split('-')[1]) {
        showError('Invalid roll numbers or mismatched prefixes.');
        return;
      }
      const [prefix, startStr] = first.split(/-(?=\d{3}$)/);
      const [, endStr] = last.split(/-(?=\d{3}$)/);
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (end < start) { showError('Last roll must be >= first roll'); return; }
      sessionGrid.innerHTML = '';
      for (let i = start; i <= end; i++) {
        const roll = `${prefix}-${String(i).padStart(3,'0')}`;
        const url = buildImageUrl(roll);
        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
          <img alt="${roll}" src="${url}" onerror="this.onerror=null; this.src=''; this.closest('.session-card').querySelector('.missing').style.display='block';" />
          <h3>${roll}</h3>
          <div class="session-actions">
            <button class="btn-secondary" data-roll="${roll}">Download</button>
          </div>
          <div class="missing" style="display:none; color:#ef4444; text-align:center; font-size:12px; margin-top:6px;">Not available</div>
        `;
        sessionGrid.appendChild(card);
      }
      sessionSection.style.display = 'block';
      sessionSection.classList.add('fade-in');
      sessionGrid.querySelectorAll('button[data-roll]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await downloadChart(btn.getAttribute('data-roll'));
        });
      });
      window.scrollTo({ top: sessionSection.offsetTop, behavior: 'smooth' });
    });
  }
});

function buildImageUrl(roll) {
  return `https://cms.must.edu.pk:8082/Chartlet/MUST${roll}AJK/FanG_Chartlet_GPChart.Jpeg`;
}

// Single chart flow
gpaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const rollNumber = rollNumberInput.value.trim();
  if (!rollNumber) { showError('Please enter a roll number'); return; }
  const pattern = /^FA\d{2}-[A-Z]{3}-\d{3}$/;
  if (!pattern.test(rollNumber)) { showError('Invalid roll number format. Please use FAXX-ABC-000'); return; }
  showLoading();
  try {
    const imageUrl = buildImageUrl(rollNumber);
    showResult(imageUrl, rollNumber);
  } catch (error) {
    showError('Network error. Please check your connection and try again.');
  }
});

function showLoading() {
  loadingDiv.style.display = 'block';
  resultDiv.style.display = 'none';
  errorDiv.style.display = 'none';
}

function showResult(imageUrl, rollNumber) {
  loadingDiv.style.display = 'none';
  errorDiv.style.display = 'none';
  gpaChartImg.onerror = () => showError('Chart not available');
  gpaChartImg.src = imageUrl;
  displayRollNumber.textContent = rollNumber;
  resultDiv.style.display = 'block';
  resultDiv.classList.add('fade-in');
  downloadBtn.onclick = () => downloadChart(rollNumber);
}

function showError(message) {
  loadingDiv.style.display = 'none';
  resultDiv.style.display = 'none';
  errorText.textContent = message;
  errorDiv.style.display = 'block';
  errorDiv.classList.add('fade-in');
}

async function downloadChart(rollNumber) {
  const url = buildImageUrl(rollNumber);
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = objectUrl;
    a.download = `GPA_Chart_${rollNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(objectUrl);
    a.remove();
  } catch {
    showError('Download blocked by remote server (CORS).');
  }
}

rollNumberInput.addEventListener('input', () => {
  if (rollNumberInput.value.trim() === '') {
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  rollNumberInput.focus();
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
  buttons.forEach((button) => {
    button.addEventListener('mouseenter', () => { button.style.transform = 'translateY(-1px)'; });
    button.addEventListener('mouseleave', () => { button.style.transform = 'translateY(0)'; });
  });
});

function copyRollNumber() {
  const rollNumber = rollNumberInput.value;
  if (rollNumber) {
    navigator.clipboard.writeText(rollNumber).then(() => {
      const originalText = rollNumberInput.placeholder;
      rollNumberInput.placeholder = 'Copied!';
      setTimeout(() => { rollNumberInput.placeholder = originalText; }, 1000);
    });
  }
}

rollNumberInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'c') { e.preventDefault(); copyRollNumber(); }
  if (e.key === 'Escape') {
    rollNumberInput.value = '';
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    rollNumberInput.focus();
  }
});
