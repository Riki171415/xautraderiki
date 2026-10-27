import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Puzzle mobile layout wraps values and text, keeps dictionary within width and touch controls accessible',()=>{
 const css=fs.readFileSync(new URL('./index.css',import.meta.url),'utf8');
 assert.match(css,/\.reference-puzzle summary\{[^}]*min-height:44px[^}]*white-space:normal/);
 assert.match(css,/\.reference-puzzle input\{width:100%;min-height:44px/);
 assert.ok(css.includes('minmax(min(100%,220px),1fr)'));
 assert.match(css,/@media\(max-width:480px\)\{\.reference-puzzle/);
 assert.match(css,/\.reference-plan-values>span\{flex:1 1 28%;min-width:0/);
 const matrix=fs.readFileSync(new URL('./components/MatrixSlideshow.jsx',import.meta.url),'utf8');
 assert.ok(matrix.includes("openPanel('puzzle')"));
 const view=fs.readFileSync(new URL('./components/ReferencePuzzle.jsx',import.meta.url),'utf8');
 assert.ok(view.includes('aria-label="Cari istilah COP TAH"'));
 assert.equal((view.match(/<details>/g)||[]).length,6);
});
