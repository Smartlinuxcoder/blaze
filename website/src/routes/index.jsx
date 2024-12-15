import { createSignal, onMount, onCleanup } from 'solid-js';
import { Split } from 'solid-split-component';
import { ErrorBoundary } from 'solid-js';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { StreamLanguage } from '@codemirror/language';
import { LanguageSupport } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { editorStyles, blazeLanguage, blazeTheme } from '~/components/editor';




function BlazeCodeEditorContent() {
  let editorRef;
  let editorView;
  let fileInputRef;

  const [output, setOutput] = createSignal('');
  const [fileName, setFileName] = createSignal('main.blz');

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

  const handleFileImport = async (event) => {
    const target = event.target;
    const file = target.files?.[0];

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        editorView.dispatch({
          changes: {
            from: 0,
            to: editorView.state.doc.length,
            insert: content
          }
        });
      };
      reader.readAsText(file);
    }
  };

  const handleCompileAndRun = async () => {
    const code = editorView?.state.doc.toString();
    if (!code) return;
    setOutput('Compiling...');
    try {
      const response = await fetch('/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileName(),
          content: code
        })
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }

      setOutput(`Running...
        `);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((prevOutput) => prevOutput + decoder.decode(value, { stream: true }));
        }
        setOutput((prevOutput) => prevOutput + '\nDone!');
      };

      await processStream();

    } catch (err) {
      setOutput(`Build error: ${err.message}`);
    }
  };

  const handleTranspile = async () => {
    const code = editorView?.state.doc.toString();
    if (!code) return;

    try {
      setOutput('Transpiling...');
      const response = await fetch('/transpile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileName(),
          content: code
        })
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);
      const blob = new Blob([new Uint8Array(result.content.data)], { type: result.type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName().split('.').slice(0, -1).join('.') + ".go";
      link.click();
      setOutput(output() + `
      Done!`);
      // Clean up the object URL
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setOutput(`Build error: ${err.message}`);
    }
  };

  const handleBuild = async () => {
    const code = editorView?.state.doc.toString();
    if (!code) return;
    setOutput('Compiling...');
    try {
      const response = await fetch('/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileName(),
          content: code
        })
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }
      setOutput(output() + `
      Done!`);
      const result = await response.json();
      console.log(result);
      const blob = new Blob([new Uint8Array(result.content.data)], { type: result.type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName().split('.').slice(0, -1).join('.');
      link.click();

      // Clean up the object URL
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setOutput(`Build error: ${err.message}`);
    }
  };
  return (
    <div class="editor-container">
      <style>{editorStyles}</style>

      {/* Input for file import (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".blz"
        style="display: none"
        onChange={handleFileImport}
      />

      {/* Top Bar */}
      <div class="toolbar h-12 flex items-center px-4 justify-between">
        <div class="flex items-center gap-4">
          <h1 class="blaze-logo text-2xl font-bold flex items-center gap-2">
            Blaze <span class="text-xl">🔥</span>
          </h1>
          <div class="flex gap-4 ml-8">
            <button class="text-sm text-gray-400 hover:text-white">File</button>
            <button class="text-sm text-gray-400 hover:text-white">Edit</button>
            <button class="text-sm text-gray-400 hover:text-white">View</button>
            <button class="text-sm text-gray-400 hover:text-white">Help</button>
          </div>
          <div class="flex items-center gap-2 ml-8">
            <button
              onClick={() => fileInputRef.click()}
              class="p-2 rounded hover:bg-[rgba(255,255,255,0.1)]"
              title="Import .blz File"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Smartlinuxcoder</span>
          <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
            S
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 flex">
        {/* Sidebar */}
        <div class="w-12 bg-[#1a1b26] border-r border-[rgba(255,255,255,0.1)] flex flex-col items-center py-4 gap-4">
          <button
            class="p-2 rounded hover:bg-[rgba(255,255,255,0.1)]"
            onClick={() => fileInputRef.click()}
            title="Import File"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
          <button class="p-2 rounded hover:bg-[rgba(255,255,255,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>

        {/* Editor and Terminal */}
        <div class="flex-1">
          <Split
            class="h-full"
            spacing={1}
            gutterSize={4}
            direction="vertical"
            sizes={[70, 30]}
          >
            {/* Editor Panel */}
            <div class="h-full flex flex-col">
              <div class="toolbar px-4 py-2 flex items-center gap-4">
                <div class="flex items-center gap-2 px-3 py-1 rounded tab-active">
                  <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span class="text-sm text-gray-200">{fileName()}</span>
                </div>
              </div>
              <div ref={editorRef} class="flex-1 overflow-hidden" />
            </div>

            {/* Terminal Panel */}
            <div class="h-full flex flex-col">
              <div class="toolbar px-4 py-2 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <button class="px-3 py-1 text-sm text-gray-200 tab-active rounded-t">Terminal</button>
                  <button class="px-3 py-1 text-sm text-gray-400 hover:text-white">Problems</button>
                  <button class="px-3 py-1 text-sm text-gray-400 hover:text-white">Output</button>
                </div>
                <div class="flex items-center gap-4">
                  <button
                    class="text-sm px-4 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white transition"
                    onClick={handleCompileAndRun}
                  >
                    Compile & Run
                  </button>
                  <button
                    class="text-sm px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                    onClick={handleTranspile}
                  >
                    Transpile
                  </button>
                  <button
                    class="text-sm px-4 py-1 rounded bg-green-600 hover:bg-green-700 text-white transition"
                    onClick={handleBuild}
                  >
                    Build
                  </button>
                </div>
              </div>
              <pre class="terminal flex-1 p-4 overflow-auto text-sm font-mono text-gray-400">
                {output()}
              </pre>
            </div>
          </Split>
        </div>
      </div>

      {/* Status Bar */}
      <div class="toolbar h-6 flex items-center px-4 justify-between text-xs text-gray-400">
        <div class="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Blaze</span>
          <span>Ln 1, Col 1</span>
        </div>
        <div class="flex items-center gap-4">
          <span>{new Date().toLocaleTimeString()}</span>
          <span>v1.0.0</span>
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