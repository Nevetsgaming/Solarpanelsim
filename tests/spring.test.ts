import test from 'node:test'
import assert from 'node:assert/strict'
import { springTo } from '../src/interactions/spring.ts'

// A simulated display clock tests motion without a browser or real-time waits.
function displayClock(reducedMotion = false) {
  const frames = new Map<number, FrameRequestCallback>()
  let nextId = 0
  let time = performance.now()
  const originals = ['window', 'requestAnimationFrame', 'cancelAnimationFrame'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const)
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }) } })
  Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: (callback: FrameRequestCallback) => { frames.set(++nextId, callback); return nextId } })
  Object.defineProperty(globalThis, 'cancelAnimationFrame', { configurable: true, value: (id: number) => frames.delete(id) })
  return {
    tick() {
      time += 1000 / 60
      const pending = [...frames.values()]
      frames.clear()
      pending.forEach((callback) => callback(time))
    },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
    },
  }
}

test('spring settles at the target without overshoot from rest', () => {
  const clock = displayClock()
  try {
    let finished = false
    let lastX = 0
    springTo({ x: 0, y: 0 }, { x: 100, y: 60 }, { x: 0, y: 0 }, (point) => {
      assert.ok(point.x >= lastX && point.x <= 100)
      lastX = point.x
    }, () => { finished = true })
    for (let frame = 0; frame < 120; frame++) clock.tick()
    assert.equal(finished, true)
    assert.equal(lastX, 100)
  } finally { clock.restore() }
})

test('release momentum is carried into the spring and cancellation stops updates', () => {
  const clock = displayClock()
  try {
    let currentX = 0
    let calls = 0
    const cancel = springTo({ x: 0, y: 0 }, { x: -10, y: 0 }, { x: 1000, y: 0 }, (point) => { currentX = point.x; calls++ }, () => {})
    clock.tick()
    assert.ok(currentX > 0, 'motion initially continues with the release velocity')
    cancel()
    const before = calls
    clock.tick()
    assert.equal(calls, before)
  } finally { clock.restore() }
})

test('reduced motion reaches the result immediately', () => {
  const clock = displayClock(true)
  try {
    let finished = false
    let result = { x: 0, y: 0 }
    springTo(result, { x: 100, y: 50 }, { x: 600, y: 300 }, (point) => { result = point }, () => { finished = true })
    assert.deepEqual(result, { x: 100, y: 50 })
    assert.equal(finished, true)
  } finally { clock.restore() }
})
