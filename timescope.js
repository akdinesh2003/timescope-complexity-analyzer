// Enhanced TimeScope JavaScript with animations and effects

// Sound effects (optional - will only work if user has interacted with page)
let audioContext;
let oscillator;

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log('Audio not supported');
  }
}

function playSuccessSound() {
  if (!audioContext) return;
  
  try {
    oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.log('Audio playback failed');
  }
}

// Typing effect for results
function typeWriter(element, text, speed = 50) {
  element.innerHTML = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Enhanced complexity analysis with more detailed detection
function analyzeCode() {
  const code = document.getElementById("codeInput").value;
  const language = document.getElementById("langSelector").value;
  
  if (!code.trim()) {
    showResult("Please enter some code to analyze!", "error");
    return;
  }

  // Show loading overlay
  document.getElementById("loadingOverlay").style.display = "block";
  
  // Update character and line count
  updateInputStats(code);

  // Simulate analysis time for better UX
  setTimeout(() => {
    const complexity = performComplexityAnalysis(code, language);
    showResult(complexity, "success");
    updateMetrics(complexity);
    playSuccessSound();
    addToHistory(code, complexity);
    
    // Hide loading overlay
    document.getElementById("loadingOverlay").style.display = "none";
  }, 2000);
}

function performComplexityAnalysis(code, language) {
  const cleanedCode = code.replace(/\s/g, "").toLowerCase();
  
  let forCount = 0;
  let whileCount = 0;
  let recursionDetected = false;
  let nestedLoops = 0;
  let dataStructures = [];

  // Enhanced language-specific detection
  if (language === "python") {
    forCount = (cleanedCode.match(/for.*in.*range/g) || []).length;
    whileCount = (cleanedCode.match(/while.*:/g) || []).length;
    recursionDetected = cleanedCode.includes("def") && 
                       cleanedCode.includes(cleanedCode.match(/def(\w+)/)?.[1]);
    
    // Check for nested loops
    const forMatches = code.match(/for.*in.*range.*:/g) || [];
    nestedLoops = forMatches.length;
    
    // Check for data structures
    if (cleanedCode.includes("list") || cleanedCode.includes("[]")) dataStructures.push("List");
    if (cleanedCode.includes("dict") || cleanedCode.includes("{}")) dataStructures.push("Dictionary");
    if (cleanedCode.includes("set")) dataStructures.push("Set");
    
  } else if (language === "javascript" || language === "cpp") {
    forCount = (cleanedCode.match(/for\(/g) || []).length;
    whileCount = (cleanedCode.match(/while\(/g) || []).length;
    recursionDetected = cleanedCode.includes("function") && 
                       cleanedCode.includes(cleanedCode.match(/function(\w+)/)?.[1]);
    
    // Check for nested loops
    const forMatches = code.match(/for\(/g) || [];
    nestedLoops = forMatches.length;
    
    // Check for data structures
    if (cleanedCode.includes("array") || cleanedCode.includes("[]")) dataStructures.push("Array");
    if (cleanedCode.includes("object") || cleanedCode.includes("{}")) dataStructures.push("Object");
    if (cleanedCode.includes("map")) dataStructures.push("Map");
    if (cleanedCode.includes("set")) dataStructures.push("Set");
  } else {
    // Auto-detect
    forCount = (cleanedCode.match(/for\(/g) || []).length + 
               (cleanedCode.match(/for.*in.*range/g) || []).length;
    whileCount = (cleanedCode.match(/while\(/g) || []).length + 
                 (cleanedCode.match(/while.*:/g) || []).length;
    recursionDetected = cleanedCode.includes("function") || cleanedCode.includes("def");
  }

  // Enhanced complexity determination
  let complexity = "";
  let explanation = "";
  
  if (recursionDetected) {
    complexity = "O(2ⁿ) - Exponential";
    explanation = "Recursive algorithm detected. Consider using dynamic programming or iteration.";
  } else if (nestedLoops >= 2) {
    complexity = "O(n²) - Quadratic";
    explanation = "Nested loops detected. Consider optimizing with better algorithms.";
  } else if (forCount >= 2 || whileCount >= 2 || (forCount + whileCount) >= 2) {
    complexity = "O(n²) - Quadratic";
    explanation = "Multiple loops detected.";
  } else if (forCount === 1 || whileCount === 1) {
    complexity = "O(n) - Linear";
    explanation = "Single loop detected. Good performance!";
  } else {
    complexity = "O(1) - Constant";
    explanation = "No loops detected. Excellent performance!";
  }

  return {
    complexity: complexity,
    explanation: explanation,
    dataStructures: dataStructures,
    loops: { for: forCount, while: whileCount, nested: nestedLoops }
  };
}

function showResult(result, type) {
  const resultElement = document.getElementById("result");
  resultElement.className = `result-display ${type}`;
  
  if (typeof result === 'string') {
    typeWriter(resultElement, result);
  } else {
    const resultText = `
      <div class="complexity-result">
        <div class="complexity-main">${result.complexity}</div>
        <div class="complexity-explanation">${result.explanation}</div>
        ${result.dataStructures.length > 0 ? 
          `<div class="data-structures">Data Structures: ${result.dataStructures.join(', ')}</div>` : ''}
        <div class="loop-info">
          Loops: ${result.loops.for} for, ${result.loops.while} while, ${result.loops.nested} nested
        </div>
      </div>
    `;
    resultElement.innerHTML = resultText;
  }
  
  // Add success animation
  if (type === "success") {
    resultElement.style.animation = "successPulse 0.6s ease-out";
    setTimeout(() => {
      resultElement.style.animation = "glow 2s ease-in-out infinite alternate";
    }, 600);
  }
}

function addToHistory(code, result) {
  let history = JSON.parse(localStorage.getItem("complexityHistory")) || [];
  
  const historyItem = {
    code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
    complexity: typeof result === 'string' ? result : result.complexity,
    timestamp: new Date().toLocaleString(),
    id: Date.now()
  };
  
  history.unshift(historyItem); // Add to beginning
  
  // Keep only last 10 items
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  
  localStorage.setItem("complexityHistory", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("complexityHistory")) || [];
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = '<li class="no-history">No analysis history yet. Start by analyzing some code!</li>';
    return;
  }

  history.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-header">
        <span class="history-number">#${index + 1}</span>
        <span class="history-complexity">${item.complexity}</span>
        <span class="history-time">${item.timestamp}</span>
      </div>
      <div class="history-code">${item.code}</div>
    `;
    
    // Add staggered animation
    li.style.animationDelay = `${index * 0.1}s`;
    
    list.appendChild(li);
  });
}

function clearCode() {
  const textarea = document.getElementById("codeInput");
  textarea.value = "";
  textarea.focus();
  
  // Add clear animation
  textarea.style.animation = "shake 0.5s ease-in-out";
  setTimeout(() => {
    textarea.style.animation = "";
  }, 500);
}

// Enhanced initialization
window.onload = function() {
  initAudio();
  loadHistory();
  
  // Add interactive effects
  addInteractiveEffects();
  
  // Add input event listeners for real-time stats
  const textarea = document.getElementById("codeInput");
  textarea.addEventListener('input', function() {
    updateInputStats(this.value);
  });
  
  // Auto-focus on textarea
  textarea.focus();
  
  // Initialize with empty stats
  updateInputStats('');
};

function addInteractiveEffects() {
  // Add hover effects to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Add typing effect to placeholder
  const textarea = document.getElementById("codeInput");
  const originalPlaceholder = textarea.placeholder;
  
  textarea.addEventListener('focus', function() {
    if (this.value === '') {
      typeWriterPlaceholder(this, originalPlaceholder);
    }
  });
}

function typeWriterPlaceholder(element, text) {
  element.placeholder = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.placeholder += text.charAt(i);
      i++;
      setTimeout(type, 30);
    }
  }
  
  type();
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes successPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .result-display.analyzing {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    animation: analyzing 1.5s ease-in-out infinite;
  }
  
  @keyframes analyzing {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
  
  .result-display.error {
    background: rgba(255, 107, 107, 0.3);
    border-color: #ff6b6b;
    color: #ff6b6b;
  }
  
  .complexity-result {
    text-align: center;
  }
  
  .complexity-main {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 10px;
  }
  
  .complexity-explanation {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 8px;
  }
  
  .data-structures, .loop-info {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 5px;
  }
  
  .history-item {
    cursor: pointer;
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  
  .history-number {
    font-weight: bold;
    color: #00d4ff;
  }
  
  .history-complexity {
    font-weight: 500;
  }
  
  .history-time {
    font-size: 0.8rem;
    opacity: 0.7;
  }
  
  .history-code {
    font-size: 0.8rem;
    opacity: 0.8;
    font-family: 'Courier New', monospace;
  }
  
  .no-history {
    text-align: center;
    opacity: 0.7;
    font-style: italic;
  }
`;
document.head.appendChild(style);

function updateInputStats(code) {
  const charCount = document.querySelector('.char-count');
  const lineCount = document.querySelector('.line-count');
  
  if (charCount && lineCount) {
    charCount.textContent = `${code.length} chars`;
    lineCount.textContent = `${code.split('\n').length} lines`;
  }
}

function updateMetrics(result) {
  const performanceMetric = document.getElementById('performanceMetric');
  const memoryMetric = document.getElementById('memoryMetric');
  const complexityMetric = document.getElementById('complexityMetric');
  
  if (performanceMetric && memoryMetric && complexityMetric) {
    const complexity = typeof result === 'string' ? result : result.complexity;
    
    // Set performance rating based on complexity
    let performance = "Excellent";
    let memory = "Low";
    
    if (complexity.includes("O(n²)")) {
      performance = "Good";
      memory = "Medium";
    } else if (complexity.includes("O(2ⁿ)")) {
      performance = "Poor";
      memory = "High";
    }
    
    performanceMetric.textContent = performance;
    memoryMetric.textContent = memory;
    complexityMetric.textContent = complexity.split(' ')[0]; // Just the O(n) part
  }
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all analysis history?')) {
    localStorage.removeItem("complexityHistory");
    loadHistory();
  }
}

function showExamples() {
  document.getElementById("examplesModal").style.display = "block";
  showExampleTab('linear'); // Show default tab
}

function closeExamples() {
  document.getElementById("examplesModal").style.display = "none";
}

function showExampleTab(tabName) {
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  const examples = {
    linear: {
      title: "O(n) - Linear Time",
      description: "Algorithms that process each element once",
      code: `// Simple loop - O(n)
for (let i = 0; i < n; i++) {
    console.log(i);
}

// Array traversal - O(n)
for (let item of array) {
    process(item);
}`,
      explanation: "Time grows linearly with input size. Excellent performance for most use cases."
    },
    quadratic: {
      title: "O(n²) - Quadratic Time", 
      description: "Algorithms with nested loops",
      code: `// Nested loops - O(n²)
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        console.log(i, j);
    }
}

// Bubble sort - O(n²)
for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
    }
}`,
      explanation: "Time grows quadratically. Consider optimization for large inputs."
    },
    exponential: {
      title: "O(2ⁿ) - Exponential Time",
      description: "Recursive algorithms that can be optimized",
      code: `// Fibonacci (naive) - O(2ⁿ)
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Recursive subset sum - O(2ⁿ)
function subsetSum(arr, target, index = 0) {
    if (target === 0) return true;
    if (index >= arr.length) return false;
    
    return subsetSum(arr, target - arr[index], index + 1) ||
           subsetSum(arr, target, index + 1);
}`,
      explanation: "Time grows exponentially. Use dynamic programming or iteration instead."
    }
  };
  
  const example = examples[tabName];
  const content = document.getElementById('exampleContent');
  
  content.innerHTML = `
    <div class="example-header">
      <h3>${example.title}</h3>
      <p>${example.description}</p>
    </div>
    <div class="example-code">
      <pre><code>${example.code}</code></pre>
    </div>
    <div class="example-explanation">
      <p><strong>Explanation:</strong> ${example.explanation}</p>
    </div>
  `;
}