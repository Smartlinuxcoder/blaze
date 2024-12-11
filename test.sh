#!/usr/bin/env bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed (Exit code: $1)${NC}"
        exit $1
    fi
}

echo "Building compiler..."
go build main.go transpiler.go
check_status $?

mkdir -p ./computed
mv ./main ./computed/compiler
cp *.blaze ./computed/

cd computed || exit 1

rm -rf ./john

echo "Transpiling..."
./compiler transpile john.blaze
check_status $?

echo "Compiling..."
./compiler build john.blaze
check_status $?

echo "Running v1..."
./compiler run john.blaze
check_status $?

echo "Running v2..."
./john
check_status $?