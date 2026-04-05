import { useState } from 'react'

export default function PasswordInput({ name, value, onChange, placeholder = 'Password' }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? 'text' : 'password'}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-gray-400 transition"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
      >
        {show ? (
          // Eye off icon
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          // Eye icon
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}