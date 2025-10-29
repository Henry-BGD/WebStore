import React from 'react'

export function Button({ children, variant='solid', size='md', className='', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-2xl shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    solid: 'bg-slate-900 text-white hover:opacity-90 focus:ring-slate-900',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 focus:ring-slate-300',
    ghost: 'hover:bg-slate-100'
  }
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4.5 py-2.5 text-base'
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
