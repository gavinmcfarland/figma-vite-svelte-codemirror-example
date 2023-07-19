<script>
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";
  import Counter from "./lib/Counter.svelte";
  import { onMount } from "svelte";
  import CodeMirror from "./components/CodeMirror.svelte";
  import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";

  import { autocompletion, completeFromList } from "@codemirror/autocomplete";
  import { defaultKeymap } from "@codemirror/commands";

  import { EditorState } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import tsEnv from "./tsserver";

  let startState = EditorState.create({
    doc: "",
    extensions: [
      EditorView.updateListener.of(async (update) => {
        const newContent = update.state.doc.sliceString(0);
        if (update.docChanged && newContent) {
          (await tsEnv).updateFile("code.ts", newContent);
        }
      }),
      autocompletion({
        override: [
          async (context) => {
            const { pos } = context;
            const completions = (
              await tsEnv
            ).languageService.getCompletionsAtPosition("code.ts", pos, {});
            if (!completions) {
              console.log("Unable to get completions", { pos });
              return null;
            }
            return completeFromList(
              completions.entries.map((c, i) => {
                console.log(c);
                return {
                  type: c.kind,
                  label: c.name,
                  boost: 1 / Number(c.sortText),
                  apply: (function () {
                    if (c.kind === "function" || c.kind === "method") {
                      return `${c.name}()`;
                    }
                  })(),
                };
              })
            )(context);
          },
        ],
      }),
      keymap.of(defaultKeymap),
    ],
  });

  let dom;

  onMount(() => {
    let view = new EditorView({
      state: startState,
      parent: dom,
    });
  });
</script>

<main>
  {@html svelteLogo}

  <div class="codemirror">
    <CodeMirror
      lang={javascript()}
      extensions={[
        EditorView.updateListener.of(async (update) => {
          const newContent = update.state.doc.sliceString(0);
          if (update.docChanged && newContent) {
            (await tsEnv).updateFile("code.ts", newContent);
          }
        }),
        autocompletion({
          override: [
            async (context) => {
              const { pos } = context;
              const completions = (
                await tsEnv
              ).languageService.getCompletionsAtPosition("code.ts", pos, {});
              if (!completions) {
                console.log("Unable to get completions", { pos });
                return null;
              }
              return completeFromList(
                completions.entries.map((c, i) => {
                  console.log(c);
                  return {
                    type: c.kind,
                    label: c.name,
                    boost: 1 / Number(c.sortText),
                    apply: (function () {
                      if (c.kind === "function" || c.kind === "method") {
                        return `${c.name}()`;
                      }
                    })(),
                  };
                })
              )(context);
            },
          ],
        }),
        keymap.of(defaultKeymap),
      ]}
    />
  </div>
  <div class="editor" bind:this={dom} />

  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
  .codemirror {
    text-align: left;
  }
  .editor {
    text-align: left;
    border: 1px solid var(--figma-color-border);
  }
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
