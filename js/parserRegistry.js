/* Parser registry for task types */

import { StressParser, ParonymParser, LeksikaParser, OrthographyParser, NnParser, NeNiParser, PunctuationParser } from './parsers.js';

// Registry mapping filenames to parsers
const PARSER_REGISTRY = {
    'stress.txt': new StressParser(),
    'paronyms.txt': new ParonymParser(),
    'leksika.txt': new LeksikaParser(),
    'orthography.txt': new OrthographyParser(),
    'nn.txt': new NnParser(),
    'ne_ni.txt': new NeNiParser(),
    'punctuation.txt': new PunctuationParser()
};

// Get parser for filename
function getParser(filename) {
    return PARSER_REGISTRY[filename] || null;
}

// Get all supported filenames
function getSupportedFiles() {
    return Object.keys(PARSER_REGISTRY);
}

// Check if file is supported
function isSupported(filename) {
    return filename in PARSER_REGISTRY;
}

// Export (ES6)
export { PARSER_REGISTRY, getParser, getSupportedFiles, isSupported };
