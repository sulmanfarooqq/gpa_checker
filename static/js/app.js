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
    
    // Validate roll number format
    const pattern = /^FA\d{2}-[A-Z]{3}-\d{3}$/;
    if (!pattern.test(rollNumber)) {
        showError('Invalid roll number format. Please use FAXX-ABC-000');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        const response = await fetch('/get_gpa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roll_number: rollNumber })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult(`https://cms.must.edu.pk:8082/Chartlet/MUST${rollNumber}AJK/FanG_Chartlet_GPChart.Jpeg`, rollNumber);
        } else {
            showError('Failed to fetch GPA chart');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    }
});

// Show loading state
function showLoading() {
    loadingDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
}

// Show result with GPA chart
function showResult(imageData, rollNumber) {
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    gpaChartImg.src = imageData;
    displayRollNumber.textContent = rollNumber;
    
    resultDiv.style.display = 'block';
    resultDiv.classList.add('fade-in');
    
    // Set up download button
    downloadBtn.onclick = () => downloadChart(rollNumber);
}

// Show error message
function showError(message) {
    loadingDiv.style.display = 'none';
    resultDiv.style.display = 'none';
    
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('fade-in');
}

// Download GPA chart
function downloadChart(rollNumber) {
    // Create a temporary link for download
    const link = document.createElement('a');
    link.href = `https://cms.must.edu.pk:8082/Chartlet/MUST${rollNumber}AJK/FanG_Chartlet_GPChart.Jpeg`;
    link.download = `GPA_Chart_${rollNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Clear results when input changes
rollNumberInput.addEventListener('input', () => {
    if (rollNumberInput.value.trim() === '') {
        resultDiv.style.display = 'none';
        errorDiv.style.display = 'none';
    }
});

// Add keyboard shortcuts
rollNumberInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        rollNumberInput.value = '';
        resultDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        rollNumberInput.focus();
    }
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input field when page loads
    rollNumberInput.focus();
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-1px)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
});

// Add copy roll number functionality
function copyRollNumber() {
    const rollNumber = rollNumberInput.value;
    if (rollNumber) {
        navigator.clipboard.writeText(rollNumber).then(() => {
            // Show brief success message
            const originalText = rollNumberInput.placeholder;
            rollNumberInput.placeholder = 'Copied!';
            setTimeout(() => {
                rollNumberInput.placeholder = originalText;
            }, 1000);
        });
    }
}

// Add keyboard shortcut for copy (Ctrl+C when input is focused)
rollNumberInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copyRollNumber();
    }
});
