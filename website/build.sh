#!/usr/bin/env bash


echo "Compiling compiler"
cd ..

cd compiler
go build
cd ..

echo "Copying compiler to website"
mv compiler/blaze ./website/blaze

echo "installing dependencies"
cd website
deno install
