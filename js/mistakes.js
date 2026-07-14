/* Mistake tracking and review module */

import { Storage } from './storage.js';
import { shuffleArray } from './utils.js';

const REVIEW_REQUIRED_STREAK = 3; // Number of correct answers needed to graduate from review

class MistakeManager {
    constructor() {
        this.mistakes = Storage.getMistakes();
    }

    // Reload mistakes from localStorage
    reload() {
        this.mistakes = Storage.getMistakes();
    }

    // Get all mistakes
    getAll() {
        return this.mistakes;
    }

    // Get mistakes for a specific topic
    getTopicMistakes(topic) {
        return this.mistakes.filter(m => m.topic === topic);
    }

    // Get mistakes that need review
    getReviewMistakes() {
        return this.mistakes.filter(m => m.needsReview);
    }

    // Get count of mistakes needing review
    getReviewCount() {
        return this.getReviewMistakes().length;
    }

    // Add a mistake
    addMistake(task, userAnswer) {
        const existingIndex = this.mistakes.findIndex(
            m => m.answer === task.answer && m.topic === task.topic
        );

        if (existingIndex >= 0) {
            // Update existing mistake
            this.mistakes[existingIndex].userAnswer = userAnswer;
            this.mistakes[existingIndex].timestamp = Date.now();
            this.mistakes[existingIndex].needsReview = true;
            this.mistakes[existingIndex].reviewStreak = 0;
        } else {
            // Add new mistake
            this.mistakes.push({
                question: task.question,
                answer: task.answer,
                topic: task.topic,
                userAnswer,
                timestamp: Date.now(),
                needsReview: true,
                reviewStreak: 0
            });
        }

        this._save();
    }

    // Record review answer
    recordReviewAnswer(taskAnswer, isCorrect) {
        const mistake = this.mistakes.find(m => m.answer === taskAnswer);
        
        if (!mistake) return;

        if (isCorrect) {
            mistake.reviewStreak++;
            if (mistake.reviewStreak >= REVIEW_REQUIRED_STREAK) {
                mistake.needsReview = false;
            }
        } else {
            mistake.reviewStreak = 0;
        }

        this._save();
    }

    // Get random review task
    getRandomReviewTask(allTasks) {
        const reviewMistakes = this.getReviewMistakes();
        if (reviewMistakes.length === 0) return null;

        const randomMistake = shuffleArray(reviewMistakes)[0];
        return allTasks.find(t => t.answer === randomMistake.answer);
    }

    // Clear all mistakes
    clearAll() {
        this.mistakes = [];
        this._save();
    }

    // Clear mistakes for a specific topic
    clearTopic(topic) {
        this.mistakes = this.mistakes.filter(m => m.topic !== topic);
        this._save();
    }

    // Save mistakes to storage
    _save() {
        Storage.setMistakes(this.mistakes);
    }
}

// Export (ES6)
export { MistakeManager, REVIEW_REQUIRED_STREAK };
