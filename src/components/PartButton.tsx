import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { springTo } from '../interactions/spring'

type PartButtonProps = {
  id: string
  name: string
  selected: boolean
  canPlace: boolean
  placed: boolean
  onActivate: () => void
}

type Preview = { x: number; y: number; width: number; height: number }
type Gesture = {
  pointerId: number
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  lastX: number
  lastY: number
  lastTime: number
  velocityX: number
  velocityY: number
  moved: boolean
  origin: Preview
}

export default function PartButton({ id, name, selected, canPlace, placed, onActivate }: PartButtonProps) {
  const button = useRef<HTMLButtonElement>(null)
  const floatingPart = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const stopSpring = useRef<() => void>(() => {})
  const suppressClick = useRef(false)
  const [preview, setPreview] = useState<Preview | null>(null)

  useEffect(() => {
    function cancelDrag() {
      const drag = gesture.current
      stopSpring.current()
      gesture.current = null
      document.querySelector('[data-drop-zone]')?.removeAttribute('data-drag-over')
      if (!drag) { setPreview(null); return }
      suppressClick.current = true
      const current = floatingPart.current?.getBoundingClientRect()
      stopSpring.current = springTo(
        current ? { x: current.left, y: current.top } : drag.origin,
        drag.origin, { x: 0, y: 0 },
        (point) => setPreview({ ...drag.origin, ...point }), () => setPreview(null))
    }
    function keyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') cancelDrag()
    }
    document.addEventListener('keydown', keyDown)
    window.addEventListener('blur', cancelDrag)
    return () => {
      stopSpring.current()
      document.removeEventListener('keydown', keyDown)
      window.removeEventListener('blur', cancelDrag)
      document.querySelector('[data-drop-zone]')?.removeAttribute('data-drag-over')
    }
  }, [])

  function pointerDown(event: PointerEvent<HTMLElement>) {
    if ((!canPlace && !floatingPart.current) || event.button !== 0 || !event.isPrimary) return
    stopSpring.current() // A moving preview can be grabbed and redirected immediately.
    suppressClick.current = false
    const source = button.current!.getBoundingClientRect()
    const current = floatingPart.current?.getBoundingClientRect() ?? source
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY,
      offsetX: event.clientX - current.left, offsetY: event.clientY - current.top,
      lastX: event.clientX, lastY: event.clientY, lastTime: event.timeStamp,
      velocityX: 0, velocityY: 0, moved: Boolean(floatingPart.current),
      origin: { x: source.left, y: source.top, width: source.width, height: source.height },
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function pointerMove(event: PointerEvent<HTMLElement>) {
    const drag = gesture.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 8) return
    event.preventDefault()
    drag.moved = true
    const seconds = (event.timeStamp - drag.lastTime) / 1000
    if (seconds > 0) {
      // Blend recent movement samples so one noisy event cannot create a wild throw.
      drag.velocityX = drag.velocityX * 0.3 + (event.clientX - drag.lastX) / seconds * 0.7
      drag.velocityY = drag.velocityY * 0.3 + (event.clientY - drag.lastY) / seconds * 0.7
    }
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    drag.lastTime = event.timeStamp
    setPreview({ ...drag.origin, x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY })
    const zone = document.querySelector<HTMLElement>('[data-drop-zone]')
    if (zone) {
      const bounds = zone.getBoundingClientRect()
      zone.dataset.dragOver = String(event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom)
    }
  }

  function finish(event: PointerEvent<HTMLElement>, cancelled = false) {
    const drag = gesture.current
    if (!drag || drag.pointerId !== event.pointerId) return
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    document.querySelector('[data-drop-zone]')?.removeAttribute('data-drag-over')
    if (!drag.moved) return
    suppressClick.current = true
    const zone = document.querySelector('[data-drop-zone]')?.getBoundingClientRect()
    const validDrop = !cancelled && canPlace && zone && event.clientX >= zone.left && event.clientX <= zone.right && event.clientY >= zone.top && event.clientY <= zone.bottom
    if (validDrop) onActivate()

    // Wait for the new layer's DOM position, then hand the pointer velocity to a spring.
    const releasedAt = { x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY }
    const velocity = event.timeStamp - drag.lastTime < 100 && !cancelled
      ? { x: drag.velocityX, y: drag.velocityY } : { x: 0, y: 0 }
    const frame = requestAnimationFrame(() => {
      const layer = validDrop ? document.querySelector(`[data-part-id="${id}"]`)?.getBoundingClientRect() : null
      const target = layer
        ? { x: layer.left + (layer.width - drag.origin.width) / 2, y: layer.top + (layer.height - drag.origin.height) / 2 }
        : drag.origin
      stopSpring.current = springTo(releasedAt, target, velocity,
        (point) => setPreview({ ...drag.origin, ...point }), () => setPreview(null))
    })
    stopSpring.current = () => cancelAnimationFrame(frame)
  }

  const content = <><span className={`part-thumbnail thumbnail-${id}`} aria-hidden="true" /><span className="part-name">{name}</span><span className="part-state" aria-hidden="true">{placed ? '✓' : canPlace ? '+' : ''}</span></>

  return (
    <>
      <button ref={button} type="button" className="part" aria-pressed={selected} data-placeable={canPlace}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={(event) => finish(event)} onPointerCancel={(event) => finish(event, true)}
        onClick={(event) => { if (!suppressClick.current || event.detail === 0) onActivate(); suppressClick.current = false }}>
        {content}
      </button>
      {preview && createPortal(
        <div ref={floatingPart} className="part drag-preview" aria-hidden="true"
          style={{ width: preview.width, height: preview.height, transform: `translate3d(${preview.x}px, ${preview.y}px, 0)` }}
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={(event) => finish(event)} onPointerCancel={(event) => finish(event, true)}>
          {content}
        </div>, document.body)}
    </>
  )
}
