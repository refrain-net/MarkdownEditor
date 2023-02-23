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

/** --- declare variables --- */

const openButton = document.querySelector('#open_button');
const saveButton = document.querySelector('#save_button');
const changeStyle = document.querySelector('#change_style');
const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');

const styles = ['a11y-dark', 'a11y-light', 'agate', 'an-old-hope', 'androidstudio', 'arduino-light', 'arta', 'ascetic', 'atom-one-dark-reasonable', 'atom-one-dark', 'atom-one-light', 'brown-paper', 'brown-papersq.png', 'codepen-embed', 'color-brewer', 'dark', 'default', 'devibeans', 'docco', 'far', 'felipec', 'foundation', 'github-dark-dimmed', 'github-dark', 'github', 'gml', 'googlecode', 'gradient-dark', 'gradient-light', 'grayscale', 'hybrid', 'idea', 'intellij-light', 'ir-black', 'isbl-editor-dark', 'isbl-editor-light', 'kimbie-dark', 'kimbie-light', 'lightfair', 'lioshi', 'magula', 'mono-blue', 'monokai-sublime', 'monokai', 'night-owl', 'nnfx-dark', 'nnfx-light', 'nord', 'obsidian', 'panda-syntax-dark', 'panda-syntax-light', 'paraiso-dark', 'paraiso-light', 'pojoaque', 'pojoaque.jpg', 'purebasic', 'qtcreator-dark', 'qtcreator-light', 'rainbow', 'routeros', 'school-book', 'shades-of-purple', 'srcery', 'stackoverflow-dark', 'stackoverflow-light', 'sunburst', 'tokyo-night-dark', 'tokyo-night-light', 'tomorrow-night-blue', 'tomorrow-night-bright', 'vs', 'vs2015', 'xcode', 'xt256'];

const util = new FileUtil();

let activeElement = null;
let m;
let progress = 0;

/** --- set event listener --- */
openButton.addEventListener('click', async function onClick (event) {
  const text = await util.openByPicker({
    types: [{accept: {'text/markdown': ['.md']}}]
  });
  if (!text) return;
  editor.value = text;
  markedPreview(text);
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
  markedPreview(text);
  m = mode();
}, false);

editor.addEventListener('keyup', function onKeyUp (event) {
  const {value} = this;
  markedPreview(value);
}, false);

editor.addEventListener('mouseover', onMouseOver, false);

editor.addEventListener('scroll', onScroll, false);

preview.addEventListener('contextmenu', function onContextMenu (event) {
  event.preventDefault();
  if (!m) return;
  const {innerHTML, innerText} = this;
  m.next().value?
      preview.innerText = innerHTML:
      preview.innerHTML = innerText;
}, false);

preview.addEventListener('mouseover', onMouseOver, false);

preview.addEventListener('scroll', onScroll, false);

/** --- initialize marked.js --- */

const renderer = new marked.Renderer()
renderer.code = function (code, language) {
  return `<pre><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`;
};
marked.setOptions({renderer});

/** --- initialize --- */

styles.forEach(style => {
  document.head.innerHTML += `<link disabled href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${style}.min.css" rel="stylesheet">`;
  changeStyle.innerHTML += `<option value="${style}.min.css">${style}</option>`;
});

window.requestAnimationFrame(animationFrame);

/** --- functions --- */

function animationFrame () {
  editor.scrollTop = editor.scrollHeight * progress;
  preview.scrollTop = preview.scrollHeight * progress;
  window.requestAnimationFrame(animationFrame);
}
  
function markedPreview (mdString) {
  preview.innerHTML = marked.marked(mdString);
  [...preview.querySelectorAll(':not(pre)>code')].forEach(code => code.classList.add('hljs'));
}

function onMouseOver (event) {
  activeElement = this === editor? editor:
                  this === preview? preview:
                  null;
}
  
function onScroll (event) {
  if (activeElement !== this) return;
  progress = this.scrollTop / this.scrollHeight;
  event.preventDefault();
}

/** --- generator functions --- */
  
function* mode (ret = true) {
  while (true) {
    yield ret;
    ret = !ret;
  }
}
})();
