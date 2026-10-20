import React, { useState, useMemo } from 'react';
import { Select, Empty, Pagination, Spin } from 'antd';
import { 
  SlidersHorizontal, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Feather, 
  TrendingUp, 
  Compass, 
  Cpu, 
  Code, 
  Brain, 
  Atom, 
  ChevronRight,
  Flame,
  Loader2
} from 'lucide-react';
import BookCard from './BookCard';

// Helper to get matching icon for category
const getCategoryIcon = (id, name = '') => {
  const lower = (id + ' ' + name).toLowerCase();
  if (lower.includes('all') || lower.includes('tất cả')) return Layers;
  if (lower.includes('van') || lower.includes('văn') || lower.includes('thơ')) return Feather;
  if (lower.includes('kinh') || lower.includes('tài chính') || lower.includes('doanh')) return TrendingUp;
  if (lower.includes('kỹ năng') || lower.includes('ky-nang')) return Compass;
  if (lower.includes('lập trình') || lower.includes('lap-trinh') || lower.includes('code')) return Code;
  if (lower.includes('công nghệ') || lower.includes('cong-nghe') || lower.includes('ai')) return Cpu;
  if (lower.includes('khoa học') || lower.includes('khoa-hoc')) return Atom;
  if (lower.includes('tâm lý') || lower.includes('tam-ly')) return Brain;
  return BookOpen;
};

export default function BookCatalog({ 
  books = [], 
  categories = [],
  selectedCategory, 
  setSelectedCategory, 
  searchQuery,
  loading = false,
  onQuickView,
  onAddToCart,
  cartItems = []
}) {
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Build active categories list with 'Tất cả' as the first item
  const activeCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const totalAllCount = list.reduce((sum, c) => sum + (c.count || 0), 0);
    const hasAll = list.some(c => c.id === 'all');
    if (!hasAll) {
      return [{ id: 'all', name: 'Tất cả chuyên ngành', count: totalAllCount || books.length }, ...list];
    }
    return list;
  }, [categories, books.length]);

  // Filter books based on category & search query
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const sel = String(selectedCategory || 'all').trim().toLowerCase();
      const matchCategory = sel === 'all' || 
        String(book.categoryId || '').trim().toLowerCase() === sel ||
        String(book.category || '').trim().toLowerCase() === sel ||
        String(book.categoryName || '').trim().toLowerCase() === sel ||
        String(book.categorySlug || '').trim().toLowerCase() === sel;

      const q = String(searchQuery || '').trim().toLowerCase();
      const matchSearch = !q || 
        book.title?.toLowerCase().includes(q) ||
        book.author?.toLowerCase().includes(q) ||
        book.categoryName?.toLowerCase().includes(q) ||
        book.isbn?.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.rentalPricePerDay || 0) - (b.rentalPricePerDay || 0);
      if (sortBy === 'price-desc') return (b.rentalPricePerDay || 0) - (a.rentalPricePerDay || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.reviewsCount || 0) - (a.reviewsCount || 0); // popular
    });
  }, [books, selectedCategory, searchQuery, sortBy]);

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage]);

  const cartBookIds = useMemo(() => new Set(cartItems.map(item => item.id)), [cartItems]);

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto font-sans" id="best-seller">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Kho Tủ Sách Thư Viện</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight font-sans">
            Khám Phá Sách Mượn Được Yêu Thích
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Miễn phí 100% phí mượn hàng ngày dành cho độc giả có Thẻ thư viện.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold pl-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>Sắp xếp:</span>
          </div>
          <Select
            value={sortBy}
            onChange={setSortBy}
            className="w-44 text-xs font-bold"
            options={[
              { value: 'popular', label: 'Thuê nhiều nhất' },
              { value: 'price-asc', label: 'Giá cọc: Thấp đến Cao' },
              { value: 'price-desc', label: 'Giá cọc: Cao đến Thấp' },
              { value: 'rating', label: 'Đánh giá cao nhất' },
            ]}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-3 pt-1 px-1">
          {activeCategories.map(cat => {
            const catKey = cat.id || cat.slug || cat.name;
            const isSelected = selectedCategory === catKey || 
                               (cat.id && selectedCategory === cat.id) ||
                               (cat.slug && selectedCategory === cat.slug) ||
                               (cat.name && selectedCategory === cat.name);
            const CategoryIcon = getCategoryIcon(catKey, cat.name);

            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setCurrentPage(1);
                }}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 shrink-0 cursor-pointer text-xs font-black ${
                  isSelected
                    ? 'bg-stone-950 text-white border-stone-950 shadow-lg shadow-stone-950/20 scale-[1.03]'
                    : 'bg-white hover:bg-amber-50/60 text-stone-700 hover:text-amber-900 border-stone-200 hover:border-amber-300 shadow-2xs'
                }`}
              >
                {/* Image thumbnail or Icon Graphic */}
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-7 h-7 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs" 
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    isSelected ? 'bg-amber-500 text-stone-950' : 'bg-amber-100/80 text-amber-800 group-hover:scale-110'
                  }`}>
                    <CategoryIcon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}

                {/* Category Name */}
                <span className="tracking-tight whitespace-nowrap">
                  {cat.name}
                </span>

                {/* Count Badge */}
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-0.5 ${
                    isSelected 
                      ? 'bg-amber-500 text-stone-950' 
                      : 'bg-stone-100 text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-800'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center shadow-2xs my-8 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <div className="text-xs font-bold text-stone-500 mt-2">Đang tải danh sách sách từ Thư viện...</div>
        </div>
      ) : paginatedBooks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {paginatedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                isBookInCart={cartBookIds.has(book.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredBooks.length > pageSize && (
            <div className="flex justify-center pt-4">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredBooks.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                className="custom-pagination font-bold text-xs"
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center shadow-2xs my-8">
          <Empty 
            description={
              <div className="space-y-1">
                <div className="font-extrabold text-stone-800 text-sm">Không tìm thấy cuốn sách nào phù hợp</div>
                <div className="text-xs text-stone-400">Vui lòng thử chọn thể loại khác hoặc từ khóa tìm kiếm mới</div>
              </div>
            } 
          />
        </div>
      )}

    </section>
  );
}
