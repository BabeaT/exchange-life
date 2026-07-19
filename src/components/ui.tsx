import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { AlertCircle, Check, LoaderCircle, X } from 'lucide-react'

export function PrimaryButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button button-primary ${className}`} {...props}>{children}</button>
}

export function SecondaryButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button button-secondary ${className}`} {...props}>{children}</button>
}

export function TextButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button button-text ${className}`} {...props}>{children}</button>
}

export function TextField({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return <label className="field"><span>{label}</span><input className={error ? 'has-error' : ''} {...props} />{error ? <small className="field-error">{error}</small> : hint ? <small>{hint}</small> : null}</label>
}

export function TextArea({ label, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return <label className="field"><span>{label}</span><textarea {...props} />{hint && <small>{hint}</small>}</label>
}

export function PaperPanel({ children, className = '', as: Tag = 'section', ...props }: { children: ReactNode; className?: string; as?: 'section' | 'article' | 'div' } & HTMLAttributes<HTMLElement>) {
  return <Tag className={`paper-panel ${className}`} {...props}>{children}</Tag>
}

export function StatusBanner({ tone = 'info', children }: { tone?: 'info' | 'success' | 'warning' | 'error'; children: ReactNode }) {
  const Icon = tone === 'success' ? Check : tone === 'error' ? AlertCircle : tone === 'warning' ? AlertCircle : LoaderCircle
  return <div className={`status-banner ${tone}`} role="status"><Icon size={17} aria-hidden="true" /><span>{children}</span></div>
}

export function LoadingState({ label = '正在轻轻整理…' }: { label?: string }) {
  return <div className="loading-state" role="status"><span className="loading-orbit" /><p>{label}</p><small>你的原始内容已经保存</small></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <PaperPanel className="empty-state"><div className="empty-seed">·</div><h3>{title}</h3><p>{description}</p>{action}</PaperPanel>
}

export function ConfirmDialog({ open, title, description, confirmLabel = '确认', onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  if (!open) return null
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={event => event.stopPropagation()}><button className="icon-button dialog-close" aria-label="关闭" onClick={onClose}><X size={18} /></button><h2 id="dialog-title">{title}</h2><p>{description}</p><div className="dialog-actions"><SecondaryButton onClick={onClose}>再想一想</SecondaryButton><PrimaryButton onClick={onConfirm}>{confirmLabel}</PrimaryButton></div></div></div>
}
