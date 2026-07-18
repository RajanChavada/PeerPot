import { motion } from 'framer-motion'

export default function ReceiptFeed({ receipts }: { receipts: string[] }) {
  if (receipts.length === 0) return null
  return (
    <div className="flex flex-col gap-2" aria-label="Settlement receipts">
      {receipts.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-200"
        >
          {r}
        </motion.div>
      ))}
    </div>
  )
}
