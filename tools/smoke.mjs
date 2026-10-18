#!/usr/bin/env node
/**
 * Offline smoke test for dsh-client-ui-thick-scrollbar.
 *
 * The browser half is plain JavaScript that talks to the DSH client module
 * table (`window.__ModuleLoader__`), the cordis client context (slots/locale)
 * and a handful of DOM APIs. This test boots it in a Node VM with small fakes
 * for exactly those seams, then checks:
 *
 *   - the module registers under the package name and asks for slots + locale;
 *   - the saved width is clamped, applied to <body>, and survives damaged
 *     localStorage;
 *   - the Plugins-page form registers under `plugins.bundle.config` with this
 *     package name as the key, renders its controls and summary;
 *   - saving/resetting through the form updates the body property and storage;
 *   - teardown removes the body override and the injected stylesheet.
 *
 * It cannot render React and it cannot prove the desktop shell boots with the
 * bundle; those two are documented as unverified in README.md.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'lib', 'client.js'), 'utf8')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const PKG = 'dsh-client-ui-thick-scrollbar'
const NS = 'scrollbarTuner'
const STORAGE_KEY = PKG + '.settings.v1'
const LEGACY_STORAGE_KEY = 'dsh-client-ui-scrollbar-tuner.settings.v1'
const WIDTH_VAR = '--dsh-scrollbar-width'

const failures = []
function check(name, run) {
  try {
    run()
    console.log('[OK] ' + name)
  } catch (error) {
    failures.push({ name, error })
    console.error('[FAIL] ' + name + ': ' + String(error && error.message ? error.message : error))
  }
}

function makeStyle() {
  const values = new Map()
  return {
    setProperty(name, value) {
      values.set(name, String(value))
    },
    removeProperty(name) {
      values.delete(name)
    },
    getPropertyValue(name) {
      return values.has(name) ? values.get(name) : ''
    },
  }
}

function makeElement(tagName) {
  const element = {
    tagName: String(tagName).toUpperCase(),
    dataset: {},
    style: makeStyle(),
    children: [],
    parentNode: null,
    textContent: '',
    appendChild(child) {
      element.children.push(child)
      child.parentNode = element
      return child
    },
    removeChild(child) {
      const index = element.children.indexOf(child)
      if (index >= 0) element.children.splice(index, 1)
      child.parentNode = null
      return child
    },
  }
  return element
}

function makeDocument() {
  const head = makeElement('head')
  const body = makeElement('body')
  return {
    head,
    body,
    createElement(tagName) {
      return makeElement(tagName)
    },
    querySelector(selector) {
      const match = /^style\[data-plugin="(.+)"\]$/.exec(selector)
      if (match === null) return null
      return head.children.find((child) => child.tagName === 'STYLE' && child.dataset.plugin === match[1]) ?? null
    },
  }
}

function makeStorage(initial) {
  const values = new Map(Object.entries(initial ?? {}))
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
    dump() {
      return Object.fromEntries(values)
    },
  }
}

function makeReact() {
  const createElement = (type, props, ...children) => ({
    type,
    props: Object.assign({}, props ?? {}, {
      children: children.length === 1 ? children[0] : children,
    }),
  })
  return {
    createElement,
    useState(initial) {
      const box = { value: typeof initial === 'function' ? initial() : initial }
      return [box.value, (next) => {
        box.value = typeof next === 'function' ? next(box.value) : next
      }]
    },
    useSyncExternalStore(_subscribe, getSnapshot) {
      return getSnapshot()
    },
  }
}

function textOf(node) {
  if (node === null || node === undefined || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node === 'object') {
    return textOf(node.props === undefined ? undefined : node.props.children)
  }
  return ''
}

function findAll(node, predicate, found = []) {
  if (node === null || node === undefined || typeof node !== 'object') return found
  if (Array.isArray(node)) {
    for (const item of node) findAll(item, predicate, found)
    return found
  }
  if (predicate(node)) found.push(node)
  findAll(node.props === undefined ? undefined : node.props.children, predicate, found)
  return found
}

function boot(stored, legacyStored) {
  const document = makeDocument()
  const entries = {}
  if (stored !== undefined) entries[STORAGE_KEY] = stored
  if (legacyStored !== undefined) entries[LEGACY_STORAGE_KEY] = legacyStored
  const localStorage = makeStorage(entries)
  let entry = null
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load(candidate) {
          entry = candidate
        },
      },
    },
    document,
    localStorage,
    navigator: { language: 'zh-CN' },
    console,
  }
  vm.runInNewContext(source, sandbox, { filename: 'lib/client.js' })
  assert.notEqual(entry, null, 'module must register with window.__ModuleLoader__')
  assert.equal(entry.id, PKG, 'loader id must equal the package name')

  const module = entry.factory((specifier) => {
    assert.equal(specifier, 'react', 'only React is imported')
    return makeReact()
  })

  const effects = []
  const registrations = []
  const injections = []
  const dictionaries = []
  const ctx = {
    effect(callback, label) {
      const dispose = callback()
      if (typeof dispose === 'function') effects.push({ label, dispose })
      return dispose
    },
    get(name) {
      return this[name]
    },
    slots: {
      inject(name, callback) {
        injections.push(name)
        callback()
      },
      register(options, Component) {
        registrations.push({ options, Component })
        return () => {}
      },
    },
    locale: {
      register(namespace, dictionary) {
        dictionaries.push({ namespace, dictionary })
        return () => {}
      },
      bind(namespace) {
        const found = dictionaries.find((candidate) => candidate.namespace === namespace)
        return (key, params) => {
          const table = found === undefined ? {} : (found.dictionary.zh ?? found.dictionary.en ?? {})
          const template = table[key] === undefined ? key : table[key]
          return String(template).replace(/\{(\w+)\}/g, (whole, name) => {
            const values = params ?? {}
            return Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole
          })
        }
      },
    },
  }

  module.apply(ctx)
  return { module, ctx, document, localStorage, effects, registrations, injections, dictionaries }
}

function widthOf(document) {
  return document.body.style.getPropertyValue(WIDTH_VAR)
}

function formOf(registrations) {
  assert.equal(registrations.length, 1, 'exactly one bundle-config registration')
  const registration = registrations[0]
  assert.equal(registration.options.name, 'plugins.bundle.config')
  assert.equal(registration.options.key, PKG, 'the slot key must be the bundle package name')
  assert.equal(registration.options.locale, NS)
  return registration.Component
}

check('manifest is a bundle with a browser half', () => {
  assert.equal(manifest.name, PKG)
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.dsh.client.immediately, true)
  assert.ok(manifest.exports['./client'])
})

check('default width applies to <body> as 8px', () => {
  const booted = boot()
  assert.deepEqual(Array.from(booted.module.inject), ['slots', 'locale'])
  assert.equal(widthOf(booted.document), '8px')
})

check('saved width is restored and clamped', () => {
  assert.equal(widthOf(boot('{"width":14}').document), '14px')
  assert.equal(widthOf(boot('{"width":99}').document), '20px')
  assert.equal(widthOf(boot('{"width":1}').document), '4px')
  assert.equal(widthOf(boot('{"width":"10"}').document), '10px')
  assert.equal(widthOf(boot('not json').document), '8px')
})

check('legacy storage key migrates to the new key', () => {
  const booted = boot(undefined, '{"width":12}')
  assert.equal(widthOf(booted.document), '12px')
  assert.equal(JSON.parse(booted.localStorage.getItem(STORAGE_KEY)).width, 12)
  assert.equal(booted.localStorage.getItem(LEGACY_STORAGE_KEY), '{"width":12}')
})

check('stylesheet is injected once and tagged with the package', () => {
  const booted = boot()
  const styles = booted.document.head.children.filter((child) => child.tagName === 'STYLE')
  assert.equal(styles.length, 1)
  assert.equal(styles[0].dataset.plugin, PKG)
  assert.ok(styles[0].textContent.includes('[data-dsh-scrollbar-tuner-form]'))
  assert.ok(styles[0].textContent.includes('white-space:nowrap'))
})

check('bundle-config form registers with localized zh/en dictionaries', () => {
  const booted = boot()
  assert.ok(booted.injections.includes('plugins.bundle.config'))
  const dictionary = booted.dictionaries.find((candidate) => candidate.namespace === NS)
  assert.ok(dictionary, 'locale namespace must be registered')
  assert.equal(dictionary.dictionary.zh.title, '滚动条宽度')
  assert.equal(dictionary.dictionary.en.title, 'Scrollbar width')
  assert.deepEqual(
    Object.keys(dictionary.dictionary.zh).sort(),
    Object.keys(dictionary.dictionary.en).sort(),
    'zh/en dictionaries must share one key set',
  )
})

check('form renders controls, current width and summary', () => {
  const booted = boot()
  const Component = formOf(booted.registrations)
  const t = booted.ctx.locale.bind(NS)

  const summary = Component({ t, view: 'summary' })
  assert.equal(textOf(summary), '当前滚动条宽度 8px')

  const page = Component({ t, view: 'page' })
  const text = textOf(page)
  assert.ok(text.includes('滚动条宽度'))
  assert.ok(text.includes('当前 8px'))

  const input = findAll(page, (node) => node.type === 'input')[0]
  assert.ok(input, 'number input must render')
  assert.equal(String(input.props.value), '8')
  assert.equal(input.props.min, 4)
  assert.equal(input.props.max, 20)
  assert.equal(input.props.type, 'number')

  const buttons = findAll(page, (node) => node.type === 'button')
  const labels = buttons.map((button) => textOf(button))
  assert.deepEqual(labels, ['6 px', '8 px', '10 px', '12 px', '保存', '恢复默认'])
  const save = buttons.find((button) => textOf(button) === '保存')
  assert.equal(save.props.disabled, true, 'save is disabled until the draft differs')
})

check('reset writes the default back to storage and the document', () => {
  const booted = boot('{"width":14}')
  assert.equal(widthOf(booted.document), '14px')
  const Component = formOf(booted.registrations)
  const t = booted.ctx.locale.bind(NS)
  const page = Component({ t, view: 'page' })
  const reset = findAll(page, (node) => node.type === 'button' && textOf(node) === '恢复默认')[0]
  assert.ok(reset, 'reset button must render')
  reset.props.onClick()
  assert.equal(widthOf(booted.document), '8px')
  assert.equal(JSON.parse(booted.localStorage.getItem(STORAGE_KEY)).width, 8)
})

check('teardown removes the override and the injected stylesheet', () => {
  const booted = boot()
  for (const effect of booted.effects.slice().reverse()) {
    try {
      effect.dispose()
    } catch {
      /* effect cleanup must not throw */
    }
  }
  assert.equal(widthOf(booted.document), '', 'inline custom property must be removed')
  assert.equal(
    booted.document.head.children.filter((child) => child.tagName === 'STYLE').length,
    0,
    'style node must be removed',
  )
})

if (failures.length > 0) {
  console.error('\n' + failures.length + ' check(s) failed.')
  process.exitCode = 1
} else {
  console.log('\nAll checks passed.')
}
