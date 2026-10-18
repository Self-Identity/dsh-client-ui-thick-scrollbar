/**
 * dsh-client-ui-thick-scrollbar — browser half.
 *
 * The shipped theme paints every scrollbar from two body-level custom
 * properties:
 *
 *     body { --dsh-scrollbar-width: 5px }
 *     ::-webkit-scrollbar { width: var(--dsh-scrollbar-width) }
 *
 * so a thicker scrollbar is one override. This plugin writes the chosen width
 * as an inline custom property on <body> (inline beats the theme's body rule
 * and needs no selector war), keeps the value in localStorage, and registers a
 * form on this bundle's page under Plugins.
 *
 * The only runtime import is React from the browser module table; every other
 * capability (slots, locale) comes from the cordis client context.
 */
window.__ModuleLoader__.load({
  id: 'dsh-client-ui-thick-scrollbar',
  factory: (require) => {
    try {
      const React = require('react')
      const h = React.createElement

      /** Package name; also the `plugins.bundle.config` key. */
      const PKG = 'dsh-client-ui-thick-scrollbar'
      /** Dictionary namespace registered with the client locale service. */
      const NS = 'scrollbarTuner'
      /** Body custom property the shipped theme reads for every scrollbar. */
      const WIDTH_VAR = '--dsh-scrollbar-width'
      const STORAGE_KEY = PKG + '.settings.v1'
      /** The previous package name's key: read once so existing users keep their width. */
      const LEGACY_STORAGE_KEY = 'dsh-client-ui-scrollbar-tuner.settings.v1'
      const MIN_WIDTH = 4
      const MAX_WIDTH = 20
      const DEFAULT_WIDTH = 8
      const PRESETS = [6, 8, 10, 12]

      const zh = {
        title: '滚动条宽度',
        current: '当前 {width}px',
        hint: '官方默认 5px。保存后对会话区、侧边栏、菜单和弹窗里的滚动条统一生效，范围 {min}–{max}px。',
        presets: '常用宽度',
        custom: '自定义宽度',
        save: '保存',
        reset: '恢复默认',
        saved: '已保存：{width}px',
        resetDone: '已恢复默认：{width}px',
        invalid: '请输入 {min}–{max} 之间的整数',
        summary: '当前滚动条宽度 {width}px',
      }

      const en = {
        title: 'Scrollbar width',
        current: 'Current: {width}px',
        hint: 'The shipped default is 5px. Saving applies to scrollbars in the conversation, sidebar, menus and dialogs; range {min}–{max}px.',
        presets: 'Common widths',
        custom: 'Custom width',
        save: 'Save',
        reset: 'Restore default',
        saved: 'Saved: {width}px',
        resetDone: 'Default restored: {width}px',
        invalid: 'Enter a whole number between {min} and {max}',
        summary: 'Scrollbar width is {width}px',
      }

      /** Keep every caller (storage, presets, input) on whole pixels in range. */
      function clampWidth(value) {
        const number = Number(value)
        if (!Number.isFinite(number)) return DEFAULT_WIDTH
        return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(number)))
      }

      /** Parse one raw storage entry; undefined when it holds no usable number. */
      function parseStoredWidth(raw) {
        const parsed = JSON.parse(raw)
        const value = parsed !== null && typeof parsed === 'object' ? parsed.width : parsed
        const number = Number(value)
        if (!Number.isFinite(number)) return undefined
        return clampWidth(number)
      }

      /** Read the saved width, migrating the legacy package's key once. */
      function readWidth() {
        try {
          if (typeof localStorage === 'undefined') return DEFAULT_WIDTH
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw !== null) {
            const value = parseStoredWidth(raw)
            if (value !== undefined) return value
          }
          const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
          if (legacy !== null) {
            const value = parseStoredWidth(legacy)
            if (value !== undefined) {
              writeWidth(value)
              return value
            }
          }
          return DEFAULT_WIDTH
        } catch {
          return DEFAULT_WIDTH
        }
      }

      /** Persist one width; a blocked storage write must not break the form. */
      function writeWidth(width) {
        try {
          if (typeof localStorage === 'undefined') return
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: width }))
        } catch {
          /* private mode / quota: the in-memory value still applies this session */
        }
      }

      let currentWidth = readWidth()
      const listeners = new Set()

      /** Stable snapshot for useSyncExternalStore. */
      function snapshotWidth() {
        return currentWidth
      }

      function subscribeWidth(listener) {
        listeners.add(listener)
        return function unsubscribe() {
          listeners.delete(listener)
        }
      }

      /** Commit one width; returns true when the value actually changed. */
      function commitWidth(value) {
        const next = clampWidth(value)
        if (next === currentWidth) return false
        currentWidth = next
        writeWidth(next)
        for (const listener of Array.from(listeners)) {
          try {
            listener()
          } catch {
            /* one broken subscriber must not stop the rest */
          }
        }
        return true
      }

      /** Paint the width where the shipped rules read it. */
      function applyWidth(width) {
        if (typeof document === 'undefined') return
        const body = document.body
        if (body === undefined || body === null) return
        try {
          body.style.setProperty(WIDTH_VAR, width + 'px')
        } catch {
          /* a detached body is not worth breaking activation over */
        }
      }

      /** Hand the width back to the shipped theme when the plugin unloads. */
      function restoreWidth() {
        if (typeof document === 'undefined') return
        const body = document.body
        if (body === undefined || body === null) return
        try {
          body.style.removeProperty(WIDTH_VAR)
        } catch {
          /* a detached body is not worth breaking teardown over */
        }
      }

      /** Form styles: theme tokens only, no literal layout width can overflow. */
      const FORM_CSS = [
        '[data-dsh-scrollbar-tuner-form]{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;width:100%;min-width:0;max-width:100%;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary,#111)}',
        '[data-dsh-scrollbar-tuner-form] .dst-head{display:flex;flex-direction:column;gap:4px;min-width:0}',
        '[data-dsh-scrollbar-tuner-form] .dst-titleRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}',
        '[data-dsh-scrollbar-tuner-form] .dst-title{font-size:14px;line-height:22px;font-weight:600;color:var(--dsw-alias-label-primary,#111)}',
        '[data-dsh-scrollbar-tuner-form] .dst-current{flex-shrink:0;padding:1px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-1,#f3f4f6);color:var(--dsw-alias-label-secondary,#555);font-size:12px;line-height:18px;white-space:nowrap}',
        '[data-dsh-scrollbar-tuner-form] .dst-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555);overflow-wrap:anywhere}',
        '[data-dsh-scrollbar-tuner-form] .dst-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}',
        '[data-dsh-scrollbar-tuner-form] .dst-chip{flex-shrink:0;height:28px;padding:0 10px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary,#111);font:inherit;font-size:13px;white-space:nowrap;cursor:pointer}',
        '[data-dsh-scrollbar-tuner-form] .dst-chip:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}',
        '[data-dsh-scrollbar-tuner-form] .dst-chipActive{border-color:var(--dsw-alias-state-business-primary,#4d6bfe);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 12%,transparent);color:var(--dsw-alias-state-business-primary,#4d6bfe)}',
        '[data-dsh-scrollbar-tuner-form] .dst-label{flex-shrink:0;font-size:13px;color:var(--dsw-alias-label-secondary,#555);white-space:nowrap}',
        '[data-dsh-scrollbar-tuner-form] .dst-input{width:84px;height:28px;padding:0 8px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#111);font:inherit;font-size:13px}',
        '[data-dsh-scrollbar-tuner-form] .dst-input:focus{outline:none;border-color:var(--dsw-alias-state-business-primary,#4d6bfe);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 30%,transparent)}',
        '[data-dsh-scrollbar-tuner-form] .dst-unit{font-size:12px;color:var(--dsw-alias-label-tertiary,#888)}',
        '[data-dsh-scrollbar-tuner-form] .dst-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}',
        '[data-dsh-scrollbar-tuner-form] .dst-button{flex-shrink:0;height:28px;padding:0 12px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary,#111);font:inherit;font-size:13px;white-space:nowrap;cursor:pointer}',
        '[data-dsh-scrollbar-tuner-form] .dst-button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}',
        '[data-dsh-scrollbar-tuner-form] .dst-primary{border-color:var(--dsw-alias-state-business-primary,#4d6bfe);background:var(--dsw-alias-state-business-primary,#4d6bfe);color:#fff}',
        '[data-dsh-scrollbar-tuner-form] .dst-primary:hover{filter:brightness(1.05)}',
        '[data-dsh-scrollbar-tuner-form] .dst-button:disabled{opacity:.5;cursor:default;filter:none;background:transparent;color:var(--dsw-alias-label-primary,#111)}',
        '[data-dsh-scrollbar-tuner-form] .dst-status{min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary,#888);overflow-wrap:anywhere}',
        '[data-dsh-scrollbar-tuner-form] .dst-summary{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555)}',
      ].join('\n')

      /** Insert the form stylesheet once per document. */
      function insertStyles() {
        if (typeof document === 'undefined') return function noop() {}
        const selector = 'style[data-plugin="' + PKG + '"]'
        if (typeof document.querySelector === 'function' && document.querySelector(selector) !== null) {
          return function noop() {}
        }
        const node = document.createElement('style')
        node.dataset.plugin = PKG
        node.textContent = FORM_CSS
        document.head.appendChild(node)
        return function removeStyles() {
          if (node.parentNode !== null && node.parentNode !== undefined) node.parentNode.removeChild(node)
        }
      }

      /** Translate without the locale service; only a last-resort fallback. */
      function fallbackTranslate(key, params) {
        let language = 'en'
        try {
          if (typeof navigator !== 'undefined' && /^zh/i.test(String(navigator.language || ''))) language = 'zh'
        } catch {
          /* no navigator: keep English */
        }
        const dictionary = language === 'zh' ? zh : en
        const template = dictionary[key] === undefined ? key : dictionary[key]
        return String(template).replace(/\{(\w+)\}/g, (whole, name) => {
          const values = params === null || params === undefined ? {} : params
          return Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole
        })
      }

      /** Current saved width as a React subscription. */
      function useWidth() {
        return React.useSyncExternalStore(subscribeWidth, snapshotWidth)
      }

      /**
       * The form rendered on this bundle's page in Plugins. The plugin manager
       * renders `view: 'page'` with the locale-bound `t`; `view: 'summary'`
       * is only used where the page asks for a one-line description.
       */
      function ConfigForm(props) {
        const face = props === null || props === undefined ? {} : props
        const t = typeof face.t === 'function' ? face.t : fallbackTranslate
        const width = useWidth()
        const [draft, setDraft] = React.useState(String(width))
        const [status, setStatus] = React.useState('')

        if (face.view === 'summary') {
          return h('span', { className: 'dst-summary' }, t('summary', { width: width }))
        }

        const rawDraft = String(draft).trim()
        const parsedDraft = Number(rawDraft)
        const hasNumber = rawDraft !== '' && Number.isFinite(parsedDraft)
        const draftWidth = hasNumber ? Math.round(parsedDraft) : null
        const normalizedDraft = draftWidth === null ? null : clampWidth(draftWidth)
        const dirty = normalizedDraft !== null && normalizedDraft !== width

        const save = () => {
          if (draftWidth === null) {
            setStatus(t('invalid', { min: MIN_WIDTH, max: MAX_WIDTH }))
            return
          }
          const next = clampWidth(draftWidth)
          commitWidth(next)
          setDraft(String(next))
          setStatus(t('saved', { width: next }))
        }

        const reset = () => {
          commitWidth(DEFAULT_WIDTH)
          setDraft(String(DEFAULT_WIDTH))
          setStatus(t('resetDone', { width: DEFAULT_WIDTH }))
        }

        const onNumberChange = (event) => {
          const value = event !== null && event !== undefined && event.target !== undefined
            ? event.target.value
            : ''
          setDraft(String(value))
          setStatus('')
        }

        const onNumberKeyDown = (event) => {
          if (event !== null && event !== undefined && event.key === 'Enter' && dirty) save()
        }

        return h('div', { className: 'dst-form', 'data-dsh-scrollbar-tuner-form': '' }, [
          h('div', { key: 'head', className: 'dst-head' }, [
            h('div', { key: 'titleRow', className: 'dst-titleRow' }, [
              h('span', { key: 'title', className: 'dst-title' }, t('title')),
              h('span', { key: 'current', className: 'dst-current' }, t('current', { width: width })),
            ]),
            h('div', { key: 'hint', className: 'dst-hint' }, t('hint', {
              min: MIN_WIDTH,
              max: MAX_WIDTH,
            })),
          ]),
          h('div', {
            key: 'presets',
            className: 'dst-row',
            role: 'group',
            'aria-label': t('presets'),
          }, PRESETS.map((preset) => h('button', {
            key: 'preset-' + preset,
            type: 'button',
            className: 'dst-chip' + (normalizedDraft === preset ? ' dst-chipActive' : ''),
            'aria-pressed': normalizedDraft === preset,
            onClick: () => {
              setDraft(String(preset))
              setStatus('')
            },
          }, preset + ' px'))),
          h('div', { key: 'custom', className: 'dst-row' }, [
            h('label', {
              key: 'label',
              className: 'dst-label',
              htmlFor: 'dsh-scrollbar-tuner-width',
            }, t('custom')),
            h('input', {
              key: 'input',
              id: 'dsh-scrollbar-tuner-width',
              type: 'number',
              className: 'dst-input',
              min: MIN_WIDTH,
              max: MAX_WIDTH,
              step: 1,
              value: String(draft),
              inputMode: 'numeric',
              'aria-label': t('custom'),
              onChange: onNumberChange,
              onKeyDown: onNumberKeyDown,
            }),
            h('span', { key: 'unit', className: 'dst-unit' }, 'px'),
          ]),
          h('div', { key: 'actions', className: 'dst-actions' }, [
            h('button', {
              key: 'save',
              type: 'button',
              className: 'dst-button dst-primary',
              disabled: !dirty,
              onClick: save,
            }, t('save')),
            h('button', {
              key: 'reset',
              type: 'button',
              className: 'dst-button',
              onClick: reset,
            }, t('reset')),
            h('span', {
              key: 'status',
              className: 'dst-status',
              role: 'status',
              'aria-live': 'polite',
            }, status),
          ]),
        ])
      }

      /** Read a client service without tripping the inject proxy. */
      function serviceOf(ctx, name) {
        try {
          return ctx !== null && ctx !== undefined && typeof ctx.get === 'function'
            ? ctx.get(name)
            : undefined
        } catch {
          return undefined
        }
      }

      /**
       * Client plugin body: apply the saved width, keep it applied when the
       * form saves, and register the form on the bundle's Plugins page.
       */
      function apply(ctx) {
        try {
          const slots = serviceOf(ctx, 'slots')
          const locale = serviceOf(ctx, 'locale')

          ctx.effect(() => {
            const removeStyles = insertStyles()
            applyWidth(currentWidth)
            const unsubscribe = subscribeWidth(() => applyWidth(currentWidth))
            return () => {
              unsubscribe()
              removeStyles()
              restoreWidth()
            }
          }, PKG + ': width')

          if (locale !== undefined && typeof locale.register === 'function') {
            ctx.effect(() => {
              const dispose = locale.register(NS, { zh: zh, en: en })
              return typeof dispose === 'function' ? dispose : function noop() {}
            }, PKG + ': dictionary')
          }

          if (slots === undefined || typeof slots.inject !== 'function' || typeof slots.register !== 'function') {
            return
          }

          ctx.effect(() => {
            slots.inject('plugins.bundle.config', () => {
              try {
                return slots.register({
                  name: 'plugins.bundle.config',
                  key: PKG,
                  locale: NS,
                }, ConfigForm)
              } catch (error) {
                try {
                  console.warn('[' + PKG + '] configuration card rejected', error)
                } catch {
                  /* console may be unavailable in an exotic carrier */
                }
                return undefined
              }
            })
            return function noop() {}
          }, PKG + ': configuration card')
        } catch (error) {
          try {
            console.error('[' + PKG + '] activation failed; the plugin stays inert', error)
          } catch {
            /* console may be unavailable in an exotic carrier */
          }
        }
      }

      return {
        name: PKG,
        inject: ['slots', 'locale'],
        apply: apply,
      }
    } catch (error) {
      try {
        console.error('[dsh-client-ui-thick-scrollbar] module evaluation failed; the plugin stays inert', error)
      } catch {
        /* console may be unavailable in an exotic carrier */
      }
      return {
        name: 'dsh-client-ui-thick-scrollbar',
        inject: [],
        apply: function apply() {},
      }
    }
  },
})
