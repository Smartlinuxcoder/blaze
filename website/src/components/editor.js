import { StreamLanguage } from '@codemirror/language';
import { EditorView } from '@codemirror/view';

export const editorStyles = /*css*/ `
  .editor-container {
    background: linear-gradient(135deg, #1a1b26 0%, #24283b 100%);
    min-height: 100vh;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }
  
  .blaze-logo {
    background: linear-gradient(90deg, #ff9e64 0%, #f7768e 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .panel {
    background: rgba(26, 27, 38, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .gutter {
    background: rgba(255, 255, 255, 0.1);
    cursor: col-resize;
  }
  
  .gutter:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .terminal {
    background: linear-gradient(180deg, #1a1b26 0%, #1f2335 100%);
    font-family: 'JetBrains Mono', monospace;
  }
  
  .toolbar {
    background: linear-gradient(90deg, rgba(26, 27, 38, 0.9) 0%, rgba(36, 40, 59, 0.9) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tab-active {
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 2px solid #ff9e64;
  }
`;

// goofball lang spec
export const blazeLanguage = StreamLanguage.define({
    name: "blaze",

    startState() {
        return {
            inString: false,
            inComment: false,
            bracketDepth: 0,
            inImport: false
        };
    },

    token(stream, state) {
        if (stream.eatSpace()) return null;

        if (!state.inString && stream.match("//")) {
            stream.skipToEnd();
            return "comment";
        }

        if (!state.inString && stream.match('"')) {
            state.inString = true;
            return "string";
        }
        if (state.inString) {
            let ch = stream.next();
            if (ch === '\\') {
                stream.next();
                return "string-2"; // escaped characters
            }
            if (ch === '"') {
                state.inString = false;
            }
            return "string";
        }

        // blocks
        if (stream.peek() === '[' || stream.peek() === '{') {
            state.bracketDepth++;
            stream.next();
            return "bracket";
        }
        if (stream.peek() === ']' || stream.peek() === '}') {
            state.bracketDepth--;
            stream.next();
            return "bracket";
        }

        //line endings (! and ?)
        if (stream.match(/[!?]$/)) {
            return "meta";
        }

        if (stream.match(/\b(try|catch|let|if|else|func|return)\b/)) {
            return "keyword";
        }

        if (stream.match(/\b(print|println|printf)\b(?=\()/)) {
            return "builtin";
        }

        // <- (assignment) and :: (method access)
        if (stream.match(/(<-|::)|[<>]=?|[!=]=?|&&|\|\||[\+\-\*\/]=?/)) {
            return "operator";
        }

        if (stream.match(/\bimport\b/)) {
            state.inImport = true;
            return "keyword";
        }

        if (state.inImport && stream.match(/[\w\/]+(?=[!\s])/)) {
            state.inImport = false;
            return "string";
        }

        if (stream.match(/\b\w+(?=::)/)) {
            return "variable-2";
        }
        if (stream.match(/\b\w+(?=\()/)) {
            return "function";
        }

        if (stream.match(/\b[a-zA-Z_]\w*(?=\s*<-)/)) {
            return "def";
        }

        if (stream.match(/\b\d+\.?\d*\b/)) {
            return "number";
        }

        if (stream.match(/\b[a-zA-Z_]\w*\b/)) {
            return "variable";
        }

        if (stream.match(/[(),;]/)) {
            return "punctuation";
        }

        stream.next();
        return null;
    }
});

export
    // Themes
    const blazeTheme = EditorView.theme({
        "&": {
            backgroundColor: "#1e1e2e !important",
            height: "500px"
        },
        ".cm-content": {
            fontFamily: "monospace",
            fontSize: "14px"
        },
        ".cm-line": {
            padding: "0 8px"
        },
        //  cooolors
        ".cm-comment": { color: "#6a9955" },
        ".cm-string": { color: "#ce9178" },
        ".cm-string-2": { color: "#d7ba7d" },
        ".cm-keyword": { color: "#569cd6" },
        ".cm-builtin": { color: "#dcdcaa" },
        ".cm-function": { color: "#dcdcaa" },
        ".cm-variable": { color: "#9cdcfe" },
        ".cm-variable-2": { color: "#4ec9b0" },
        ".cm-def": { color: "#4fc1ff" },
        ".cm-number": { color: "#b5cea8" },
        ".cm-operator": { color: "#d4d4d4" },
        ".cm-punctuation": { color: "#d4d4d4" },
        ".cm-bracket": { color: "#ffd700" },
        ".cm-meta": { color: "#d4d4d4" }
    });