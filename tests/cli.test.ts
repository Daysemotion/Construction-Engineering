import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = resolve('src/cli.ts');
function invoke(args: string[]) { return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }); }
test('CLI creates draft, checks it, refuses overwrite, and reports invalid JSON', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'orchestration-test-'));
  try {
    const target = join(temporary, 'new-project');
    assert.equal(invoke(['init', target]).status, 0);
    const path = join(target, 'record.json'); const before = readFileSync(path, 'utf8');
    assert.equal(invoke(['check', path]).status, 0);
    assert.equal(JSON.parse(invoke(['ready', path]).stdout).ready.length, 0);
    assert.match(invoke(['report', path]).stdout, /Approved: false/);
    assert.equal(invoke(['init', target]).status, 1); assert.equal(readFileSync(path, 'utf8'), before);
    writeFileSync(path, '{bad'); assert.equal(invoke(['check', path]).status, 1);
  } finally { rmSync(temporary, { recursive: true }); }
});
test('CLI demo is explicitly synthetic and unknown commands fail', () => {
  const demo = invoke(['demo']); assert.equal(demo.status, 0); assert.match(demo.stdout, /SIMULATION ONLY/);
  assert.match(demo.stdout, /stale/); assert.equal(invoke(['not-a-command']).status, 1);
  assert.equal(invoke(['check']).status, 1);
});
test('skill installation is self-contained and refuses overwrite', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'skill-install-test-'));
  try {
    const target = join(temporary, 'construction-engineering');
    const invokeInstaller = () => spawnSync(process.execPath, [resolve('scripts/install-skill.ts'), target], { encoding: 'utf8' });
    assert.equal(invokeInstaller().status, 0);
    assert.ok(existsSync(join(target, 'SKILL.md')));
    assert.ok(existsSync(join(target, 'references/refactoring.md')));
    assert.equal(readFileSync(join(target, 'LICENSE'), 'utf8'), readFileSync(resolve('LICENSE'), 'utf8'));
    assert.equal(invokeInstaller().status, 1);
  } finally { rmSync(temporary, { recursive: true }); }
});

test('project installation preserves project files, supports spaces and refuses modified installs', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'construction-project-test-'));
  try {
    const project = join(temporary, 'Project with spaces');
    mkdirSync(project);
    writeFileSync(join(project, 'AGENTS.md'), 'Existing project instructions\n');
    writeFileSync(join(project, 'app.ts'), 'export const value = 1;\n');
    const installer = resolve('scripts/install-skill.ts');
    const run = () => spawnSync(process.execPath, [installer, '--project', project], { encoding: 'utf8', cwd: temporary });
    const installed = run();
    assert.equal(installed.status, 0, installed.stderr);
    const target = join(project, '.agents/skills/construction-engineering');
    assert.match(readFileSync(join(target, 'SKILL.md'), 'utf8'), /name: construction-engineering/);
    assert.ok(existsSync(join(target, 'assets/project-record.md')));
    assert.ok(!existsSync(join(project, 'node_modules')));
    assert.equal(readFileSync(join(project, 'AGENTS.md'), 'utf8'), 'Existing project instructions\n');
    assert.equal(readFileSync(join(project, 'app.ts'), 'utf8'), 'export const value = 1;\n');
    writeFileSync(join(target, 'SKILL.md'), 'Personal customization\n');
    assert.equal(run().status, 1);
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), 'Personal customization\n');
    assert.deepEqual(readdirSync(join(project, '.agents/skills')), ['construction-engineering']);
  } finally { rmSync(temporary, { recursive: true }); }
});

test('installer requires explicit scope, rejects invalid projects and supports a custom target', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'construction-args-test-'));
  try {
    const installer = resolve('scripts/install-skill.ts');
    const run = (args: string[]) => spawnSync(process.execPath, [installer, ...args], { encoding: 'utf8', cwd: temporary });
    assert.equal(run([]).status, 1);
    assert.equal(run(['--help']).status, 0);
    assert.equal(run(['--project']).status, 1);
    assert.equal(run(['--unknown']).status, 1);
    assert.equal(run(['--user', '--project', temporary]).status, 1);
    const missing = join(temporary, 'missing');
    assert.equal(run(['--project', missing]).status, 1);
    assert.ok(!existsSync(missing));
    const file = join(temporary, 'file');
    writeFileSync(file, 'Not a directory');
    assert.equal(run(['--project', file]).status, 1);
    assert.deepEqual(readdirSync(temporary), ['file']);
    const target = join(temporary, 'custom-skills/construction-engineering');
    assert.equal(run(['--target', target]).status, 0);
    assert.ok(existsSync(join(target, 'references/quality.md')));
  } finally { rmSync(temporary, { recursive: true }); }
});
