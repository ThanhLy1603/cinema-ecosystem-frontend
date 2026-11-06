import { useState, type ReactElement } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
interface ChatMessage {
   id: string
   sender: 'user' | 'assistant'
   text: string
}

export function FloatingChatbotWidget(): ReactElement {
   const [isOpen, setIsOpen] = useState<boolean>(false)
   const [input, setInput] = useState<string>('')
   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      {
         id: 'welcome',
         sender: 'assistant',
         text: 'Xin chào! Tôi là trợ lý AI CinemaSphere. Bạn cần tìm suất chiếu, tư vấn phim hay hỏi về chính sách vé?',
      },
   ])

   function appendMockReply(): void {
      const assistantChatMessage: ChatMessage = {
         id: (Date.now() + 1).toString(),
         sender: 'assistant',
         text: 'Trợ lý AI sẵn sàng kết nối Spring AI & pgvector khi Backend triển khai!',
      }
      setChatMessages((previousChatMessages) => [...previousChatMessages, assistantChatMessage])
   }

   function handleSend(): void {
      if (!input.trim()) return

      const userChatMessage: ChatMessage = {
         id: Date.now().toString(),
         sender: 'user',
         text: input,
      }
      setChatMessages((previousChatMessages) => [...previousChatMessages, userChatMessage])
      setInput('')

      setTimeout(appendMockReply, 600)
   }

   return (
      <div className="fixed bottom-6 right-6 z-50">
         {isOpen ? (
            <div className="w-80 sm:w-96 h-[460px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
               <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4 text-amber-300" />
                     <div>
                        <h3 className="font-semibold text-sm">Cinema AI Assistant</h3>
                        <span className="text-[10px] text-indigo-100 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                           Spring AI + pgvector
                        </span>
                     </div>
                  </div>
                  <button
                     type="button"
                     onClick={() => setIsOpen(false)}
                     className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {chatMessages.map((chatMessage) => (
                     <div
                        key={chatMessage.id}
                        className={`flex ${chatMessage.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                     >
                        <div
                           className={`max-w-[80%] rounded-2xl px-3.5 py-2 leading-relaxed ${chatMessage.sender === 'user'
                                 ? 'bg-indigo-600 text-white rounded-br-xs'
                                 : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                              }`}
                        >
                           {chatMessage.text}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
                  <input
                     type="text"
                     value={input}
                     onChange={(changeEvent) => setInput(changeEvent.target.value)}
                     onKeyDown={(keyboardEvent) => keyboardEvent.key === 'Enter' && handleSend()}
                     placeholder="Hỏi về suất chiếu, giá vé..."
                     className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  />
                  <button
                     type="button"
                     onClick={handleSend}
                     className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                  >
                     <Send className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
         ) : (
            <button
               type="button"
               onClick={() => setIsOpen(true)}
               className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
               <Bot className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
               <span className="text-xs font-semibold">Hỏi AI Tư Vấn</span>
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </button>
         )}
      </div>
   )
}

export default FloatingChatbotWidget
