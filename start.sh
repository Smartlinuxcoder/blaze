#!/usr/bin/env bash


echo "Compiling compiler"

cd compiler
go build
cd ..

echo "Copying compiler to website"
mv compiler/blaze ./website/blaze

echo "Starting server"
cd website

bun run dev
