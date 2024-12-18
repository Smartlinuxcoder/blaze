import { createSignal } from 'solid-js';
import { Split } from 'solid-split-component';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { blazeLanguage, blazeTheme } from '~/components/editor';
import { LanguageSupport } from '@codemirror/language';
import { onMount, onCleanup } from 'solid-js';
function InteractiveCode(props) {
  let editorRef;
  let editorView;
  const [output, setOutput] = createSignal('');

  onMount(() => {
    const startState = EditorState.create({
      doc: props.code,
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

  const handleRun = async () => {
    const code = editorView?.state.doc.toString();
    if (!code) return;
    
    setOutput('Running...');
    try {
      const response = await fetch('/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: 'example.blz',
          content: code
        })
      });

      if (!response.ok) {
        throw new Error(`Run failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  return (
    <div class="my-4 border border-[#313244] rounded-lg overflow-hidden">
      <div class="bg-[#181825] p-4">
        <div ref={editorRef} class="mb-4" />
        <div class="flex justify-between items-center">
          <button
            onClick={handleRun}
            class="px-4 py-2 bg-[#89b4fa] text-[#1e1e2e] rounded hover:bg-[#74c7ec] transition"
          >
            Run
          </button>
          {props.explanation && (
            <span class="text-[#cdd6f4] text-sm">{props.explanation}</span>
          )}
        </div>
      </div>
      {output() && (
        <div class="bg-[#11111b] p-4 border-t border-[#313244]">
          <pre class="text-[#cdd6f4] text-sm">{output()}</pre>
        </div>
      )}
    </div>
  );
}

function AboutPage() {
  const simpleExample = `// A simple hello world program
println("Hello, Blaze!")!`;

  const variableExample = `// Variable assignment examples
// example with <- operator
x <- 42!
// you can use let too!
let name = "Blaze"!
println(x)!
println(name)!`;

  const controlFlowExample = `// Control flow example
x <- 42!
if x > 0 [
    println("x is positive")!
] else [
    println("x is not positive")!
]`;

  const httpExample = `// HTTP request example
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
]`;

  return (
    <div class="min-h-screen bg-[#1e1e2e]">
      {/* Navigation Sidebar */}
      <nav class="fixed w-64 h-full bg-[#181825] border-r border-[#313244] overflow-y-auto">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-[#f5e0dc] mb-6">Blaze Book</h1>
          <ul class="space-y-4">
            <li>
              <a href="#introduction" class="text-[#89b4fa] hover:text-[#74c7ec]">
                1. Introduction
              </a>
            </li>
            <li>
              <a href="#getting-started" class="text-[#89b4fa] hover:text-[#74c7ec]">
                2. Getting Started
              </a>
            </li>
            <li>
              <a href="#basic-concepts" class="text-[#89b4fa] hover:text-[#74c7ec]">
                3. Basic Concepts
              </a>
              <ul class="ml-4 mt-2 space-y-2">
                <li>
                  <a href="#variables" class="text-[#cdd6f4] hover:text-[#89b4fa]">
                    3.1. Variables
                  </a>
                </li>
                <li>
                  <a href="#control-flow" class="text-[#cdd6f4] hover:text-[#89b4fa]">
                    3.2. Control Flow
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#standard-library" class="text-[#89b4fa] hover:text-[#74c7ec]">
                4. Standard Library
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main class="ml-64 p-8">
        <div class="max-w-4xl mx-auto">
          <section id="introduction" class="mb-12">
            <h1 class="text-4xl font-bold text-[#f5e0dc]">
              Introduction to Blaze 🔥
            </h1>
            <p class="text-[#cdd6f4] mb-6 text-2xl">
              Blazingly fast.
            </p>
            <p class="text-[#cdd6f4] mb-6">
              Blaze is a modern programming language that is supposed to be powerful and fast but without sacrificing readability.
            </p>
            <InteractiveCode 
              code={simpleExample}
              explanation="Try running this Hello World program!"
            />
          </section>

          <section id="basic-concepts" class="mb-12">
            <h2 class="text-3xl font-semibold text-[#f5c2e7] mb-6">Basic Concepts</h2>
            
            <section id="variables" class="mb-8">
              <h3 class="text-2xl font-medium text-[#89b4fa] mb-4">Variables</h3>
              <p class="text-[#cdd6f4] mb-4">
                In Blaze, variables can be declared using either the arrow operator (<code class="bg-[#313244] px-2 py-1 rounded">&lt;-</code>) 
                or the <code class="bg-[#313244] px-2 py-1 rounded">let</code> keyword:
              </p>
              <InteractiveCode 
                code={variableExample}
                explanation="Run to see how variable declaration works"
              />
            </section>

            <section id="control-flow" class="mb-8">
              <h3 class="text-2xl font-medium text-[#89b4fa] mb-4">Control Flow</h3>
              <p class="text-[#cdd6f4] mb-4">
                Blaze uses square brackets <code class="bg-[#313244] px-2 py-1 rounded">[]</code> for code blocks:
              </p>
              <InteractiveCode 
                code={controlFlowExample}
                explanation="Try this control flow example"
              />
            </section>
          </section>

          <section id="standard-library" class="mb-12">
            <h2 class="text-3xl font-semibold text-[#f5c2e7] mb-6">Standard Library</h2>
            <p class="text-[#cdd6f4] mb-4">
              Blaze comes with a powerful standard library. Here's an example using the HTTP client:
            </p>
            <InteractiveCode 
              code={httpExample}
              explanation="Make an HTTP request to GitHub's API"
            />
            <p class="text-[#cdd6f4] mb-4">
              You can use every library from Golang's standard library with no configuration needed.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AboutPage;