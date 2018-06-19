"use strict";
const fs = require("fs");
const path = require("path");
const utils = require('./utils');
const app = require('commander');

//去重,只计算以(message|enum)开头的
const unique = arr => {
    let res = [],
        json = {},
        reg = /^(message|enum)\s+.*\{((\r|\n)|(\r\n))/mg,
        matched = null;
    for (let i = 0; i < arr.length; i++) {
        matched = arr[i].match(reg);
        if (matched && matched.length > 0) {
            if (!json[matched[0]]) {
                res.push(arr[i]);
                json[matched[0]] = 1;
            }
        } else {
            continue;
        }
    }
    //去掉空的
    res.filter(item => item !== '');
    return res;
};

/**
 *
 * @param folder
 * @param outFile
 */
const merge = (folder, outFile) => utils.concat(folder).then(result => {

    //去掉注释的
    result = result.replace(/((\/\*[\s\S]*?\*\/)|(\/\/.*$))/mg, '');

    //去掉package开头的
    result = result.replace(/package\s+\b.+\b;((\r|\n)|(\r\n))/g, '');

    //去掉java_package的
    result = result.replace(/option\s+java_package\s+=\s+".+";((\r|\n)|(\r\n))/g, '');

    //java_outer_classname
    result = result.replace(/option\s+java_outer_classname\s+=\s+".+";((\r|\n)|(\r\n))/g, '');

    result = result.replace(/import\s+".+";((\r|\n)|(\r\n))/g, '');

    //去除空行
    result = result.replace(/^\s*((\r|\n)|(\r\n))+/mg, '\n');
    result = result.replace(/^\s*((\r|\n)|(\r\n))/g, '');

    //以}打开为数组
    let lineArr = result.split(/^\}\r?\n?/mg);

    // 去掉相同的
    lineArr = unique(lineArr);

    result = lineArr.join('}\n');

    //最后一个加个}
    result = result + '}\n';

    utils.write(outFile, result).then(res => {
        console.log(`生成文件${outFile}成功`);
    }).catch(err => console.log(err));

});

app.version('1.0.0')
    .option('-o, --output <file>', 'output file')
    .description('proto合并');
app.parse(process.argv);
let err = (err) => console.log(err);
let output = (o) => {
    if (!app.output) {
        console.log(o);
    }
};
if (app.args.length) {
    merge(app.args, app.output).then(output).catch(err);
}
else
    throw new Error('no files specified');


