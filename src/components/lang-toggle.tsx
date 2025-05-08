"use client"

import { Button } from "@/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu"
import { useLang } from "@/lang/useLang"
import { langList } from "@/common";

export function LangToggle() {
  const { lang, setLang } = useLang();
  const currentLang = langList.find(l => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-max dark:text-white hover:bg-white/10 px-2 flex items-center gap-2">
          {currentLang && <img src={currentLang.flag} alt={currentLang.name} className="w-6 h-5 rounded" />}
          <span>{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langList.map((language) => (
          <DropdownMenuItem key={language.id} onClick={() => setLang(language.code)} className="flex items-center gap-2">
            <img src={language.flag} alt={language.name} className="w-6 h-5 rounded" />
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
