const cacheContainer = './dist/.cache';
const cacheFilePath = `${cacheContainer}/minify.json`;
const nameCachePath = `${cacheContainer}/minify.names.json`;
// Ignore patterns for files or directories
const ignoreList = [
    '**/node_modules/**', // Ignore node_modules directory
    '**/.cache/**', // Ignore cache directory
    '**/*.ignore.js' // Example: Ignore files with '.ignore.js' extension
];

const config = require('./uglify.json');

const find = require('find');
const path = require('path');
const fs = require('fs');
const { minify: jsMinify } = require('terser');
const jsonMinify = require('jsonminify');

if (!fs.existsSync(cacheContainer)) {
    fs.mkdirSync(cacheContainer, true);
}

// Load or initialize the nameCache
let nameCache = {};
if (fs.existsSync(nameCachePath)) {
    try {
        nameCache = JSON.parse(fs.readFileSync(nameCachePath, 'utf8'));
    } catch (error) {
        console.error(`Error loading nameCache: ${error}`);
        return;
    }
}

// Function to minify a file and update the cache
async function minifyFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    let result;

    // Minify JavaScript files
    if (filePath.endsWith('.js')) {
        result = await jsMinify(fileContent, { ...config, nameCache: nameCache });
    }
    // Minify JSON files
    else if (filePath.endsWith('.json')) {
        result = { code: jsonMinify(fileContent) };
    }
    // Skip other file types
    else {
        console.log(`Skipped minification for unsupported file type: ${filePath}`);
        return;
    }

    if (result.error) {
        console.error(`Error minifying ${filePath}: ${result.error}`);
        return;
    }

    // Save the minified content to the output file
    fs.writeFileSync(filePath, result.code, 'utf8');

    console.log(`Successfully Minified: ${filePath}`);
}

// Find JavaScript and JSON files in the ./dist directory, excluding the ignore list
const files = find.fileSync(/\.(js|json)$/, './dist').filter((file) => {
    return !ignoreList.some((pattern) => require('minimatch')(file, pattern));
});

// Minify each file
(async () => {
    for (let file of files) {
        await minifyFile(file);
    }

    // Save the updated nameCache
    fs.writeFileSync(nameCachePath, JSON.stringify(nameCache, null, 2), 'utf8');
})();
