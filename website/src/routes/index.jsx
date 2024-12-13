import { createSignal } from 'solid-js';
import { Highlight, themes } from 'solid-highlight';

export default function BlazeCodeEditor() {
  const [code, setCode] = createSignal(`import net/http!
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
]`);

  const [output, setOutput] = createSignal('');

  const handleCompile = () => {
    setOutput('Compilation successful! No errors detected.');
  };

  const handleRun = () => {
    setOutput('Running code...\nOutput: hi\nResponse Status: 200 OK');
  };

  const handleTranspile = () => {
    setOutput('Transpilation complete. Generated JavaScript/target language code.');
  };

  return (
    <div class="min-h-screen bg-ctp-base text-ctp-text p-8 font-ubuntu">
      <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      <div class="max-w-4xl mx-auto">
        <h1 class="text-6xl font-bold text-center mb-8 text-ctp-peach drop-shadow-lg font-ubuntu">
          Blaze 🔥
        </h1>

        <div class="bg-ctp-mantle shadow-xl rounded-lg overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Code Editor */}
            <div class="bg-ctp-surface0 rounded-lg p-4">
              <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-ctp-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h2 class="text-xl font-semibold text-ctp-text font-ubuntu">Code Editor</h2>
              </div>
              <div class="relative h-[500px]">
                <Highlight
                  code={code()}
                  language="javascript"
                  class="rounded-lg h-full"
                />
                <textarea
                  class="absolute top-0 left-0 w-full h-full bg-transparent text-ctp-text caret-ctp-text font-mono text-sm resize-none p-2 outline-none font-ubuntu"
                  value={code()}
                  onInput={(e) => setCode(e.currentTarget.value)}
                  spellcheck="false"
                />
              </div>
            </div>

            {/* Terminal/Output */}
            <div class="bg-ctp-surface0 rounded-lg p-4">
              <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-ctp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h2 class="text-xl font-semibold text-ctp-text font-ubuntu">Output</h2>
              </div>
              <pre class="w-full h-64 overflow-auto bg-ctp-base text-ctp-green p-2 rounded font-mono text-sm font-ubuntu">
                {output()}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div class="bg-ctp-surface1 p-4 flex justify-center space-x-4">
            <button
              onClick={handleCompile}
              class="flex items-center bg-ctp-blue text-ctp-base px-4 py-2 rounded hover:opacity-90 transition font-ubuntu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-lienjoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Compile
            </button>
            <button
              onClick={handleRun}
              class="flex items-center bg-ctp-green text-ctp-base px-4 py-2 rounded hover:opacity-90 transition font-ubuntu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run
            </button>
            <button
              onClick={handleTranspile}
              class="flex items-center bg-ctp-mauve text-ctp-base px-4 py-2 rounded hover:opacity-90 transition font-ubuntu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Transpile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};