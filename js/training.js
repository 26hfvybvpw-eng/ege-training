/* Training session module */

import { shuffleArray, getRandomSubset, normalizeAnswer, isStopCommand } from './utils.js';
import { StatisticsManager } from './statistics.js';
import { MistakeManager } from './mistakes.js';

// Task instructions
const TASK_INSTRUCTIONS = {
    'ударения': {
        title: 'Задание 4 — Ударения',
        instruction: 'Перепишите слово и выделите гласную с ударением заглавной буквой.',
        example: 'каталОг'
    },
    'паронимы': {
        title: 'Задание 5 — Паронимы',
        instruction: 'Введите один правильный пароним к заданному слову.',
        example: 'бывалый → былой'
    },
    'орфография': {
        title: 'Задания 9–12 — Орфография',
        instruction: 'Вставьте пропущенную букву(ы). Введите только пропущенную букву(ы), а не все слово целиком.',
        example: ''
    },
    'не/ни': {
        title: 'Задание 13 — Слитное / Раздельное написание НЕ',
        instruction: 'Прочтите предложение и запишите как пишется слово в скобках: слитно или раздельно',
        example: 'Это была (не)правда. → слитно'
    },
    'нн': {
        title: 'Задание 15 — Н / НН',
        instruction: 'Определите, что необходимо вставить. Вводите только: н или нн',
        example: null
    },
    'лексика': {
        title: 'Задание 6 — Лексика',
        instruction: 'Введите правильный ответ из предложенных вариантов.',
        example: null
    },
    'пунктуация': {
        title: 'Задание 21 — Пунктуация',
        instruction: 'Укажите все цифры, на месте которых в предложении должны стоять запятые.',
        example: null
    }
};

class TrainingSession {
    constructor(tasks, mode = 'test') {
        this.tasks = tasks;
        this.mode = mode; // 'test' or 'review'
        this.currentIndex = 0;
        this.results = [];
        this.statistics = new StatisticsManager();
        this.mistakes = new MistakeManager();
        this.instructionShown = false;
    }

    // Get current task
    getCurrentTask() {
        return this.tasks[this.currentIndex];
    }

    // Check if session has more tasks
    hasNext() {
        return this.currentIndex < this.tasks.length;
    }

    // Submit answer for current task
    submitAnswer(userAnswer) {
        const task = this.getCurrentTask();
        const isCorrect = this.checkAnswer(userAnswer, task);

        this.results.push({
            task,
            userAnswer,
            isCorrect,
            timestamp: Date.now()
        });

        // Update statistics
        this.statistics.recordAnswer(task.topic, isCorrect);

        // Track mistakes
        if (!isCorrect && this.mode === 'test') {
            this.mistakes.addMistake(task, userAnswer);
        } else if (this.mode === 'review') {
            this.mistakes.recordReviewAnswer(task.answer, isCorrect);
        }

        this.currentIndex++;
        return isCorrect;
    }

    // Check answer against correct answer
    checkAnswer(userAnswer, task) {
        const normalizedUser = normalizeAnswer(userAnswer);
        const normalizedCorrect = normalizeAnswer(task.answer);

        // Handle multiple correct answers (paronyms, leksika)
        if (task.correctAnswers && Array.isArray(task.correctAnswers)) {
            return task.correctAnswers.some(answer => 
                normalizeAnswer(answer) === normalizedUser
            );
        }

        // Handle stress answers (check position)
        if (task.topic === 'ударения') {
            return this.checkStressAnswer(userAnswer, task.answer);
        }

        // Handle NE/NI answers
        if (task.topic === 'не/ни') {
            return this.checkNeNiAnswer(userAnswer, task.answer);
        }

        // Default comparison
        return normalizedUser === normalizedCorrect;
    }

    // Check stress answer (position of uppercase letter)
    checkStressAnswer(userAnswer, correctAnswer) {
        const userStress = this.getStressIndex(userAnswer);
        const correctStress = this.getStressIndex(correctAnswer);

        if (correctStress === null) {
            return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
        }

        return userStress === correctStress;
    }

    // Check NE/NI answer
    checkNeNiAnswer(userAnswer, correctAnswer) {
        const normalizedUser = this.normalizeNeNiAnswer(userAnswer);
        const normalizedCorrect = this.normalizeNeNiAnswer(correctAnswer);
        return normalizedUser === normalizedCorrect;
    }

    // Normalize NE/NI answer
    normalizeNeNiAnswer(answer) {
        const normalized = normalizeAnswer(answer);
        if (['слит', 'слитно'].includes(normalized)) return 'слитно';
        if (['разд', 'раздельно'].includes(normalized)) return 'раздельно';
        return normalized;
    }

    // Get stress index
    getStressIndex(text) {
        for (let i = 0; i < text.length; i++) {
            if (text[i] === text[i].toUpperCase() && /[A-ZА-ЯЁ]/.test(text[i])) {
                return i;
            }
        }
        return null;
    }

    // Get session statistics
    getSessionStats() {
        const total = this.results.length;
        const correct = this.results.filter(r => r.isCorrect).length;
        const wrong = total - correct;
        const successPercent = total > 0 ? (correct / total) * 100 : 0;

        return { total, correct, wrong, successPercent };
    }

    // Get instruction for current task topic
    getInstruction() {
        if (this.tasks.length === 0) return null;
        const topic = this.tasks[0].topic;
        return TASK_INSTRUCTIONS[topic] || null;
    }

    // Prepare tasks for session (shuffle and limit)
    static prepareSession(allTasks, count, mode = 'test') {
        if (mode === 'review') {
            // For review mode, tasks are already filtered
            return shuffleArray(allTasks);
        }

        // For test mode, shuffle and limit
        const shuffled = shuffleArray(allTasks);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
}

// Export (ES6)
export { TrainingSession, TASK_INSTRUCTIONS };
