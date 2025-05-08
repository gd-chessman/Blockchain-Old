import Image from "next/image"
import Link from "next/link"
import { useThemeToggle } from "@/hooks/use-theme-toggle"

export function Logo() {
  const { theme, mounted } = useThemeToggle()

  if (!mounted) {
    return (
      <Link href="/dashboard" className="flex items-center">
        <div className="relative flex items-center">
          <div className="relative z-10 ml-3 mr-1">
            <Image 
              src="/logo.png" 
              alt="Logo App" 
              width={78} 
              height={48}
              className="md:hidden"
            />
            <Image 
              src="/logo.png" 
              alt="Logo App" 
              width={120} 
              height={70}
              className="hidden md:block xl:hidden"
            />
            <Image 
              src="/logo.png" 
              alt="Logo App" 
              width={160} 
              height={90}
              className="hidden xl:block"
            />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/dashboard" className="flex items-center">
      <div className="relative flex items-center">
        <div className="relative z-10 ml-3 mr-1">
          <Image 
            src={theme === "dark" ? "/logo-white.png" : "/logo.png"} 
            alt="Logo App" 
            width={78} 
            height={64}
            className="md:hidden"
          />
          <Image 
            src={theme === "dark" ? "/logo-white.png" : "/logo.png"} 
            alt="Logo App" 
            width={120} 
            height={70}
            className="hidden md:block xl:hidden"
          />
          <Image 
            src={theme === "dark" ? "/logo-white.png" : "/logo.png"} 
            alt="Logo App" 
            width={160} 
            height={90}
            className="hidden xl:block"
          />
        </div>
      </div>
    </Link>
  )
}
