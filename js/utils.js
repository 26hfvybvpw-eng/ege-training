/* Utility functions */

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random item from array
function getRandomItem(array) {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

// Get random subset of array
function getRandomSubset(array, size) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(size, array.length));
}

// Normalize answer (trim and lowercase)
function normalizeAnswer(answer) {
    return answer.trim().toLowerCase();
}

// Check if string is empty or whitespace
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

// Format percentage
function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get stress index (position of uppercase letter)
function getStressIndex(text) {
    for (let i = 0; i < text.length; i++) {
        if (text[i].isAlpha && text[i] === text[i].toUpperCase()) {
            return i;
        }
    }
    return null;
}

// Count stress letters (uppercase letters)
function countStressLetters(text) {
    return (text.match(/[A-ZА-ЯЁ]/g) || []).length;
}

// Check if answer is stop command
function isStopCommand(text) {
    const stopCommands = ['стоп', 'выход', 'stop', 'exit', '0'];
    return stopCommands.includes(normalizeAnswer(text));
}

// Validate number input
function isValidNumber(value, min = 1, max = Infinity) {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
}

// Format number with Russian plural
function formatPlural(number, forms) {
    const n = Math.abs(number);
    const n10 = n % 10;
    const n100 = n % 100;
    
    if (n100 >= 11 && n100 <= 19) {
        return forms[2];
    }
    if (n10 === 1) {
        return forms[0];
    }
    if (n10 >= 2 && n10 <= 4) {
        return forms[1];
    }
    return forms[2];
}

// Export functions (ES6 modules)
export {
    shuffleArray,
    getRandomItem,
    getRandomSubset,
    normalizeAnswer,
    isEmpty,
    formatPercentage,
    debounce,
    getStressIndex,
    countStressLetters,
    isStopCommand,
    isValidNumber,
    formatPlural
};
