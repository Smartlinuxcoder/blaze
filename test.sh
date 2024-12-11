# /usr/bin/bash

go build main.go transpiler.go

mv ./main ./computed/compiler

cp *.blaze ./computed

cd computed

echo "transpiling"
./compiler transpile john.blaze
echo "compiling"
./compiler build john.blaze
echo "running v1"
./compiler run john.blaze
echo "running v2"
./john