import { getChartData } from '@/services/api/OnChainService'
import { Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback } from '@klinecharts/pro'
import { KLineData } from 'klinecharts'
import { io, Socket } from 'socket.io-client'

// Function to get address from URL
const getAddressFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('address') || '' // Default address if not found
}

export class CustomDatafeed implements Datafeed {
  private socket: Socket | null = null
  private callbacks: Map<string, DatafeedSubscribeCallback> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private priceMultiplier: number
  private currentPrices: Map<string, number> = new Map()

  constructor(priceMultiplier: number = 1) {
    this.priceMultiplier = priceMultiplier
    this.setupWebSocket()
  }

  private setupWebSocket() {
    if (typeof window === 'undefined') return;
    
    this.socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chart`, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket Connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket Connection Closed')
      this.socket = null
      this.handleReconnect()
    })

    this.socket.on('chartUpdate', (data: any) => {
      this.handleWebSocketMessage(data)
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket Error:', error)
    })
  }

  private handleWebSocketMessage(data: any) {
    const address = data.tokenAddress
    const callback = this.callbacks.get(address)
    
    // Calculate new price
    const newPrice = data.data.close
    
    // Store the current price
    this.currentPrices.set(address, newPrice)
    
    // Emit custom event with close price
    const event = new CustomEvent('priceUpdate', { 
      detail: { 
        price: newPrice,
        address: address,
        timestamp: data.data.unixTime * 1000
      } 
    })
    window.dispatchEvent(event)

    if (callback) {
      const klineData: KLineData = {
        timestamp: data.data.unixTime * 1000,
        open: data.data.open * this.priceMultiplier,
        high: data.data.high * this.priceMultiplier,
        low: data.data.low * this.priceMultiplier,
        close: data.data.close * this.priceMultiplier,
        volume: data.data.volume
      }
      callback(klineData)
    }
  }

  // Method to set initial price from API
  public setInitialPrice(address: string, price: number) {
    this.currentPrices.set(address, price)
    // Emit initial price
    const event = new CustomEvent('priceUpdate', {
      detail: {
        price: price,
        address: address,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(event)
  }

  // Method to get current price
  public getCurrentPrice(address: string): number | undefined {
    return this.currentPrices.get(address)
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
      }

      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.setupWebSocket()
      }, delay)
    }
  }

  /**
   * Fuzzy search symbols
   * Triggered when the search box is entered
   * Returns an array of symbol information
   */
  async searchSymbols (keyword: string): Promise<SymbolInfo[]> {
    return Promise.resolve([])
  }

  /**
   * Pull historical k-line data
   * Triggered when the symbol and period change
   * 
   * Returns the symbol k-line data array
   */
  async getHistoryKLineData (symbol: SymbolInfo, period: Period, from: number, to: number): Promise<KLineData[]> {
    try {
      const address = getAddressFromUrl()
      // Convert milliseconds to seconds for API request
      const timeFrom = Math.floor(from / 1000)
      const timeTo = Math.floor(to / 1000)
      const periodType = period?.text || '5m'
      const data = await getChartData(address, periodType, timeFrom, timeTo)
      
      if (!data) {
        throw new Error('Failed to fetch data')
      }

      return data.map((item: any) => ({
        timestamp: item.time * 1000,
        open: item.open * this.priceMultiplier,
        high: item.high * this.priceMultiplier,
        low: item.low * this.priceMultiplier,
        close: item.close * this.priceMultiplier,
        volume: item.volume
      }))
    } catch (error) {
      console.error('Error fetching data:', error)
      return []
    }
  }

  /**
   * Subscribe to real-time data of the symbol in a certain period
   * Triggered when the symbol and period change
   * 
   * Notify chart to receive data through callback
   */
  subscribe (symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
    const address = getAddressFromUrl()
    const periodType = period?.text || '5m'

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    // Setup new WebSocket connection
    this.setupWebSocket()

    // Wait for socket to be ready
    setTimeout(() => {
      // Store callback
      this.callbacks.set(address, callback)

      // Send subscribe message
      if (this.socket?.connected) {
        this.socket.emit('subscribeToChart', {
          tokenAddress: address,
          timeframe: periodType
        })
      }
    }, 1000) // Give some time for socket to connect
  }

  /**
   * Unsubscribe to real-time data of the symbol in a certain period
   * Triggered when the symbol and period change
   */ 
  unsubscribe (symbol: SymbolInfo, period: Period): void {
    const address = getAddressFromUrl()

    // Remove callback
    this.callbacks.delete(address)

    // Send unsubscribe message
    if (this.socket?.connected) {
      this.socket.emit('unsubscribeFromChart', {
        tokenAddress: address,
        timeframe: period?.text || '5m'
      })
    }
  }
}