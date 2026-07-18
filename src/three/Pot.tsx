import { Canvas } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import { potVisual } from '../core/potVisual'

interface PotProps {
  potValue: number
  deadlinePressure: number
  burst?: 'success' | 'failure' | null
}

function Orb({ v }: { v: ReturnType<typeof potVisual> }) {
  return (
    <Float speed={1 + v.distortSpeed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh scale={v.scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={`hsl(${v.hue}, 80%, 55%)`}
          distort={v.distort}
          speed={v.distortSpeed}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </Float>
  )
}

// ponytail: SVG arc via strokeDashoffset — 2D on purpose, cheaper + more readable than a 3D gauge.
function PressureRing({ v }: { v: ReturnType<typeof potVisual> }) {
  const R = 140
  const C = 2 * Math.PI * R
  return (
    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 300 300" aria-hidden>
      <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <motion.circle
        cx="150"
        cy="150"
        r={R}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        stroke={`hsl(${v.hue}, 80%, 55%)`}
        strokeDasharray={C}
        initial={{ strokeDashoffset: C, opacity: 0.6 }}
        animate={{ strokeDashoffset: C * (1 - v.bloom), opacity: [0.6, 1, 0.6] }}
        transition={{ opacity: { repeat: Infinity, duration: Math.max(0.6, 2 - v.distortSpeed) } }}
      />
    </svg>
  )
}

export default function Pot({ potValue, deadlinePressure, burst }: PotProps) {
  const v = potVisual(potValue, deadlinePressure)
  return (
    <div className="relative mx-auto aspect-square w-[300px]" data-testid="pot">
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <Orb v={v} />
        <EffectComposer>
          <Bloom intensity={v.bloom * 2} luminanceThreshold={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <PressureRing v={v} />
      {burst && (
        <motion.div
          key={burst}
          className={`pointer-events-none absolute inset-0 rounded-full ${
            burst === 'success' ? 'bg-emerald-400/30' : 'bg-rose-500/30'
          }`}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          data-testid={`burst-${burst}`}
        />
      )}
    </div>
  )
}
