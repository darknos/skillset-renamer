#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require("fs");
var path = require("path");


if ((argv.h || argv.help) || (!argv.file && !argv.folder) || !argv.old || !argv.new ) {
    console.error("skillset-renamer --file input_file.json  --old const.js --new const_new.js");
    process.exit(0);
}

const newConst = reverseToKeys(require(path.join(process.cwd(),argv.new)));
const oldConst = reverseToValues(require(path.join(process.cwd(),argv.old)));

const replacer = {};
Object.keys(oldConst).forEach(key => {
    replacer[key] = newConst[oldConst[key]];
});

function reverseToValues(c) {
    const n = {};
    //reverse const.js
    Object.keys(c).forEach(key => {
        Object.keys(c[key]).forEach(name => {
            n[c[key][name]] = `CONST.${key}.${name}`;
        });
    });
    return n;    
}

function reverseToKeys(c) {
    const n = {};
    //reverse const.js
    Object.keys(c).forEach(key => {
        Object.keys(c[key]).forEach(name => {
            n[`CONST.${key}.${name}`] = c[key][name];
        });
    });
    return n;    
}

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}


function processFile(file) {
    var buffer = fs.readFileSync(file);
    var content = buffer.toString();
    Object.keys(replacer).forEach(key => {
        if (key == "ai.qubo") return;
        const value = replacer[key];        
        if (value) {
            content = replaceAll(content, key, value);
        } else {
            console.warn(`skip ${key}`);
        }
    });    
    const value = replacer["ai.qubo"];
    content = replaceAll(content, "ai.qubo", value);
    return content;
    
}


if (argv.file) {
    console.log(processFile(argv.file));
}



