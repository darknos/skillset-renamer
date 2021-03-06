#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require("fs");
var path = require("path");
var glob = require("glob")
 

if ((argv.h || argv.help) || (!argv.file && !argv.folder) || !argv.old || !argv.new ) {
    console.error("skillset-renamer --file input_file.json  --old const.js --new const_new.js");
    console.error("skillset-renamer --folder sources/*.json --output ./results/  --old const.js --new const_new.js");
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
            if (content.indexOf(key) > -1) {
                console.warn(key, " -> ", value);
                content = replaceAll(content, key, value);
            } else {
                console.warn(`skip ${key}`);    
            }
        } else {
            console.warn(`skip ${key}`);
        }
    });    
    const key = "ai.qubo";
    const value = replacer[key];
    if (value) {
        if (content.indexOf(key) > -1) {
            console.warn(key, " -> ", value);
            content = replaceAll(content, key, value);
        } else {
            console.warn(`skip ${key}`);    
        }
    } else {
        console.warn(`skip ${key}`);
    }
return content;
    
}


if (argv.file) {
    console.log(processFile(argv.file));
}

if (argv.folder) {
    // options is optional
    var files = glob.sync(argv.folder, {cwd: process.cwd()});
    for (let file of files) {
        let content = processFile(file);
        let fname = path.join(process.cwd(),argv.output, file);
        console.log("Write new file: ", fname);
        fs.writeFileSync(fname, content);
    }
}



