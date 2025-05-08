"use client"

import ChatMember from '@/components/chat/ChatMember'
import React, { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLang } from '@/lang/useLang'
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/ui/sidebar'
import { Button } from '@/ui/button'
import { PanelLeft, Search, Copy } from 'lucide-react'
import { Input } from '@/ui/input'
import { Separator } from '@/ui/separator'
import { Badge } from '@/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { getMasters } from '@/services/api/MasterTradingService'
import { truncateString } from '@/utils/format'
import { ToastNotification } from '@/ui/toast'

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const walletAddress = searchParams.get('wd')
  const { t } = useLang()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const { data: masterTraders = [], refetch: refetchMasterTraders } = useQuery({
    queryKey: ["master-trading/masters"],
    queryFn: getMasters,
  });

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setToastMessage(t('createCoin.copySuccess'))
    setShowToast(true)
  }

  const handleSelectAddress = (address: string) => {
    router.push(`/master-trade/chat?wd=${address}`)
  }

  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-lg font-semibold">{t('chat.sidebar.title')}</h2>
              <Button variant="ghost" size="icon">
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <div className="p-4 space-y-6">
              {/* Search Bar */}
              {/* <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-8" />
              </div> */}

              <Separator />
              <div className="space-y-2">
                <div className="space-y-1">
                  {masterTraders
                    .filter((trader: any) => 
                      trader.connection_status === 'pause' || 
                      trader.connection_status === 'connect'
                    )
                    .map((trader: any) => (
                    <div key={trader.id} className="flex items-center justify-between space-x-2 rounded-md p-2 hover:bg-accent">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleSelectAddress(trader.solana_address)}
                      >
                        <div className="text-sm">{truncateString(trader.solana_address, 10)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyAddress(trader.solana_address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {/* <h1 className="text-3xl font-bold mb-4">{t('chat.title')}</h1> */}
            <ChatMember walletAddress={walletAddress} />
          </div>
        </div>
      </SidebarProvider>
      {showToast && (
        <ToastNotification
          message={toastMessage}
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>...</div>}>
      <ChatContent />
    </Suspense>
  )
}
