#!/usr/bin/env bash

dist=../dist
[ -d ${dist} ] || mkdir ${dist}

if [ ! -f "${dist}/main.proto" ];then
    echo "">${dist}/main.proto
fi
node ../src/index.js -o ${dist}/main.proto ./proto