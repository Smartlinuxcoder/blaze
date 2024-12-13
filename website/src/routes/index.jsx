import { createSignal, onMount, onCleanup } from 'solid-js';
import { ErrorBoundary } from 'solid-js';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { StreamLanguage } from '@codemirror/language';
import { LanguageSupport } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';

// goofball lang spec
const blazeLanguage = StreamLanguage.define({
  name: "blaze",
  
  startState() {
    return {
      inString: false,
      inComment: false,
      bracketDepth: 0
    };
  },

  token(stream, state) {
    // nested brackets
    if (stream.peek() === '[') {
      state.bracketDepth++;
    } else if (stream.peek() === ']') {
      state.bracketDepth--;
    }

    // Comments
    if (!state.inString && stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    // strings
    if (!state.inString && stream.match('"')) {
      state.inString = true;
      return "string";
    }
    if (state.inString) {
      if (stream.match(/\\./)) return "string-2";
      if (stream.match('"')) {
        state.inString = false;
        return "string";
      }
      stream.next();
      return "string";
    }

    // Keywords
    if (stream.match(/\b(import|try|catch|if|println)\b/)) {
      return "keyword";
    }

    // popular pkgs
    if (stream.match(/\b(net\/http|io)\b/)) {
      return "variable-2";
    }

    // Functions
    if (stream.match(/\b\w+(?=::)/)) {
      return "function";
    }

    // operators
    if (stream.match(/(<-|::)|[<>]=?|[!=]=?=?|&&|\|\||[\+\-\*\/]=?/)) {
      return "operator";
    }

    // Punctuation
    if (stream.match(/[[\](){}!,;]/)) {
      return "punctuation";
    }

    stream.next();
    return null;
  }
});

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
  ".cm-comment": { color: "#6a9955" },
  ".cm-string": { color: "#ce9178" },
  ".cm-keyword": { color: "#569cd6" },
  ".cm-function": { color: "#dcdcaa" },
  ".cm-variable-2": { color: "#4ec9b0" },
  ".cm-operator": { color: "#d4d4d4" },
  ".cm-punctuation": { color: "#d4d4d4" }
});

function BlazeCodeEditorContent() {
  let editorRef;
  let editorView;

  const [output, setOutput] = createSignal('');

  const initialCode = `import net/http!
import io!
url <- "http://letsgosky.social"!
try [
    // this is a comment, this gets sent to the transpiled version too
    response <- http::Get(url)!
    body <- io::ReadAll(response.Body)!
    println("Response Status: " + response.Status)!
    println("Response Body: " + string(body))!
] catch err [
    println("Error: " + err.Error())!
]
x <- 1!
if x == 1 [
    println("hi")!
]`;

  onMount(() => {
    const startState = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        new LanguageSupport(blazeLanguage),
        blazeTheme,
        oneDark,
        EditorView.lineWrapping,
      ],
    });

    editorView = new EditorView({
      state: startState,
      parent: editorRef
    });

    onCleanup(() => {
      if (editorView) {
        editorView.destroy();
      }
    });
  });

  const handleCompile = () => {
    try {
      const code = editorView?.state.doc.toString();
      if (!code) return;
      setOutput('Compilation successful!');
    } catch (err) {
      setOutput(`Compilation error: ${err.message}`);
    }
  };

  const handleRun = () => {
    try {
      const code = editorView?.state.doc.toString();
      if (!code) return;
      setOutput('Running code');
    } catch (err) {
      setOutput(`Runtime error: ${err.message}`);
    }
  };

  const handleTranspile = () => {
    try {
      const code = editorView?.state.doc.toString();
      if (!code) return;
      setOutput('Transpilating');
    } catch (err) {
      setOutput(`Transpilation error: ${err.message}`);
    }
  };

  return (
    <div class="min-h-screen bg-ctp-base text-ctp-text p-8 font-ubuntu">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-6xl font-bold text-center mb-8 text-ctp-peach drop-shadow-lg">
          Blaze 🔥
        </h1>

        <div class="bg-ctp-mantle shadow-xl rounded-lg overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Code Editor */}
            <div class="bg-ctp-surface0 rounded-lg p-4">
              <div class="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 mr-2 text-ctp-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <h2 class="text-xl font-semibold text-ctp-text">Code Editor</h2>
              </div>
              <div ref={editorRef} class="border rounded-lg overflow-hidden" />
            </div>

            {/* Terminal/Output */}
            <div class="bg-ctp-surface0 rounded-lg p-4">
              <div class="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 mr-2 text-ctp-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <h2 class="text-xl font-semibold text-ctp-text">Output</h2>
              </div>
              <pre class="w-full h-[500px] overflow-auto bg-ctp-base text-ctp-green p-4 rounded font-mono text-sm">
                {output()}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div class="bg-ctp-surface1 p-4 flex justify-center space-x-4">
            <button
              onClick={handleCompile}
              class="flex items-center bg-ctp-blue text-ctp-base px-4 py-2 rounded hover:opacity-90 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Compile
            </button>
            <button
              onClick={handleRun}
              class="flex items-center bg-ctp-green text-ctp-base px-4 py-2 rounded hover:opacity-90 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
              Run
            </button>
            <button
              onClick={handleTranspile}
              class="flex items-center bg-ctp-yellow text-ctp-base px-4 py-2 rounded hover:opacity-90 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m2 0a8 8 0 10-16 0 8 8 0 0016 0z"
                />
              </svg>
              Transpile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with error boundary
export default function BlazeCodeEditor() {
  return (
    <ErrorBoundary fallback={err => <div class="text-red-500">Error: {err.message}</div>}>
      <BlazeCodeEditorContent />
    </ErrorBoundary>
  );
}