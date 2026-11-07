'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const stadiumFile = path.join(__dirname, '..', 'nbu-campus-3d', 'index.html');
const html = fs.readFileSync(stadiumFile, 'utf8');

test('all inline stadium JavaScript blocks parse', () => {
  const inlineScripts = Array.from(
    html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
    match => match[1]
  );
  assert.ok(inlineScripts.length >= 2, 'expected the startup and main game scripts');
  inlineScripts.forEach((source, index) => {
    assert.doesNotThrow(() => new vm.Script(source, {filename: 'stadium-inline-' + index + '.js'}));
  });
});

test('dugout seat materials initialize before they are used', () => {
  const initialization = html.indexOf('const stadiumSeatMaterials=');
  const benchUse = html.indexOf('sign===1?stadiumSeatMaterials[0]:stadiumSeatMaterials[2]');
  const bowlUse = html.indexOf('const stadiumSeatMeshes=');
  assert.ok(initialization >= 0 && benchUse >= 0 && bowlUse >= 0, 'seat materials, bench and bowl must exist');
  assert.ok(initialization < benchUse && benchUse < bowlUse, 'initialize seat materials before constructing the dugouts');
  assert.equal((html.match(/const stadiumSeatMaterials=/g) || []).length, 1, 'define shared materials exactly once');
});

test('spectator cameras and stand anti-clipping guard remain present', () => {
  assert.match(html, /stadiumViewMode==="director"/);
  assert.match(html, /stadiumViewMode==="tifo"/);
  assert.match(html, /wallSweepBlocked\(/);
});