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

// Build image URL for MUST GPA charts
function buildImageUrl(roll) {
  return `https://cms.must.edu.pk:8082/Chartlet/MUST${roll}AJK/FanG_Chartlet_GPChart.Jpeg`;
}

// Single chart flow
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
    const imageUrl = buildImageUrl(rollNumber);
    
    // Test if image exists by creating an Image object
    const img = new Image();
    img.onload = function() {
      showResult(imageUrl, rollNumber);
    };
    img.onerror = function() {
      showError('GPA chart not found for this roll number. Please verify the roll number is correct.');
    };
    img.src = imageUrl;
    
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
    // Create a temporary link for download
    const link = document.createElement('a');
    link.href = url;
    link.download = `GPA_Chart_${rollNumber}.jpg`;
    link.target = '_blank'; // Open in new tab to avoid CORS issues
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Also provide instructions for manual download
    showError('If download didn\'t start automatically, right-click the image and select "Save image as..."');
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
    
  } catch (error) {
    showError('Download failed. Please right-click the image and select "Save image as..."');
  }
}

// Clear results when input is cleared
rollNumberInput.addEventListener('input', () => {
  if (rollNumberInput.value.trim() === '') {
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
  }
});

// Focus on input field
document.addEventListener('DOMContentLoaded', () => {
  rollNumberInput.focus();
});

// Keyboard shortcuts
rollNumberInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    rollNumberInput.value = '';
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    rollNumberInput.focus();
  }
});
