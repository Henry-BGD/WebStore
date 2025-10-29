import React from 'react'

export function Card({ className='', children, ...props }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`} {...props}>{children}</div>
}
export function CardHeader({ className='', children, ...props }) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>
}
export function CardTitle({ className='', children, ...props }) {
  return <h3 className={`font-semibold ${className}`} {...props}>{children}</h3>
}
export function CardContent({ className='', children, ...props }) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>
}
