/* UI module for managing screens and interactions */

class UIManager {
    constructor() {
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            sectionMenu: document.getElementById('section-menu'),
            sizeMenu: document.getElementById('size-menu'),
            trainingScreen: document.getElementById('training-screen'),
            resultsScreen: document.getElementById('results-screen'),
            statsScreen: document.getElementById('stats-screen'),
            loadingScreen: document.getElementById('loading-screen')
        };

        this.elements = {
            mainMenuItems: document.getElementById('main-menu-items'),
            sectionMenuItems: document.getElementById('section-menu-items'),
            sizeMenuItems: document.getElementById('size-menu-items'),
            customSizeInput: document.getElementById('custom-size-input'),
            maxTasks: document.getElementById('max-tasks'),
            customTasksInput: document.getElementById('custom-tasks-input'),
            customTasksSubmit: document.getElementById('custom-tasks-submit'),
            instructionPanel: document.getElementById('instruction-panel'),
            questionCounter: document.getElementById('question-counter'),
            remainingTasks: document.getElementById('remaining-tasks'),
            sessionCorrect: document.getElementById('session-correct'),
            sessionWrong: document.getElementById('session-wrong'),
            questionText: document.getElementById('question-text'),
            answerInput: document.getElementById('answer-input'),
            submitAnswer: document.getElementById('submit-answer'),
            stopSession: document.getElementById('stop-session'),
            feedback: document.getElementById('feedback'),
            resultsTitle: document.getElementById('results-title'),
            resultTotal: document.getElementById('result-total'),
            resultCorrect: document.getElementById('result-correct'),
            resultWrong: document.getElementById('result-wrong'),
            resultPercent: document.getElementById('result-percent'),
            resultsBack: document.getElementById('results-back'),
            statsContent: document.getElementById('stats-content'),
            statsBack: document.getElementById('stats-back')
        };
    }

    // Show a specific screen
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        this.screens[screenName].classList.remove('hidden');
    }

    // Show loading screen
    showLoading() {
        this.showScreen('loadingScreen');
    }

    // Hide loading screen
    hideLoading() {
        this.screens.loadingScreen.classList.add('hidden');
    }

    // Render main menu
    renderMainMenu(reviewCount) {
        const items = [
            { id: 'test', label: 'Начать тест' }
        ];

        if (reviewCount > 0) {
            items.push({ id: 'review', label: `Повторить ошибки (${reviewCount})` });
        }

        items.push(
            { id: 'stats', label: 'Показать статистику' },
            { id: 'clear', label: 'Сбросить статистику' }
        );

        this.renderMenu(this.elements.mainMenuItems, items);
    }

    // Render section menu
    renderSectionMenu(sections) {
        const items = sections.map(section => ({
            id: section.id,
            label: section.name
        }));

        items.push({ id: 'back', label: 'Назад' });
        this.renderMenu(this.elements.sectionMenuItems, items);
    }

    // Render size menu
    renderSizeMenu(maxTasks) {
        const items = [
            { id: '10', label: '10 заданий' },
            { id: '20', label: '20 заданий' },
            { id: '50', label: '50 заданий' },
            { id: 'custom', label: 'Свое число заданий' }
        ];

        this.renderMenu(this.elements.sizeMenuItems, items);
        this.elements.maxTasks.textContent = maxTasks;
    }

    // Render menu items
    renderMenu(container, items) {
        container.innerHTML = '';
        items.forEach(item => {
            const button = document.createElement('div');
            button.className = 'menu-item';
            button.textContent = item.label;
            button.dataset.id = item.id;
            container.appendChild(button);
        });
    }

    // Show custom size input
    showCustomSizeInput() {
        this.elements.customSizeInput.classList.remove('hidden');
    }

    // Hide custom size input
    hideCustomSizeInput() {
        this.elements.customSizeInput.classList.add('hidden');
        this.elements.customTasksInput.value = '';
    }

    // Get custom task count
    getCustomTaskCount() {
        return parseInt(this.elements.customTasksInput.value, 10);
    }

    // Render instruction panel
    renderInstruction(instruction) {
        if (!instruction) {
            this.elements.instructionPanel.classList.add('hidden');
            return;
        }

        this.elements.instructionPanel.innerHTML = `
            <div class="instruction-title">📋 ${instruction.title}</div>
            <div class="instruction-text">${instruction.instruction}</div>
            ${instruction.example ? `<div class="instruction-example">Пример: ${instruction.example}</div>` : ''}
        `;
        this.elements.instructionPanel.classList.remove('hidden');
    }

    // Update training header
    updateTrainingHeader(current, total, correct, wrong) {
        this.elements.questionCounter.textContent = `Вопрос ${current} из ${total}`;
        this.elements.remainingTasks.textContent = `Осталось: ${total - current}`;
        this.elements.sessionCorrect.textContent = `Правильных: ${correct}`;
        this.elements.sessionWrong.textContent = `Ошибок: ${wrong}`;
    }

    // Render question
    renderQuestion(question) {
        this.elements.questionText.textContent = question;
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
        this.elements.feedback.classList.add('hidden');
    }

    // Show feedback
    showFeedback(isCorrect, correctAnswer) {
        this.elements.feedback.classList.remove('hidden');
        this.elements.feedback.classList.remove('correct', 'incorrect');
        
        if (isCorrect) {
            this.elements.feedback.classList.add('correct');
            this.elements.feedback.textContent = 'Правильно!';
        } else {
            this.elements.feedback.classList.add('incorrect');
            this.elements.feedback.textContent = `Неправильно. Правильный ответ: ${correctAnswer}`;
        }
    }

    // Hide feedback
    hideFeedback() {
        this.elements.feedback.classList.add('hidden');
    }

    // Render results
    renderResults(stats, stopped = false) {
        this.elements.resultsTitle.textContent = stopped ? 'Тест остановлен' : 'Тест завершён';
        this.elements.resultTotal.textContent = stats.total;
        this.elements.resultCorrect.textContent = stats.correct;
        this.elements.resultWrong.textContent = stats.wrong;
        this.elements.resultPercent.textContent = `${stats.successPercent.toFixed(1)}%`;
    }

    // Render statistics
    renderStatistics(stats) {
        this.elements.statsContent.innerHTML = '';

        if (Object.keys(stats).length === 0) {
            this.elements.statsContent.innerHTML = '<p>Статистика пока не собрана.</p>';
            return;
        }

        for (const [topic, data] of Object.entries(stats)) {
            const successRate = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-label">${topic}</div>
                <div class="stat-value">
                    Решено: ${data.total} | Правильных: ${data.correct} | Ошибок: ${data.wrong} | Успешность: ${successRate.toFixed(1)}%
                </div>
            `;
            this.elements.statsContent.appendChild(statItem);
        }
    }

    // Clear answer input
    clearAnswer() {
        this.elements.answerInput.value = '';
    }

    // Get user answer
    getUserAnswer() {
        return this.elements.answerInput.value.trim();
    }

    // Focus answer input
    focusAnswerInput() {
        this.elements.answerInput.focus();
    }
}

// Export (ES6)
export { UIManager };
