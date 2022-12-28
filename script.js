(function () {
'use strict';

class FileUtil {
  #handle = null;

  async openByPicker (options = {}) {
    const [handle] = await window.showOpenFilePicker(options);
    if (!handle) return;
    this.#handle = handle;
    const file = await handle.getFile();
    const text = await file.text();
    return text;
  }

  async openByDrop (transfer) {
    const [item] = transfer.items;
    if (item.kind !== 'file') return;
    const handle = await item.getAsFileSystemHandle();
    if (!handle) return;
    this.#handle = handle;
    const file = await handle.getFile();
    const text = await file.text();
    return text;
  }

  async write (text) {
    const handle = this.#handle;
    if (!handle) return;
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
  }
}

const openButton = document.querySelector('#open_button');
const saveButton = document.querySelector('#save_button');
const changeStyle = document.querySelector('#change_style');
const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');

const styles = ['a11y-dark.min.css', 'a11y-light.min.css', 'agate.min.css', 'an-old-hope.min.css', 'androidstudio.min.css', 'arduino-light.min.css', 'arta.min.css', 'ascetic.min.css', 'atom-one-dark-reasonable.min.css', 'atom-one-dark.min.css', 'atom-one-light.min.css', 'brown-paper.min.css', 'brown-papersq.png', 'codepen-embed.min.css', 'color-brewer.min.css', 'dark.min.css', 'default.min.css', 'devibeans.min.css', 'docco.min.css', 'far.min.css', 'felipec.min.css', 'foundation.min.css', 'github-dark-dimmed.min.css', 'github-dark.min.css', 'github.min.css', 'gml.min.css', 'googlecode.min.css', 'gradient-dark.min.css', 'gradient-light.min.css', 'grayscale.min.css', 'hybrid.min.css', 'idea.min.css', 'intellij-light.min.css', 'ir-black.min.css', 'isbl-editor-dark.min.css', 'isbl-editor-light.min.css', 'kimbie-dark.min.css', 'kimbie-light.min.css', 'lightfair.min.css', 'lioshi.min.css', 'magula.min.css', 'mono-blue.min.css', 'monokai-sublime.min.css', 'monokai.min.css', 'night-owl.min.css', 'nnfx-dark.min.css', 'nnfx-light.min.css', 'nord.min.css', 'obsidian.min.css', 'panda-syntax-dark.min.css', 'panda-syntax-light.min.css', 'paraiso-dark.min.css', 'paraiso-light.min.css', 'pojoaque.min.css', 'pojoaque.jpg', 'purebasic.min.css', 'qtcreator-dark.min.css', 'qtcreator-light.min.css', 'rainbow.min.css', 'routeros.min.css', 'school-book.min.css', 'shades-of-purple.min.css', 'srcery.min.css', 'stackoverflow-dark.min.css', 'stackoverflow-light.min.css', 'sunburst.min.css', 'tokyo-night-dark.min.css', 'tokyo-night-light.min.css', 'tomorrow-night-blue.min.css', 'tomorrow-night-bright.min.css', 'vs.min.css', 'vs2015.min.css', 'xcode.min.css', 'xt256.min.css'];

const util = new FileUtil();

let m;

openButton.addEventListener('click', async function onClick (event) {
  const text = await util.openByPicker({
    types: [{accept: {'text/markdown': ['.md']}}]
  });
  if (!text) return;
  editor.value = text;
  preview.innerHTML = marked.marked(text);
  m = mode();
}, false);

saveButton.addEventListener('click', async function onClick (event) {
  await util.write(editor.value);
}, false);

changeStyle.addEventListener('change', function onChange (event) {
  const {value} = changeStyle.options[changeStyle.selectedIndex];
  [...document.querySelectorAll('link[href*="libs/highlight.js"]')].forEach(style => style.disabled = !style.href.endsWith(value));
}, false);

editor.addEventListener('contextmenu', function onContextMenu (event) {
  event.preventDefault();
}, false);

editor.addEventListener('dragover', function onDragOver (event) {
  event.preventDefault();
}, false);

editor.addEventListener('drop', async function onDrop (event) {
  event.preventDefault();
  const text = await util.openByDrop(event.dataTransfer);
  if (!text) return;
  editor.value = text;
  preview.innerHTML = marked.marked(text);
  m = mode();
}, false);

editor.addEventListener('keyup', function onKeyUp (event) {
  const value = editor.value;
  preview.innerHTML = marked.marked(value);
}, false);

preview.addEventListener('contextmenu', function onContextMenu (event) {
  event.preventDefault();
  if (!m) return;
  m.next().value?
      preview.innerText = preview.innerHTML:
      preview.innerHTML = preview.innerText;
}, false);

styles.forEach(style => {
  document.head.innerHTML += `<link disabled href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${style}" rel="stylesheet">`;
  changeStyle.innerHTML += `<option value="${style}">${style}</option>`;
});

const renderer = new marked.Renderer()
renderer.code = function (code, language) {
  return `<pre><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`;
};
marked.setOptions({renderer});

function* mode (ret = true) {
  while (true) {
    yield ret;
    ret = !ret;
  }
}
})();