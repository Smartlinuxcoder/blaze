
# 🔥 Blaze Programming Language
## Blazingly fast


Blaze is a modern programming language that transpiles to Go or can compile to machine code.


Website at [https://blaze.smart.is-a.dev](https://blaze.smart.is-a.dev)
Web IDE at [https://blaze.smart.is-a.dev/ide](https://blaze.smart.is-a.dev/ide)



## Features

- Simple syntax
- Transpiles to Go
- Built-in std lib
- Interactive web-based IDE
- Debug mode with `?` operator
- Command-line compiler

## Online IDE

Try Blaze online at [https://blaze.smart.is-a.dev/ide](https://blaze.smart.is-a.dev/ide)

Features:
- Syntax highlighting
- Real-time compilation
- Integrated terminal output
- File management
- Build and transpile options

## Installation

### From Releases

1. Download the latest release from [GitHub Actions Artifacts](https://github.com/smartlinuxcoder/blaze/actions)
2. Add the `blaze` binary to your PATH

### From Source

```bash
git clone https://github.com/smartlinuxcoder/blaze.git
cd blaze
go build
```

## CLI Usage

The Blaze compiler provides three main commands:

```bash
# Run a Blaze program
blaze run file.blz

# Build a binary
blaze build file.blz

# Transpile to Go
blaze transpile file.blz
```

## Language Basics

### Hello World
```blaze
// A simple hello world program
println("Hello, Blaze!")!
```

### Variables
```blaze
// Using arrow operator
x <- 42!
// Using let keyword
let name <- "Blaze"!
```

### Control Flow
```blaze
x <- 42!
if x > 0 [
    println("x is positive")!
] else [
    println("x is not positive")!
]
```

### HTTP Requests
```blaze
import net/http!
import io!

url <- "https://api.github.com"!
try [
    response <- http::Get(url)!
    body <- io::ReadAll(response.Body)!
    println("Status: " + response.Status)!
    println("Body: " + string(body))!
] catch err [
    println("Error: " + err.Error())!
]
```

## Syntax Highlights

- `<-` for variable assignment (similar to `:=` in Go)
- `!` at the end of each statement
- `?` for debug information
- `[]` for code blocks (instead of `{}`)
- `print()`, `println()`, and `printf()` for output
- `let` keyword for variable declarations (optional)

## Development

The project consists of two main components:

1. **CLI Compiler**: Written in Go, handles transpilation and execution
2. **Web IDE**: Built with SolidJS, interactive development environment

### Repo Structure
```
blaze/
├── compiler/        # Compiler
│   ├── main.go
│   └── transpiler.go   
├── website/         # Web IDE
│   ├── src/
│   ├── public/
│   ├── uploads/
│   └── build.sh     # Script to build the website for prod(deprecated)
├── Dockerfile       # Full docker config for the website
└── test.sh          # Checks the compiler functionality
```

## Contributing

Contributions are welcome! Please feel free to submit a PR.

## License

[GNU GPL V3](LICENSE)

## Acknowledgments

- The Go team for the goofy language
- The SolidJS team for the goofy framework
- CodeMirror for the goofy editor components

---
Built with ❤️ by [Smartlinuxcoder](https://github.com/smartlinuxcoder)
