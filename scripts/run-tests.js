#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const indexPath = path.join(projectRoot, 'index.html');

if(!fs.existsSync(indexPath)){
  console.error('index.html not found at expected location');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');

let failed = false;

function assert(condition, message){
  if(condition){
    console.log(`\u2713 ${message}`);
  }else{
    console.error(`\u2717 ${message}`);
    failed = true;
  }
}

assert(/const\s+PENDANT_MASK_ID\s*=\s*"pendantCutMask"/.test(html), 'Pendant mask ID constant is defined');
assert(/function\s+clonePendantForMask\s*\(/.test(html), 'clonePendantForMask helper exists');
assert(/mask\.setAttribute\(\"id\",\s*PENDANT_MASK_ID\)/.test(html), 'Mask definition attaches pendant mask ID');
assert(/front\.setAttribute\(\"mask\",\s*pendantMaskUrl\)/.test(html), 'Front link clone uses the pendant mask');
assert(html.includes('defs.querySelectorAll(`[data-role="pendant-mask"]`).forEach(n=>n.remove());'), 'Old pendant masks are cleaned before each render');

if(failed){
  console.error('One or more sanity checks failed.');
  process.exit(1);
}

console.log('All SVG pendant mask sanity checks passed.');

