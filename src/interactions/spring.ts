type Point = { x: number; y: number }

// A critically damped spring: no fixed duration and no timer between input and motion.
// X and Y evolve independently and inherit the release velocity in pixels/second.
export function springTo(from: Point, target: Point, velocity: Point, update: (point: Point) => void, complete: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update(target)
    complete()
    return () => {}
  }

  let position = { ...from }
  let speed = { ...velocity }
  let previousTime = performance.now()
  let frameId = 0
  const response = 24

  function frame(time: number) {
    const seconds = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time
    const decay = Math.exp(-response * seconds)

    for (const axis of ['x', 'y'] as const) {
      const distance = position[axis] - target[axis]
      const momentum = speed[axis] + response * distance
      position[axis] = target[axis] + (distance + momentum * seconds) * decay
      speed[axis] = (speed[axis] - response * momentum * seconds) * decay
    }

    update({ ...position })
    if (Math.hypot(position.x - target.x, position.y - target.y) < 0.5 && Math.hypot(speed.x, speed.y) < 5) {
      update(target)
      complete()
    } else {
      frameId = requestAnimationFrame(frame)
    }
  }

  frameId = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(frameId)
}
