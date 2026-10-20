import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button, Tooltip, Tag } from 'antd';

export default function BookCard({ book, onQuickView, onAddToCart, isBookInCart }) {
  const navigate = useNavigate();

  const handleGoToDetail = (e) => {
    if (e) e.stopPropagation();
    if (onQuickView) {
      onQuickView(book);
    } else {
      navigate(`/books/${book.id}`);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Media & Badges */}
      <div className="relative aspect-3/4 bg-stone-100 overflow-hidden cursor-pointer" onClick={handleGoToDetail}>
        
        {/* Cover Image */}
        <img 
          src={book.cover} 
          alt={book.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay Action Button on Hover */}
        <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <Button 
            icon={<Eye className="w-4 h-4" />} 
            onClick={handleGoToDetail}
            className="bg-white/95 hover:bg-white border-none shadow-md font-bold text-stone-900 text-xs rounded-xl h-9 px-4"
          >
            Xem Chi Tiết
          </Button>
        </div>

        {/* Badge Top Left */}
        {book.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${book.badgeColor || 'bg-stone-900 text-white'}`}>
              {book.badge}
            </span>
          </div>
        )}

        {/* Favorite Heart Top Right */}
        <button 
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 flex items-center justify-center shadow-md transition-colors cursor-pointer"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Yêu thích"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Stock status tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
            Còn {book.available} cuốn
          </span>
        </div>

      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-lg text-[11px]">
              {book.categoryName}
            </span>
            <div className="flex items-center gap-1 font-extrabold text-stone-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{book.rating}</span>
              <span className="text-stone-400 font-medium text-[11px]">({book.reviewsCount})</span>
            </div>
          </div>

          {/* Book Title */}
          <h3 
            onClick={handleGoToDetail}
            className="font-black text-stone-900 text-base group-hover:text-amber-600 transition-colors line-clamp-2 cursor-pointer leading-snug mb-1"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-500 font-medium">
            Tác giả: <span className="text-stone-800 font-bold">{book.author}</span>
          </p>
        </div>

        {/* Pricing Block - Free Printed Book Borrowing */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Mượn đọc miễn phí</span>
            </div>

            <Tag color="amber" className="font-bold text-[10px] uppercase rounded-full m-0 px-2 py-0.5">
              Hội Viên
            </Tag>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-5 gap-2">
            <Button 
              type="primary" 
              className={`col-span-4 h-10 font-black text-xs rounded-xl border-none ${
                isBookInCart ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700 shadow-md'
              }`}
              onClick={(e) => { e.stopPropagation(); onAddToCart(book); }}
            >
              {isBookInCart ? 'Đã Trong Giỏ Mượn' : 'Mượn Ngay'}
            </Button>

            <Tooltip title="Thêm vào giỏ mượn">
              <Button 
                icon={<ShoppingBag className={`w-4 h-4 ${isBookInCart ? 'text-amber-800' : 'text-stone-800'}`} />}
                className={`col-span-1 h-10 rounded-xl flex items-center justify-center border-stone-300 ${
                  isBookInCart ? 'bg-amber-100 border-amber-400' : 'bg-stone-50 hover:bg-amber-50 hover:border-amber-300'
                }`}
                onClick={(e) => { e.stopPropagation(); onAddToCart(book); }}
              />
            </Tooltip>
          </div>

        </div>

      </div>

    </div>
  );
}
