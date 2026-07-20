"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { CylinderWindowTag } from "./CylinderWindowTag"
import { layoutPyramid, type PyramidCell } from "../pyramidLayout"
import {
  DEFAULT_CYLINDER_SCALE,
  toCssHex,
  toThreeHex,
  type CylinderWindowSpec,
} from "./types"

type Props = {
  /** Each item is an independent window config (colors, motion, label). */
  windows: CylinderWindowSpec[]
  className?: string
}

type SlotMesh = {
  mesh: THREE.Mesh
  material: THREE.MeshPhongMaterial
  pedestal: THREE.Mesh
  pedestalMat: THREE.MeshPhongMaterial
}

/**
 * Efficient shared WebGL stage.
 * Pass a flat list of independent {@link CylinderWindowSpec}s — no nested prop drilling.
 */
export function CylinderWindowsStage({ windows, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const windowsRef = useRef(windows)
  windowsRef.current = windows

  const [size, setSize] = useState({ w: 1, h: 1 })

  const cells = useMemo(
    () => layoutPyramid(windows, size.w, size.h),
    [windows, size.w, size.h],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const update = () =>
      setSize({
        w: Math.max(1, root.clientWidth),
        h: Math.max(1, root.clientHeight),
      })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(root)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return

    let disposed = false
    const clock = new THREE.Clock()
    const slots: SlotMesh[] = []

    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xffffff, 0.85))
    const dir = new THREE.DirectionalLight(0xffffff, 2.8)
    dir.position.set(2, 3, 4)
    scene.add(dir)

    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshPhongMaterial({ color: 0x0c1240 }),
    )
    bg.position.z = -3
    scene.add(bg)

    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 28)
    const pedGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 28)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setClearColor(0x0c1240, 1)
    renderer.autoClear = false
    host.appendChild(renderer.domElement)

    let width = Math.max(1, rootRef.current?.clientWidth ?? 1)
    let height = Math.max(1, rootRef.current?.clientHeight ?? 1)

    const ensureSlots = (count: number) => {
      while (slots.length > count) {
        const s = slots.pop()!
        scene.remove(s.mesh, s.pedestal)
        s.material.dispose()
        s.pedestalMat.dispose()
      }
      while (slots.length < count) {
        const material = new THREE.MeshPhongMaterial({ color: 0x888888 })
        const mesh = new THREE.Mesh(geo, material)
        const pedestalMat = new THREE.MeshPhongMaterial({
          color: 0x888888,
          emissive: 0x888888,
          emissiveIntensity: 0.3,
        })
        const pedestal = new THREE.Mesh(pedGeo, pedestalMat)
        scene.add(mesh, pedestal)
        slots.push({ mesh, material, pedestal, pedestalMat })
      }
    }

    const layout = () => {
      if (disposed || !rootRef.current) return
      width = Math.max(1, rootRef.current.clientWidth)
      height = Math.max(1, rootRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.setSize(width, height, false)
    }
    layout()
    const ro = new ResizeObserver(layout)
    if (rootRef.current) ro.observe(rootRef.current)

    const targetBody = new THREE.Color()
    const targetPed = new THREE.Color()

    const tick = () => {
      if (disposed) return
      const list = windowsRef.current
      const t = clock.getElapsedTime()
      ensureSlots(list.length)

      list.forEach((win, i) => {
        const slot = slots[i]
        if (!slot) return
        const scale = win.scale ?? DEFAULT_CYLINDER_SCALE
        const spin = win.spin ?? 1
        const mode = win.mode ?? "idle"
        const ped = win.pedestalColor ?? win.tagColor

        targetBody.setHex(toThreeHex(win.cylinderColor))
        targetPed.setHex(toThreeHex(ped))
        slot.material.color.lerp(targetBody, 0.1)
        slot.pedestalMat.color.lerp(targetPed, 0.1)
        slot.pedestalMat.emissive.lerp(targetPed, 0.1)

        slot.mesh.scale.set(...scale)
        slot.pedestal.scale.set(scale[0] * 1.25, 1, scale[2] * 1.25)

        if (mode === "idle") {
          slot.mesh.rotation.x += 0.005 * spin
          slot.mesh.rotation.z += 0.01 * spin
        } else {
          const tx = win.tiltX ?? 0
          const tz = win.tiltZ ?? 0
          slot.mesh.rotation.x += (tx - slot.mesh.rotation.x) * 0.06
          slot.mesh.rotation.z += (tz - slot.mesh.rotation.z) * 0.06
          slot.mesh.rotation.y += 0.012 * spin
        }

        const bodyY = 0.42 + Math.sin(t * 1.3 + i) * 0.06
        slot.mesh.position.set(0, bodyY, 0)
        // Keep the coin/pedestal lower; only the tall cylinder lifts
        slot.pedestal.position.set(0, -scale[1] * 0.5 - 0.1 + 0.06, 0)
      })

      const viewCells = layoutPyramid(list, width, height)

      renderer.setScissorTest(false)
      renderer.clear()
      renderer.setScissorTest(true)

      for (const cell of viewCells) {
        const { x, y, w, h, windowIndex } = cell
        const glY = height - y - h
        renderer.setViewport(x, glY, w, h)
        renderer.setScissor(x, glY, w, h)

        slots.forEach((s, j) => {
          const on = j === windowIndex
          s.mesh.visible = on
          s.pedestal.visible = on
        })
        bg.visible = true

        camera.aspect = w / Math.max(1, h)
        const nx = (x + w / 2) / width - 0.5
        const ny = (y + h / 2) / height - 0.5
        camera.position.set(nx * 0.7, 0.35 - ny * 0.35, 3.35)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
      }
    }

    renderer.setAnimationLoop(tick)

    return () => {
      disposed = true
      ro.disconnect()
      renderer.setAnimationLoop(null)
      slots.forEach((s) => {
        scene.remove(s.mesh, s.pedestal)
        s.material.dispose()
        s.pedestalMat.dispose()
      })
      geo.dispose()
      pedGeo.dispose()
      bg.geometry.dispose()
      ;(bg.material as THREE.Material).dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div ref={rootRef} className={className ?? "ss-cylinder-pyramid"} aria-hidden>
      <div ref={canvasHostRef} className="ss-cylinder-stage-canvas" />
      <div className="ss-cylinder-stage-tags">
        {cells.map((cell) => (
          <WindowTagSlot
            key={cell.id}
            cell={cell}
            window={windows[cell.windowIndex]}
          />
        ))}
      </div>
    </div>
  )
}

function WindowTagSlot({
  cell,
  window: win,
}: {
  cell: PyramidCell
  window?: CylinderWindowSpec
}) {
  if (!win) return null
  return (
    <div
      className="ss-cylinder-window ss-cylinder-window--tag-only"
      style={{
        left: cell.x,
        top: cell.y,
        width: cell.w,
        height: cell.h,
      }}
    >
      <CylinderWindowTag label={win.label} tagColor={toCssHex(win.tagColor)} />
    </div>
  )
}
