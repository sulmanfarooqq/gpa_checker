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

// Form submission handler
gpaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const rollNumber = rollNumberInput.value.trim();
  if (!rollNumber) {
    showError('Please enter a roll number');
    return;
  }

  const pattern = /^FA\d{2}-[A-Z]{3}-\d{3}$/;
  if (!pattern.test(rollNumber)) {
    showError('Invalid roll number format. Please use FAXX-ABC-000');
    return;
  }

  showLoading();

  try {
    const imageUrl = `https://cms.must.edu.pk:8082/Chartlet/MUST${rollNumber}AJK/FanG_Chartlet_GPChart.Jpeg`;
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

function downloadChart(rollNumber) {
  const link = document.createElement('a');
  link.href = `https://cms.must.edu.pk:8082/Chartlet/MUST${rollNumber}AJK/FanG_Chartlet_GPChart.Jpeg`;
  link.download = `GPA_Chart_${rollNumber}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-1px)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
  });
});

function copyRollNumber() {
  const rollNumber = rollNumberInput.value;
  if (rollNumber) {
    navigator.clipboard.writeText(rollNumber).then(() => {
      const originalText = rollNumberInput.placeholder;
      rollNumberInput.placeholder = 'Copied!';
      setTimeout(() => {
        rollNumberInput.placeholder = originalText;
      }, 1000);
    });
  }
}

rollNumberInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
    copyRollNumber();
  }
  if (e.key === 'Escape') {
    rollNumberInput.value = '';
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    rollNumberInput.focus();
  }
});
