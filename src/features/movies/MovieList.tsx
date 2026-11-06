import { useState, type ReactElement } from 'react'
import { Sparkles, Star, Clock, Calendar, Ticket } from 'lucide-react'

type MovieTab = 'NOW_SHOWING' | 'COMING_SOON'

interface MovieItem {
   id: number
   title: string
   genre: string
   durationMinutes: number
   rating: number
   releaseDate: string
   posterUrl: string
   ageRating: string
}

const MOCK_MOVIES: MovieItem[] = [
   {
      id: 1,
      title: 'Dune: Part Two',
      genre: 'Khoa học viễn tưởng, Phiêu lưu',
      durationMinutes: 166,
      rating: 8.8,
      releaseDate: '2026-03-01',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      ageRating: 'T16',
   },
   {
      id: 2,
      title: 'Oppenheimer: Re-Release',
      genre: 'Tiểu sử, Kịch tính, Lịch sử',
      durationMinutes: 180,
      rating: 8.9,
      releaseDate: '2026-03-10',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
      ageRating: 'T18',
   },
   {
      id: 3,
      title: 'Interstellar: IMAX Experience',
      genre: 'Khoa học viễn tưởng, Kịch tính',
      durationMinutes: 169,
      rating: 8.7,
      releaseDate: '2026-03-15',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      ageRating: 'P',
   },
]

export function MovieList(): ReactElement {
   const [activeMovieTab, setActiveMovieTab] = useState<MovieTab>('NOW_SHOWING')

   return (
      <div className="space-y-8">
         <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trải Nghiệm Điện Ảnh Đỉnh Cao 2026
               </div>
               <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Đặt Vé Thông Minh, <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                     Giữ Chỗ Realtime Không Nghẽn
                  </span>
               </h1>
               <p className="text-sm sm:text-base text-slate-300">
                  Hạ tầng phân tán Redis Redisson Lock & WebSockets STOMP bảo vệ từng ghế ngồi của bạn, hỗ trợ thanh toán an toàn với VNPay Sandbox.
               </p>
            </div>
         </section>

         <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
               <button
                  type="button"
                  onClick={() => setActiveMovieTab('NOW_SHOWING')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeMovieTab === 'NOW_SHOWING'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-400 hover:text-slate-200'
                     }`}
               >
                  Đang Chiếu
               </button>
               <button
                  type="button"
                  onClick={() => setActiveMovieTab('COMING_SOON')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeMovieTab === 'COMING_SOON'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-400 hover:text-slate-200'
                     }`}
               >
                  Sắp Chiếu
               </button>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
               {MOCK_MOVIES.length} bộ phim nổi bật
            </span>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_MOVIES.map((movieItem) => (
               <div
                  key={movieItem.id}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
               >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-800">
                     <img
                        src={movieItem.posterUrl}
                        alt={movieItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                     <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                        {movieItem.ageRating}
                     </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                           <Star className="w-3.5 h-3.5 fill-amber-400" />
                           <span className="font-semibold">{movieItem.rating}</span>
                           <span className="text-slate-400">/ 10</span>
                        </div>
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                           {movieItem.title}
                        </h3>
                        <p className="text-xs text-slate-400">{movieItem.genre}</p>
                     </div>

                     <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                           <Clock className="w-3.5 h-3.5" />
                           {movieItem.durationMinutes} phút
                        </span>
                        <span className="flex items-center gap-1">
                           <Calendar className="w-3.5 h-3.5" />
                           {movieItem.releaseDate}
                        </span>
                     </div>

                     <button
                        type="button"
                        className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                     >
                        <Ticket className="w-4 h-4" />
                        Đặt Vé Ngay
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default MovieList
