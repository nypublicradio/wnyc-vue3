// Safety patch: during SSR hydration with mismatches, Vue's useCssVars runtime
// calls MutationObserver.observe(subTree.el.parentNode) where subTree.el can be
// null. This causes an unrecoverable crash. Patch .observe() to silently skip
// null/non-Node targets instead of throwing.

const origMOObserve = MutationObserver.prototype.observe
MutationObserver.prototype.observe = function (target, options) {
  if (!(target instanceof Node)) {
    console.warn('[observer-safety] MutationObserver.observe() called with non-Node target, skipping.', target)
    return
  }
  return origMOObserve.call(this, target, options)
}

const origROObserve = ResizeObserver.prototype.observe
ResizeObserver.prototype.observe = function (target, options) {
  if (!(target instanceof Element)) {
    console.warn('[observer-safety] ResizeObserver.observe() called with non-Element target, skipping.', target)
    return
  }
  return origROObserve.call(this, target, options)
}

export default defineNuxtPlugin(() => {
  // Patches applied at module scope above (runs before any component mounts)
})
