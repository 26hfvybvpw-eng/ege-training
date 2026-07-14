/* Main application module */

import { UIManager } from './ui.js';
import { Router } from './router.js';
import { TrainingSession } from './training.js';
import { StatisticsManager } from './statistics.js';
import { MistakeManager } from './mistakes.js';
import { getParser, getSupportedFiles } from './parserRegistry.js';
import { Storage } from './storage.js';
import { isStopCommand, isValidNumber } from './utils.js';

// EGE sections configuration
const SECTIONS = [
    { id: 'stress', name: 'Ударения (Задание 4)', file: 'stress.txt' },
    { id: 'paronyms', name: 'Паронимы (Задание 5)', file: 'paronyms.txt' },
    { id: 'orthography', name: 'Орфография (Задания 9-12)', file: 'orthography.txt' },
    { id: 'nn', name: 'Н/НН (Задание 15)', file: 'nn.txt' },
    { id: 'ne_ni', name: 'НЕ (Задание 13)', file: 'ne_ni.txt' },
    { id: 'punctuation', name: 'Пунктуация (Задания 16-20)', file: 'punctuation.txt' },
    { id: 'leksika', name: 'Лексика (Задание 6)', file: 'leksika.txt' }
];

class Application {
    constructor() {
        this.ui = new UIManager();
        this.router = new Router();
        this.statistics = new StatisticsManager();
        this.mistakes = new MistakeManager();
        this.currentSession = null;
        this.currentSection = null;
        this.allTasks = {};
        
        this._initializeRouter();
        this._setupEventListeners();
    }

    // Initialize router handlers
    _initializeRouter() {
        this.router.register('mainMenu', () => this._handleMainMenu());
        this.router.register('sectionMenu', () => this._handleSectionMenu());
        this.router.register('sizeMenu', () => this._handleSizeMenu());
        this.router.register('training', () => this._handleTraining());
        this.router.register('results', () => this._handleResults());
        this.router.register('stats', () => this._handleStats());
    }

    // Setup event listeners
    _setupEventListeners() {
        // Main menu clicks
        this.ui.elements.mainMenuItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                this._handleMainMenuClick(e.target.dataset.id);
            }
        });

        // Section menu clicks
        this.ui.elements.sectionMenuItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                this._handleSectionMenuClick(e.target.dataset.id);
            }
        });

        // Size menu clicks
        this.ui.elements.sizeMenuItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                this._handleSizeMenuClick(e.target.dataset.id);
            }
        });

        // Custom size submit
        this.ui.elements.customTasksSubmit.addEventListener('click', () => {
            this._handleCustomSizeSubmit();
        });

        // Training controls
        this.ui.elements.submitAnswer.addEventListener('click', () => {
            this._handleSubmitAnswer();
        });

        this.ui.elements.stopSession.addEventListener('click', () => {
            this._handleStopSession();
        });

        this.ui.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this._handleSubmitAnswer();
            }
        });

        // Results back button
        this.ui.elements.resultsBack.addEventListener('click', () => {
            this.router.navigate('mainMenu');
        });

        // Stats back button
        this.ui.elements.statsBack.addEventListener('click', () => {
            this.router.navigate('mainMenu');
        });
    }

    // Start the application
    async start() {
        this.ui.showLoading();
        
        try {
            // Load all tasks
            await this._loadAllTasks();
            
            // Show main menu
            this.router.navigate('mainMenu');
        } catch (error) {
            console.error('Error starting application:', error);
            alert('Ошибка при загрузке приложения. Проверьте консоль для деталей.');
        } finally {
            this.ui.hideLoading();
        }
    }

    // Load all tasks from TXT files
    async _loadAllTasks() {
        for (const section of SECTIONS) {
            try {
                const tasks = await this._loadTasksFromFile(section.file);
                this.allTasks[section.id] = tasks;
            } catch (error) {
                console.error(`Error loading ${section.file}:`, error);
                this.allTasks[section.id] = [];
            }
        }
    }

    // Load tasks from a specific file
    async _loadTasksFromFile(filename) {
        const response = await fetch(`sources/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        
        const content = await response.text();
        const parser = getParser(filename);
        
        if (!parser) {
            console.warn(`No parser found for ${filename}`);
            return [];
        }

        return parser.parseFile(content, filename);
    }

    // Handle main menu
    _handleMainMenu() {
        this.statistics.reload();
        this.mistakes.reload();
        this.ui.showScreen('mainMenu');
        const reviewCount = this.mistakes.getReviewCount();
        this.ui.renderMainMenu(reviewCount);
    }

    // Handle main menu click
    _handleMainMenuClick(action) {
        switch (action) {
            case 'test':
                this.router.navigate('sectionMenu');
                break;
            case 'review':
                this._startReviewSession();
                break;
            case 'stats':
                this.router.navigate('stats');
                break;
            case 'clear':
                this._handleClearStats();
                break;
        }
    }

    // Handle section menu
    _handleSectionMenu() {
        this.ui.showScreen('sectionMenu');
        this.ui.renderSectionMenu(SECTIONS);
    }

    // Handle section menu click
    _handleSectionMenuClick(sectionId) {
        if (sectionId === 'back') {
            this.router.navigate('mainMenu');
            return;
        }

        const section = SECTIONS.find(s => s.id === sectionId);
        if (section) {
            this.currentSection = section;
            const taskCount = this.allTasks[sectionId]?.length || 0;
            
            if (taskCount === 0) {
                alert('Этот раздел не содержит заданий.');
                return;
            }

            this.ui.renderSizeMenu(taskCount);
            this.ui.hideCustomSizeInput();
            this.router.navigate('sizeMenu');
        }
    }

    // Handle size menu
    _handleSizeMenu() {
        this.ui.showScreen('sizeMenu');
    }

    // Handle size menu click
    _handleSizeMenuClick(choice) {
        const taskCount = this.allTasks[this.currentSection.id]?.length || 0;

        switch (choice) {
            case '10':
                this._startTestSession(10);
                break;
            case '20':
                this._startTestSession(20);
                break;
            case '50':
                this._startTestSession(50);
                break;
            case 'custom':
                this.ui.showCustomSizeInput();
                this.ui.elements.customTasksInput.focus();
                break;
        }
    }

    // Handle custom size submit
    _handleCustomSizeSubmit() {
        const taskCount = this.allTasks[this.currentSection.id]?.length || 0;
        const customCount = this.ui.getCustomTaskCount();

        if (!isValidNumber(customCount, 1, taskCount)) {
            alert('Введите положительное число.');
            return;
        }

        if (customCount > taskCount) {
            alert(`Запрошенное число превышает доступные задания. Начинаем сессию со всеми ${taskCount} заданиями.`);
            this._startTestSession(taskCount);
        } else {
            this._startTestSession(customCount);
        }

        this.ui.hideCustomSizeInput();
    }

    // Start test session
    _startTestSession(count) {
        const tasks = this.allTasks[this.currentSection.id] || [];
        const sessionTasks = TrainingSession.prepareSession(tasks, count, 'test');
        
        this.currentSession = new TrainingSession(sessionTasks, 'test');
        this.router.navigate('training');
    }

    // Start review session
    _startReviewSession() {
        const reviewTasks = [];
        
        for (const section of SECTIONS) {
            const sectionTasks = this.allTasks[section.id] || [];
            const task = this.mistakes.getRandomReviewTask(sectionTasks);
            if (task) {
                reviewTasks.push(task);
            }
        }

        if (reviewTasks.length === 0) {
            alert('Нет ошибок для повторения.');
            return;
        }

        this.currentSession = new TrainingSession(reviewTasks, 'review');
        this.router.navigate('training');
    }

    // Handle training screen
    _handleTraining() {
        this.ui.showScreen('trainingScreen');
        
        if (!this.currentSession || !this.currentSession.hasNext()) {
            this.router.navigate('results');
            return;
        }

        // Show instruction once
        if (!this.currentSession.instructionShown) {
            const instruction = this.currentSession.getInstruction();
            this.ui.renderInstruction(instruction);
            this.currentSession.instructionShown = true;
        }

        this._renderCurrentQuestion();
    }

    // Render current question
    _renderCurrentQuestion() {
        const task = this.currentSession.getCurrentTask();
        const stats = this.currentSession.getSessionStats();
        
        this.ui.updateTrainingHeader(
            this.currentSession.currentIndex + 1,
            this.currentSession.tasks.length,
            stats.correct,
            stats.wrong
        );
        
        this.ui.renderQuestion(task.question);
    }

    // Handle submit answer
    _handleSubmitAnswer() {
        const userAnswer = this.ui.getUserAnswer();
        
        if (!userAnswer) {
            return;
        }

        if (isStopCommand(userAnswer)) {
            this._handleStopSession();
            return;
        }

        const task = this.currentSession.getCurrentTask();
        const isCorrect = this.currentSession.submitAnswer(userAnswer);
        
        this.ui.showFeedback(isCorrect, task.answer);

        // Delay before next question
        setTimeout(() => {
            if (this.currentSession.hasNext()) {
                this._renderCurrentQuestion();
            } else {
                this.router.navigate('results');
            }
        }, 1500);
    }

    // Handle stop session
    _handleStopSession() {
        if (confirm('Вы уверены, что хотите остановить сессию?')) {
            this.router.navigate('results');
        }
    }

    // Handle results screen
    _handleResults() {
        this.ui.showScreen('resultsScreen');
        
        if (!this.currentSession) {
            return;
        }

        const stats = this.currentSession.getSessionStats();
        this.ui.renderResults(stats);
    }

    // Handle stats screen
    _handleStats() {
        this.statistics.reload();
        this.ui.showScreen('statsScreen');
        const stats = this.statistics.getAll();
        this.ui.renderStatistics(stats);
    }

    // Handle clear stats
    _handleClearStats() {
        if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
            this.statistics.resetAll();
            this.mistakes.clearAll();
            alert('Статистика сброшена.');
            this.router.navigate('mainMenu');
        }
    }
}

// Export (ES6)
export { Application, SECTIONS };
