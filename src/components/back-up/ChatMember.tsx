// import { useLang } from '@/lang';
// import { Card } from '@/ui/card'
// import React, { useState, useEffect } from 'react'
// import { Copy, X } from 'lucide-react'
// import { ToastNotification } from '@/ui/toast'
// import { useSearchParams, useRouter } from 'next/navigation'

// interface Message {
//   id: string;
//   text: string;
//   sender: 'user' | 'bot';
//   timestamp: Date;
//   walletAddress: string;
// }

// interface ChatMemberProps {
//   className?: string;
//   traderId?: string | null;
// }

// export default function ChatMember({className, traderId}: ChatMemberProps) {
//   const { t } = useLang();
//   const [messages, setMessages] = useState<Message[]>([])
//   const [inputMessage, setInputMessage] = useState('')
//   const chatContainerRef = React.useRef<HTMLDivElement>(null)
//   const [showToast, setShowToast] = useState(false)
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const isOpen = searchParams.get('dialog') === 'chat'

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text)
//     setShowToast(true)
//     setTimeout(() => setShowToast(false), 3000)
//   }

//   const scrollToBottom = (isNewMessage: boolean = false) => {
//     if (chatContainerRef.current) {
//       if (isNewMessage) {
//         chatContainerRef.current.style.scrollBehavior = 'smooth'
//         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
//         // Reset scroll behavior after animation
//         setTimeout(() => {
//           if (chatContainerRef.current) {
//             chatContainerRef.current.style.scrollBehavior = 'auto'
//           }
//         }, 500)
//       } else {
//         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
//       }
//     }
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   // Load messages from session storage on component mount
//   useEffect(() => {
//     const storedMessages = localStorage.getItem('chatMessages')
//     if (storedMessages) {
//       try {
//         const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
//           ...msg,
//           timestamp: new Date(msg.timestamp)
//         }))
//         if (parsedMessages.length > 0) {
//           setMessages(parsedMessages)
//         }
//       } catch (error) {
//         console.error('Error parsing messages:', error)
//         localStorage.removeItem('chatMessages')
//       }
//     }
//   }, [])

//   // Save messages to session storage whenever they change
//   useEffect(() => {
//     if (messages.length > 0) {
//       try {
//         const messagesToStore = messages.map(msg => ({
//           ...msg,
//           timestamp: msg.timestamp.toISOString()
//         }))
//         localStorage.setItem('chatMessages', JSON.stringify(messagesToStore))
//       } catch (error) {
//         console.error('Error saving messages:', error)
//       }
//     }
//   }, [messages])

//   const handleSendMessage = () => {
//     if (!inputMessage.trim()) return

//     const newMessage: Message = {
//       id: Date.now().toString(),
//       text: inputMessage,
//       sender: 'user',
//       timestamp: new Date(),
//       walletAddress: '0x1234...5678'
//     }

//     setMessages(prev => [...prev, newMessage])
//     setInputMessage('')
//     scrollToBottom(true)

//     // Simulate bot response after 1 second
//     setTimeout(() => {
//       const botResponse: Message = {
//         id: (Date.now() + 1).toString(),
//         text: t('chat.simulatedResponse') +  newMessage.text,
//         sender: 'bot',
//         timestamp: new Date(),
//         walletAddress: '0x8765...4321'
//       }
//       setMessages(prev => [...prev, botResponse])
//       scrollToBottom(true)
//     }, 1000)
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSendMessage()
//     }
//   }

//   const handleClose = () => {
//     const params = new URLSearchParams(searchParams.toString())
//     params.delete('dialog')
//     router.push(`?${params.toString()}`)
//   }

//   return (
//     <>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="fixed inset-0 bg-black/50"/>
//           <div className="relative bg-background max-w-2xl w-full rounded-lg shadow-lg border">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h2 className="text-lg font-semibold">{t('chat.title')}</h2>
//               <button
//                 onClick={handleClose}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className={`max-w-2xl w-full flex flex-col rounded-lg shadow-sm ${className}`}>
//               {showToast && <ToastNotification message={t('createCoin.copySuccess')} />}
//               <div 
//                 ref={chatContainerRef}
//                 className="h-[28.95rem] overflow-y-auto rounded-lg p-4 shadow-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-300"
//               >
//                 {messages.map((message) => (
//                   <div
//                     key={message.id}
//                     className={`mb-2 p-2 rounded-lg ${
//                       message.sender === 'user'
//                         ? 'bg-[#d8e8f7] text-black ml-auto max-w-[80%]'
//                         : 'bg-gray-100 text-black mr-auto max-w-[80%]'
//                     }`}
//                   >
//                     <div className="mb-1 flex items-center gap-2">
//                       <span className="text-xs text-gray-600">{message.walletAddress}</span>
//                       <button 
//                         onClick={() => copyToClipboard(message.walletAddress)}
//                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                       >
//                         <Copy size={12} />
//                       </button>
//                     </div>
//                     <p className="text-sm mb-1">{message.text}</p>
//                     <p className="text-[10px] text-gray-400 text-right">
//                       {message.timestamp.toLocaleTimeString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//               <div className="flex gap-2 px-4 py-3">
//                 <input
//                   type="text"
//                   value={inputMessage}
//                   onChange={(e) => setInputMessage(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder={t('chat.placeholder')}
//                   className="flex-1 border rounded-lg px-3 py-1.5 outline-none"
//                 />
//                 <button 
//                   onClick={handleSendMessage}
//                   className="bg-[#d8e8f7] text-black px-4 py-1.5 rounded-lg hover:bg-[#c8d8e7] transition-colors"
//                 >
//                   {t('chat.send')}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }
