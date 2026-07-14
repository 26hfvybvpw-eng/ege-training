/* Task parsers for different file formats */

// Base parser class
class TaskParser {
    constructor() {
        if (new.target === TaskParser) {
            throw new Error('TaskParser is abstract and cannot be instantiated directly');
        }
    }

    get topic() {
        throw new Error('topic property must be implemented');
    }

    parseLine(line, lineNumber, filename) {
        throw new Error('parseLine method must be implemented');
    }

    parseFile(content, filename) {
        const lines = content.split('\n');
        const tasks = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const task = this.parseLine(line, i + 1, filename);
            if (task) {
                tasks.push(task);
            }
        }
        
        return tasks;
    }
}

// Stress parser for stress.txt
class StressParser extends TaskParser {
    get topic() {
        return 'ударения';
    }

    parseLine(line, lineNumber, filename) {
        const stressCount = this._countStressLetters(line);
        
        if (stressCount !== 1) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (нужна ровно одна ударная буква).`);
            return null;
        }

        const displayWord = this._stressWordDisplay(line);
        if (!displayWord) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (невозможно отобразить слово).`);
            return null;
        }

        return {
            question: `Куда падает ударение в слове «${displayWord}»?`,
            answer: line,
            topic: this.topic
        };
    }

    _countStressLetters(word) {
        return (word.match(/[A-ZА-ЯЁ]/g) || []).length;
    }

    _stressWordDisplay(word) {
        return word.replace(/[A-ZА-ЯЁ]/g, (match) => match.toLowerCase());
    }
}

// Pipe-delimited parser for question|answer format
class PipeDelimitedParser extends TaskParser {
    parseLine(line, lineNumber, filename) {
        if (!line.includes('|')) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (ожидается формат вопрос|ответ).`);
            return null;
        }

        const [question, answer] = line.split('|').map(part => part.trim());

        if (!question) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (пустой вопрос).`);
            return null;
        }

        if (!answer) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущен ответ.`);
            return null;
        }

        return {
            question,
            answer,
            topic: this.topic
        };
    }
}

// Orthography parser (uses pipe-delimited format)
class OrthographyParser extends PipeDelimitedParser {
    get topic() {
        return 'орфография';
    }
}

// NN parser (uses pipe-delimited format)
class NnParser extends PipeDelimitedParser {
    get topic() {
        return 'нн';
    }
}

// Punctuation parser (uses pipe-delimited format)
class PunctuationParser extends PipeDelimitedParser {
    get topic() {
        return 'пунктуация';
    }
}

// Paronym parser for question|answer1|answer2|... format
class ParonymParser extends TaskParser {
    get topic() {
        return 'паронимы';
    }

    parseLine(line, lineNumber, filename) {
        if (!line.includes('|')) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (ожидается формат вопрос|ответ1|ответ2|...).`);
            return null;
        }

        const parts = line.split('|').map(part => part.trim());
        const question = parts[0];
        const correctAnswers = parts.slice(1);

        if (!question) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (пустой вопрос).`);
            return null;
        }

        if (correctAnswers.length === 0) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (нужен хотя бы один правильный ответ).`);
            return null;
        }

        return {
            question,
            answer: correctAnswers.join('|'),
            correctAnswers,
            topic: this.topic
        };
    }
}

// Leksika parser (same format as paronyms)
class LeksikaParser extends TaskParser {
    get topic() {
        return 'лексика';
    }

    parseLine(line, lineNumber, filename) {
        if (!line.includes('|')) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (ожидается формат вопрос|ответ1|ответ2|...).`);
            return null;
        }

        const parts = line.split('|').map(part => part.trim());
        const question = parts[0];
        const correctAnswers = parts.slice(1);

        if (!question) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (пустой вопрос).`);
            return null;
        }

        if (correctAnswers.length === 0) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (нужен хотя бы один правильный ответ).`);
            return null;
        }

        return {
            question,
            answer: correctAnswers.join('|'),
            correctAnswers,
            topic: this.topic
        };
    }
}

// NE/NI parser for sentence|answer (слитно/раздельно) format
class NeNiParser extends TaskParser {
    get topic() {
        return 'не/ни';
    }

    parseLine(line, lineNumber, filename) {
        if (!line.includes('|')) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (ожидается формат предложение|ответ).`);
            return null;
        }

        const [sentence, answer] = line.split('|').map(part => part.trim());

        if (!sentence) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущено (пустое предложение).`);
            return null;
        }

        if (!answer) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — пропущен ответ.`);
            return null;
        }

        const canonicalAnswer = this._normalizeAnswer(answer);
        if (!['слитно', 'раздельно'].includes(canonicalAnswer)) {
            console.warn(`${filename}, строка ${lineNumber}: «${line}» — ответ должен быть «слитно» или «раздельно».`);
            return null;
        }

        return {
            question: sentence,
            answer: canonicalAnswer,
            topic: this.topic
        };
    }

    _normalizeAnswer(answer) {
        const normalized = answer.toLowerCase().trim();
        if (['слит', 'слитно'].includes(normalized)) return 'слитно';
        if (['разд', 'раздельно'].includes(normalized)) return 'раздельно';
        return normalized;
    }
}

// Export parsers (ES6)
export {
    TaskParser,
    StressParser,
    PipeDelimitedParser,
    OrthographyParser,
    NnParser,
    PunctuationParser,
    ParonymParser,
    LeksikaParser,
    NeNiParser
};
