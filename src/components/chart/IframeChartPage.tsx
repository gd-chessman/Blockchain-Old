import React, { useEffect, useState } from 'react'

interface IframeChartPageProps {
  token: any;
}

export default function IframeChartPage({ token }: IframeChartPageProps) {
  const [theme, setTheme] = useState('dark')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const htmlElement = document.documentElement
    const isLightTheme = htmlElement.classList.contains('light')
    setTheme(isLightTheme ? 'light' : 'dark')

    // Create a MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isLightTheme = htmlElement.classList.contains('light')
          setTheme(isLightTheme ? 'light' : 'dark')
          setIsLoading(true) // Set loading when theme changes
        }
      })
    })

    // Start observing the HTML element for class changes
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Cleanup observer on component unmount
    return () => observer.disconnect()
  }, [])

  return (
    <div 
      className={`rounded relative w-full h-[26.3rem] xl:h-[31.6rem] overflow-hidden transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
    >
      <iframe
        src={`https://birdeye.so/tv-widget/${token}?chain=solana&viewMode=pair&chartInterval=1D&chartType=CANDLE&chartTimezone=Asia%2FBangkok&chartLeftToolbar=show&theme=${theme}`}
        className={`rounded w-full h-[31.25rem] xl:h-[33.75rem] 3xl:h-[38.5rem] border-none absolute top-0 left-0 transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}
    </div>
  )
}
