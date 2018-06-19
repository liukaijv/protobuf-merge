"use strict";
const fs = require("fs");
const path = require("path");
const isFile = (f) => fs.statSync(f).isFile();

const write = (fName, str) => new Promise((res, rej) => {
    fs.writeFile(path.resolve(fName), str, (err) => {
        if (err)
            return rej(err);
        return res(str);
    });
});

const readFolder = (folder) => new Promise((res, rej) => {
    fs.readdir(path.resolve(folder), (err, files) => {
        if (err)
            rej(err);
        const fileList = files.map(f => path.join(folder, f));
        res(fileList.filter(isFile));
    });
});

const read = (fName) => new Promise((res, rej) => {
    fs.readFile(path.resolve(fName), (err, str) => {
        if (err)
            rej(err);
        res(str);
    });
});

const concatFiles = (files) => new Promise((res, rej) => {
    return Promise.all(files.map(read))
        .then(src => res(src.join('\n')))
        .catch(rej);
});

/**
 *
 * @param folder
 * @param outFile
 */
const concat = (folder, outFile) => new Promise((res, rej) => {
    let concatenated;
    if (typeof folder === 'string') {
        concatenated = readFolder(folder)
            .then(concatFiles);
    }
    //命令行过来一个参数并且是目录时处理
    else if (Array.isArray(folder) && folder.length === 1 && !isFile(folder[0])) {
        concatenated = readFolder(folder[0])
            .then(concatFiles);
    }
    else {
        concatenated = concatFiles(folder);
    }
    if (outFile) {
        concatenated.then((out) => write(outFile, out)
            .then(res)
            .catch(rej)).catch(rej);
    }
    else {
        concatenated.then(res).catch(rej);
    }
});

module.exports = {
    write,
    readFolder,
    read,
    concatFiles,
    concat
};