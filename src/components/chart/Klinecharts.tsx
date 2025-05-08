"use client"
import React, { useEffect, useRef, useState } from 'react'
import { KLineChartPro, loadLocales } from '@klinecharts/pro'
import { CustomDatafeed } from './datafeed'
import { viVNTranslations } from './locales/vi-VN'
import { enUSTranslations } from './locales/en-US'
import { jaJPTranslations } from './locales/ja-JP'
import { koKRTranslations } from './locales/ko-KR'
import '@klinecharts/pro/dist/klinecharts-pro.css'
import { getTokenInforByAddress } from '@/services/api/SolonaTokenService'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLang } from '@/lang/useLang'
import { useThemeToggle } from '@/hooks/use-theme-toggle'
// Load translations
loadLocales('vi-VN', viVNTranslations)
loadLocales('en-EN', enUSTranslations)
loadLocales('jp-JP', jaJPTranslations)
loadLocales('kr-KR', koKRTranslations)

export default function Klinecharts() {
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const { data: tokenInfor, refetch } = useQuery({
    queryKey: ["token-infor-chart", address],
    queryFn: () => getTokenInforByAddress(address),
  });
  const { lang } = useLang();
  const { theme, mounted } = useThemeToggle()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<KLineChartPro | null>(null)
  const [isMarketCap, setIsMarketCap] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up previous chart instance if it exists
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    const options = {
      container: containerRef.current,
      locale: lang === 'vi' ? 'vi-VN' : lang === 'en' ? 'en-EN' : lang === 'jp' ? 'jp-JP' : 'kr-KR', // Default language
      watermark: ``,
      symbol: {
        exchange: 'XNYS',
        market: 'stocks',
        name: tokenInfor?.name,
        shortName: tokenInfor?.symbol,
        ticker: 'KCM',
        priceCurrency: 'usd',
        type: 'ADRC',
        pricePrecision: 3,
        volumePrecision: 3,
        logo: tokenInfor?.logoUrl
      },
      period: { multiplier: 1, timespan: 'minute', text: '5m' },
      theme: theme,
      subIndicators: ['VOL'],
      datafeed: new CustomDatafeed(isMarketCap ? (typeof window !== 'undefined' ? parseFloat(localStorage.getItem('initialRatio') || '1') : 1) : 1),
      mainIndicators: [],
    }

    chartRef.current = new KLineChartPro(options)

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      chartRef.current = null
    }
  }, [tokenInfor, lang, theme, isMarketCap])

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10 flex items-center gap-2 bg-opacity-80 px-3 py-1 rounded" 
           style={{ backgroundColor: theme === 'dark' ? 'rgba(42, 46, 57, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
        <button 
          onClick={() => setIsMarketCap(false)}
          className={`px-2 py-1 rounded-md text-xs ${!isMarketCap ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
        >
          Price
        </button>
        <button 
          onClick={() => setIsMarketCap(true)}
          className={`px-2 py-1 rounded-md text-xs ${isMarketCap ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
        >
          Market Cap
        </button>
      </div>
      <div ref={containerRef} style={{ width: '100%' }} className='!h-[26.3rem] xl:!h-[31.6rem]' />
    </div>
  )
}
