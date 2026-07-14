/* Statistics management module */

import { Storage } from './storage.js';

class StatisticsManager {
    constructor() {
        this.stats = Storage.getStatistics();
    }

    // Reload statistics from localStorage
    reload() {
        this.stats = Storage.getStatistics();
    }

    // Get all statistics
    getAll() {
        return this.stats;
    }

    // Get statistics for a specific topic
    getTopicStats(topic) {
        return this.stats[topic] || {
            total: 0,
            correct: 0,
            wrong: 0
        };
    }

    // Record an answer
    recordAnswer(topic, isCorrect) {
        if (!this.stats[topic]) {
            this.stats[topic] = { total: 0, correct: 0, wrong: 0 };
        }

        this.stats[topic].total++;
        if (isCorrect) {
            this.stats[topic].correct++;
        } else {
            this.stats[topic].wrong++;
        }

        this._save();
    }

    // Get total statistics across all topics
    getTotalStats() {
        const total = { total: 0, correct: 0, wrong: 0 };
        
        for (const topic in this.stats) {
            total.total += this.stats[topic].total;
            total.correct += this.stats[topic].correct;
            total.wrong += this.stats[topic].wrong;
        }

        return total;
    }

    // Get success percentage for a topic
    getTopicSuccessRate(topic) {
        const stats = this.getTopicStats(topic);
        if (stats.total === 0) return 0;
        return (stats.correct / stats.total) * 100;
    }

    // Get overall success percentage
    getOverallSuccessRate() {
        const total = this.getTotalStats();
        if (total.total === 0) return 0;
        return (total.correct / total.total) * 100;
    }

    // Reset statistics for a topic
    resetTopic(topic) {
        delete this.stats[topic];
        this._save();
    }

    // Reset all statistics
    resetAll() {
        this.stats = {};
        this._save();
    }

    // Compute session statistics from results
    static computeSessionStats(results) {
        if (!results || results.length === 0) return null;

        const total = results.length;
        const correct = results.filter(r => r.isCorrect).length;
        const wrong = total - correct;
        const successPercent = (correct / total) * 100;

        return { total, correct, wrong, successPercent };
    }

    // Save statistics to storage
    _save() {
        Storage.setStatistics(this.stats);
    }
}

// Export (ES6)
export { StatisticsManager };
