import type { ReactElement } from 'react'
import { Film, ShieldCheck, Heart } from 'lucide-react'

export function Footer(): ReactElement {
   return (
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                     <Film className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg text-white">Cinema Ecosystem</span>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">
                  Hệ thống đặt vé xem phim trực tuyến thời gian thực tích hợp thanh toán tự động VNPay/MoMo, trợ lý ảo AI và quản lý cụm rạp thông minh.
               </p>
            </div>

            <div>
               <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Tính năng</h4>
               <ul className="space-y-2 text-xs">
                  <li>Đặt vé sơ đồ ghế Realtime</li>
                  <li>Đồ ăn & Combo F&B</li>
                  <li>Tích điểm thành viên & Voucher</li>
                  <li>Hỏi đáp chính sách cùng AI Bot</li>
               </ul>
            </div>

            <div>
               <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Đối tác thanh toán</h4>
               <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                     <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                     VNPay QR Sandbox
                  </li>
                  <li className="flex items-center gap-2">
                     <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                     MoMo Sandbox E-Wallet
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Công nghệ lõi</h4>
               <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  Spring Boot 3.3, Redis Redisson, PostgreSQL 16 (pgvector), React 18, Vite, TanStack Query, STOMP WebSocket.
               </p>
               <div className="text-xs text-slate-400 flex items-center gap-1">
                  Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Cinema Ecosystem
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-400">
            © 2026 Cinema Ecosystem. All rights reserved.
         </div>
      </footer>
   )
}

export default Footer
