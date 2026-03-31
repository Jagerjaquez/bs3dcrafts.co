'use client'

import * as React from 'react'

interface SliderProps {
  min: number
  max: number
  step: number
  value: number[]
  onValueChange: (value: number[]) => void
  className?: string
}

export function Slider({ min, max, step, value, onValueChange, className = '' }: SliderProps) {
  const handleChange = (index: number, newValue: number) => {
    const newValues = [...value]
    newValues[index] = newValue
    
    // Ensure min doesn't exceed max
    if (index === 0 && newValues[0] > newValues[1]) {
      newValues[0] = newValues[1]
    }
    // Ensure max doesn't go below min
    if (index === 1 && newValues[1] < newValues[0]) {
      newValues[1] = newValues[0]
    }
    
    onValueChange(newValues)
  }

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Track */}
      <div className="relative h-2 bg-gray-700 rounded-full">
        {/* Active track */}
        <div
          className="absolute h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          style={{
            left: `${getPercentage(value[0])}%`,
            right: `${100 - getPercentage(value[1])}%`
          }}
        />
      </div>

      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => handleChange(0, Number(e.target.value))}
        className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
      />

      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[1]}
        onChange={(e) => handleChange(1, Number(e.target.value))}
        className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
      />

      {/* Visual thumbs */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary pointer-events-none"
        style={{ left: `calc(${getPercentage(value[0])}% - 8px)` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-secondary pointer-events-none"
        style={{ left: `calc(${getPercentage(value[1])}% - 8px)` }}
      />
    </div>
  )
}
