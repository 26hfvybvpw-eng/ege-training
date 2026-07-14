/* LocalStorage wrapper for persistence */

const STORAGE_KEYS = {
    STATISTICS: 'ege_trainer_statistics',
    MISTAKES: 'ege_trainer_mistakes',
    SETTINGS: 'ege_trainer_settings'
};

class Storage {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Statistics operations
    static getStatistics() {
        return this.get(STORAGE_KEYS.STATISTICS, {});
    }

    static setStatistics(stats) {
        return this.set(STORAGE_KEYS.STATISTICS, stats);
    }

    static updateStatistic(key, value) {
        const stats = this.getStatistics();
        stats[key] = value;
        return this.setStatistics(stats);
    }

    // Mistakes operations
    static getMistakes() {
        return this.get(STORAGE_KEYS.MISTAKES, []);
    }

    static setMistakes(mistakes) {
        return this.set(STORAGE_KEYS.MISTAKES, mistakes);
    }

    static addMistake(mistake) {
        const mistakes = this.getMistakes();
        mistakes.push(mistake);
        return this.setMistakes(mistakes);
    }

    static removeMistake(index) {
        const mistakes = this.getMistakes();
        if (index >= 0 && index < mistakes.length) {
            mistakes.splice(index, 1);
            return this.setMistakes(mistakes);
        }
        return false;
    }

    static clearMistakes() {
        return this.setMistakes([]);
    }

    // Settings operations
    static getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS, {});
    }

    static setSettings(settings) {
        return this.set(STORAGE_KEYS.SETTINGS, settings);
    }

    static updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.setSettings(settings);
    }
}

// Export for use in other modules (ES6)
export { Storage, STORAGE_KEYS };
