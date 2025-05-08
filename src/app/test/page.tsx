'use client'

import React from 'react'
import { useWsChart } from '@/hooks/useWsChart'

export default function TestPage() {
  const { data, isConnected, error } = useWsChart({
    tokenAddress: 'KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS', // Replace with actual token address
    timeframe: '5m'
  })

  console.log(data);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Chart Test</h1>
      
      <div className="space-y-4">
        <div>
          <p>Connection Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        </div>

        {error && (
          <div className="text-red-500">
            Error: {error.message}
          </div>
        )}

        {data && (
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Chart Data:</h2>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
