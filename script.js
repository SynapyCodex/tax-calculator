function formatNumber(num) {
    return num.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const isNegative = start > end;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        element.textContent = formatNumber(current) + ' บาท';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatNumber(end) + ' บาท';
        }
    }
    
    requestAnimationFrame(update);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const messageElement = notification.querySelector('.notification-message');
    
    messageElement.textContent = message;
    notification.classList.add('show');
    
    // ซ่อน notification หลังจาก 4 วินาที
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function calculateTax() {
    // ดึงค่าจาก input
    const annualIncome = parseFloat(document.getElementById('annual-income').value) || 0;
    const expenses = parseFloat(document.getElementById('expenses').value) || 0;
    const allowances = parseFloat(document.getElementById('allowances').value) || 0;
    
    // ตรวจสอบว่ามีการกรอกข้อมูลหรือไม่
    if (annualIncome === 0) {
        showNotification('กรุณากรอกเงินได้ทั้งปี');
        // เพิ่ม effect ให้ input field
        const incomeInput = document.getElementById('annual-income');
        incomeInput.focus();
        incomeInput.style.borderColor = '#f5576c';
        incomeInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            incomeInput.style.borderColor = '#e2e8f0';
            incomeInput.style.animation = '';
        }, 500);
        return;
    }
    
    if (annualIncome === 0 && expenses === 0 && allowances === 0) {
        showNotification('กรุณากรอกข้อมูลเพื่อคำนวณภาษี');
        return;
    }
    
    // คำนวณเงินได้สุทธิ
    const netIncome = annualIncome - expenses - allowances;
    
    // คำนวณภาษีตามขั้นบันได
    let tax = 0;
    
    if (netIncome <= 150000) {
        tax = 0;
    } else if (netIncome <= 300000) {
        tax = (netIncome - 150000) * 0.05;
    } else if (netIncome <= 500000) {
        tax = (netIncome - 300000) * 0.1 + 7500;
    } else if (netIncome <= 750000) {
        tax = (netIncome - 500000) * 0.15 + 27500;
    } else if (netIncome <= 1000000) {
        tax = (netIncome - 750000) * 0.2 + 65000;
    } else if (netIncome < 2000000) {
        tax = (netIncome - 1000000) * 0.25 + 115000;
    } else if (netIncome <= 5000000) {
        tax = (netIncome - 2000000) * 0.3 + 365000;
    } else {
        tax = (netIncome - 5000000) * 0.35 + 1265000;
    }
    
    // แสดงผลลัพธ์ด้วย animation
    const netIncomeElement = document.getElementById('net-income-value');
    const taxElement = document.getElementById('tax-value');
    const resultContainer = document.getElementById('result-container');
    
    // แสดง container
    resultContainer.classList.add('show');
    
    // Animate values
    setTimeout(() => {
        animateValue(netIncomeElement, 0, netIncome, 1000);
        setTimeout(() => {
            animateValue(taxElement, 0, tax, 1000);
            // แสดงกราฟหลังจากแสดงผลลัพธ์
            setTimeout(() => {
                showChart(netIncome, tax);
            }, 500);
        }, 200);
    }, 100);
}

function showChart(netIncome, tax) {
    const chartContainer = document.getElementById('chart-container');
    const chartBars = document.getElementById('chart-bars');
    const chartLabels = document.getElementById('chart-labels');
    
    // ล้างกราฟเก่า
    chartBars.innerHTML = '';
    chartLabels.innerHTML = '';
    
    // กำหนดช่วงภาษี
    const taxBrackets = [
        { label: '0%', max: 150000, rate: 0, color: '#e2e8f0' },
        { label: '5%', max: 300000, rate: 0.05, color: '#667eea' },
        { label: '10%', max: 500000, rate: 0.1, color: '#764ba2' },
        { label: '15%', max: 750000, rate: 0.15, color: '#f093fb' },
        { label: '20%', max: 1000000, rate: 0.2, color: '#f5576c' },
        { label: '25%', max: 2000000, rate: 0.25, color: '#fa709a' },
        { label: '30%', max: 5000000, rate: 0.3, color: '#fee140' },
        { label: '35%', max: Infinity, rate: 0.35, color: '#4facfe' }
    ];
    
    // หา bracket ที่เหมาะสม
    let currentBracket = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
        if (netIncome <= taxBrackets[i].max) {
            currentBracket = i;
            break;
        }
    }
    
    // สร้างกราฟแสดงทุก bracket แต่ highlight bracket ปัจจุบัน
    const maxHeight = 120;
    // ใช้ค่า max ที่เหมาะสมสำหรับการแสดงกราฟ (ใช้ 1,000,000 เพื่อให้สัดส่วนดีขึ้น)
    const maxNetIncomeForChart = 1000000;
    
    taxBrackets.forEach((bracket, index) => {
        // คำนวณความสูงของ bar โดยใช้สัดส่วนที่เหมาะสม
        let bracketMax = bracket.max;
        if (bracketMax === Infinity) {
            bracketMax = maxNetIncomeForChart;
        } else {
            bracketMax = Math.min(bracket.max, maxNetIncomeForChart);
        }
        
        // ใช้สัดส่วนแบบไม่เชิงเส้นเพื่อให้แท่งแรกๆ สูงขึ้นมา
        let heightPercent;
        if (bracketMax <= 150000) {
            heightPercent = (bracketMax / maxNetIncomeForChart) * 15; // แท่งแรก 15%
        } else if (bracketMax <= 300000) {
            heightPercent = 15 + ((bracketMax - 150000) / maxNetIncomeForChart) * 20; // 15-35%
        } else if (bracketMax <= 500000) {
            heightPercent = 35 + ((bracketMax - 300000) / maxNetIncomeForChart) * 20; // 35-55%
        } else if (bracketMax <= 750000) {
            heightPercent = 55 + ((bracketMax - 500000) / maxNetIncomeForChart) * 20; // 55-75%
        } else {
            heightPercent = 75 + ((bracketMax - 750000) / maxNetIncomeForChart) * 25; // 75-100%
        }
        
        let barHeight = (heightPercent / 100) * maxHeight;
        
        // จำกัดความสูงต่ำสุดและสูงสุด
        barHeight = Math.max(barHeight, 8); // ต่ำสุด 8px
        barHeight = Math.min(barHeight, maxHeight * 0.98); // สูงสุด 98%
        
        // สร้าง bar
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        if (index === currentBracket) {
            bar.classList.add('active');
        } else if (index < currentBracket) {
            // Bracket ที่ผ่านมาแล้ว
            bar.style.background = bracket.color;
            bar.style.opacity = '0.6';
        } else {
            // Bracket ที่ยังไม่ถึง
            bar.style.background = '#e2e8f0';
            bar.style.opacity = '0.4';
        }
        bar.style.height = `${barHeight}px`;
        
        // เพิ่มค่าแสดงบน bar - แสดงเฉพาะแท่งที่ active เท่านั้น
        if (index === currentBracket) {
            const barValue = document.createElement('div');
            barValue.className = 'chart-bar-value';
            barValue.textContent = formatNumber(netIncome);
            barValue.style.color = '#f5576c';
            barValue.style.fontWeight = '700';
            bar.appendChild(barValue);
        }
        
        // เพิ่ม animation delay เพื่อให้เด้งทีละอัน
        bar.style.animationDelay = `${index * 0.06}s`;
        chartBars.appendChild(bar);
        
        // สร้าง label
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = bracket.label;
        if (index === currentBracket) {
            label.style.color = '#f5576c';
            label.style.fontWeight = '700';
            label.style.fontSize = '10px';
        }
        label.style.animationDelay = `${index * 0.06 + 0.4}s`;
        chartLabels.appendChild(label);
    });
    
    // แสดงกราฟด้วย animation
    chartContainer.classList.add('show');
}

// เพิ่มการกด Enter เพื่อคำนวณ
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateTax();
            }
        });
    });
});

