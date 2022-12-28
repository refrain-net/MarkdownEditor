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
const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');

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