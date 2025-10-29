import React from 'react'

export function Tabs({ value, onValueChange, children }) {
  return <div>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}</div>
}

export function TabsList({ className='', children }) {
  return <div className={`inline-flex gap-2 bg-slate-100 rounded-xl p-1 ${className}`}>{children}</div>
}

export function TabsTrigger({ value:val, onValueChange, value, children }) {
  const active = value === val
  return (
    <button
      onClick={() => onValueChange(val)}
      className={`px-3 py-1.5 rounded-lg text-sm transition ${active ? 'bg-white shadow border border-slate-200' : 'opacity-70 hover:opacity-100'}`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ when, value, children }) {
  return value === when ? <div>{children}</div> : null
}
