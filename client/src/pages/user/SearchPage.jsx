import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Input, 
  Select, 
  Checkbox, 
  Radio, 
  Slider, 
  Rate, 
  Button, 
  Tag, 
  Pagination, 
  Empty, 
  Drawer, 
  Spin, 
  Tooltip,
  Breadcrumb
} from 'antd';
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  RotateCcw, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Star, 
  Eye, 
  ShoppingBag, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Layers, 
  Flame, 
  ShieldCheck,
  FileCheck,
  TrendingUp,
  Feather,
  Compass,
  Cpu,
  ArrowRight
} from 'lucide-react';

import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import BookCard from '../../components/BookCard';
import { useRentalCart } from '../../context/rentalCartContext';
import { getAllBooksPublicApi, getCategoriesPublicApi } from '../../api/bookAdmin.api';
import { getAllDigitalDocsPublicApi } from '../../api/digitalDocReader.api';

const quickKeywords = [
  'Clean Code',
  'Đắc Nhân Tâm',
  'Kinh Tế',
  'Đồ Án Tốt Nghiệp',
  'Trí Tuệ Nhân Tạo',
  'Nhà Giả Kim',
  'Tâm Lý Học',
  'Lập Trình Web'
];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartItems, addToCart } = useRentalCart();

  // State from URL
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const docTypeParam = searchParams.get('type') || 'all'; // all | physical | digital
  const inStockParam = searchParams.get('inStock') === 'true';
  const ratingParam = Number(searchParams.get('rating')) || 0;
  const sortParam = searchParams.get('sort') || 'popular';
  const maxDepositParam = Number(searchParams.get('maxDeposit')) || 300000;

  // Local Component States
  const [searchText, setSearchText] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [docType, setDocType] = useState(docTypeParam);
  const [inStockOnly, setInStockOnly] = useState(inStockParam);
  const [minRating, setMinRating] = useState(ratingParam);
  const [maxDeposit, setMaxDeposit] = useState(maxDepositParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data States
  const [books, setBooks] = useState([]);
  const [digitalDocs, setDigitalDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronize local states when searchParams change
  useEffect(() => {
    setSearchText(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setDocType(searchParams.get('type') || 'all');
    setInStockOnly(searchParams.get('inStock') === 'true');
    setMinRating(Number(searchParams.get('rating')) || 0);
    setSortBy(searchParams.get('sort') || 'popular');
    if (searchParams.get('maxDeposit')) {
      setMaxDeposit(Number(searchParams.get('maxDeposit')));
    }
  }, [searchParams]);

  // Fetch Books, Categories & Digital Documents
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [booksRes, catsRes, docsRes] = await Promise.all([
          getAllBooksPublicApi({ limit: 100 }),
          getCategoriesPublicApi(),
          getAllDigitalDocsPublicApi()
        ]);

        // Process Physical Books
        const realBooks = booksRes.metadata?.books || (Array.isArray(booksRes.metadata) ? booksRes.metadata : (booksRes.data?.books || booksRes.data || []));
        if (Array.isArray(realBooks)) {
          const formatted = realBooks.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author || 'Tác giả',
            category: b.categoryId || b.category || 'all',
            categoryName: b.Category?.name || b.categoryName || 'Tủ Sách Thư Viện',
            cover: b.cover || b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
            rating: Number(b.rating) || 4.9,
            reviewsCount: b.reviewsCount || 24,
            available: b.availableCopies !== undefined ? b.availableCopies : (b.totalCopies || 0),
            depositPrice: b.deposit || 100000,
            badge: b.isFeatured ? 'NỔI BẬT' : 'SÁCH IN',
            badgeColor: 'bg-amber-600 text-white',
            description: b.description || 'Tài liệu học tập & nghiên cứu tại Thư viện.',
            isDigital: false,
          }));
          setBooks(formatted);
        } else {
          setBooks([]);
        }

        // Process Categories
        const realCats = catsRes.metadata || catsRes.data || [];
        setCategories(Array.isArray(realCats) ? realCats : []);

        // Process Digital Documents
        const realDocs = docsRes.metadata?.docs || docsRes.metadata || docsRes.data?.docs || docsRes.data || [];
        if (Array.isArray(realDocs)) {
          const formattedDocs = realDocs.map(d => ({
            id: d.id,
            title: d.title,
            author: d.author || d.advisor || 'Tác giả đồ án',
            category: d.category || 'cong-nghe',
            categoryName: d.category === 'luan-van' ? 'Luận Văn Thạc Sĩ' : 'Đồ Án Tốt Nghiệp',
            cover: d.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
            rating: 5.0,
            reviewsCount: d.viewCount || 88,
            available: 999, // unlimited digital copies
            price: Number(d.price) || 0,
            depositPrice: Number(d.price) || 0,
            badge: d.docType === 'thesis' ? 'ĐỒ ÁN' : 'TÀI LIỆU SỐ',
            badgeColor: 'bg-purple-600 text-white',
            description: d.description || d.abstract || 'Tài liệu số đọc thử 5 trang PDF miễn phí.',
            isDigital: true,
            pdfFile: d.pdfFile,
          }));
          setDigitalDocs(formattedDocs);
        } else {
          setDigitalDocs([]);
        }
      } catch (err) {
        console.error('Fetch search data error:', err);
        setBooks([]);
        setCategories([]);
        setDigitalDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update URL search parameters
  const updateParams = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '' || val === 'all' || val === 0 || val === false) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    setSearchParams(next);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateParams({ q: searchText });
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
    setDocType('all');
    setInStockOnly(false);
    setMinRating(0);
    setMaxDeposit(300000);
    setSortBy('popular');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Combine items according to docType
  const allCombinedItems = useMemo(() => {
    if (docType === 'physical') return books;
    if (docType === 'digital') return digitalDocs;
    return [...books, ...digitalDocs];
  }, [books, digitalDocs, docType]);

  // Filter Items
  const filteredItems = useMemo(() => {
    return allCombinedItems.filter(item => {
      // 1. Text Search Filter
      const q = searchText.trim().toLowerCase();
      const matchText = !q || 
        item.title?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      // 2. Category Filter
      const matchCategory = selectedCategory === 'all' || 
        item.category === selectedCategory || 
        item.categoryId === selectedCategory;

      // 3. In-Stock Filter
      const matchStock = !inStockOnly || item.available > 0;

      // 4. Rating Filter
      const matchRating = minRating === 0 || (item.rating || 0) >= minRating;

      // 5. Price / Deposit Filter
      const matchDeposit = maxDeposit >= 300000 || (item.depositPrice || 0) <= maxDeposit;

      return matchText && matchCategory && matchStock && matchRating && matchDeposit;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.depositPrice || 0) - (b.depositPrice || 0);
      if (sortBy === 'price-desc') return (b.depositPrice || 0) - (a.depositPrice || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      return (b.reviewsCount || 0) - (a.reviewsCount || 0); // popular
    });
  }, [allCombinedItems, searchText, selectedCategory, inStockOnly, minRating, maxDeposit, sortBy]);

  // Paginated Results
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const cartBookIds = useMemo(() => new Set(cartItems.map(item => item.id)), [cartItems]);

  // Active filter pills
  const activeFilters = useMemo(() => {
    const list = [];
    if (searchText) list.push({ key: 'q', label: `Từ khóa: "${searchText}"`, onRemove: () => { setSearchText(''); updateParams({ q: '' }); } });
    if (selectedCategory !== 'all') {
      const catObj = categories.find(c => (c.id || c.slug) === selectedCategory);
      list.push({ key: 'category', label: `Thể loại: ${catObj?.name || selectedCategory}`, onRemove: () => { setSelectedCategory('all'); updateParams({ category: 'all' }); } });
    }
    if (docType !== 'all') {
      list.push({ key: 'type', label: docType === 'physical' ? 'Loại: Sách In' : 'Loại: Tài Liệu Số', onRemove: () => { setDocType('all'); updateParams({ type: 'all' }); } });
    }
    if (inStockOnly) {
      list.push({ key: 'inStock', label: 'Chỉ còn sách trong kho', onRemove: () => { setInStockOnly(false); updateParams({ inStock: false }); } });
    }
    if (minRating > 0) {
      list.push({ key: 'rating', label: `Đánh giá: Từ ${minRating} sao`, onRemove: () => { setMinRating(0); updateParams({ rating: 0 }); } });
    }
    if (maxDeposit < 300000) {
      list.push({ key: 'deposit', label: `Tối đa: ${maxDeposit.toLocaleString()}đ`, onRemove: () => { setMaxDeposit(300000); updateParams({ maxDeposit: 300000 }); } });
    }
    return list;
  }, [searchText, selectedCategory, docType, inStockOnly, minRating, maxDeposit, categories]);

  // Filter Sidebar Content Component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2 font-black text-stone-900 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <span>Bộ Lọc Tìm Kiếm</span>
        </div>
        {activeFilters.length > 0 && (
          <button 
            onClick={handleResetFilters}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* 1. Document Type Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-stone-900 block">
          Loại Tài Liệu
        </label>
        <Radio.Group 
          value={docType} 
          onChange={(e) => {
            setDocType(e.target.value);
            updateParams({ type: e.target.value });
          }}
          className="flex flex-col gap-2"
        >
          <Radio value="all" className="text-xs font-bold text-stone-700">
            Tất cả tài liệu ({books.length + digitalDocs.length})
          </Radio>
          <Radio value="physical" className="text-xs font-bold text-stone-700">
            Sách in mượn đọc ({books.length})
          </Radio>
          <Radio value="digital" className="text-xs font-bold text-stone-700">
            Tài liệu số & Đồ án ({digitalDocs.length})
          </Radio>
        </Radio.Group>
      </div>

      {/* 2. Category Filter */}
      <div className="space-y-2.5 pt-3 border-t border-stone-100">
        <label className="text-xs font-black uppercase tracking-wider text-stone-900 block">
          Chuyên Ngành & Thể Loại
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
          <div 
            onClick={() => { setSelectedCategory('all'); updateParams({ category: 'all' }); }}
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              selectedCategory === 'all' ? 'bg-amber-500 text-stone-950 font-black' : 'hover:bg-stone-100 text-stone-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Tất cả chuyên ngành</span>
            </div>
            <span className="text-[10px] opacity-75">{allCombinedItems.length}</span>
          </div>

          {categories.map((cat) => {
            const isSel = selectedCategory === (cat.id || cat.slug);
            return (
              <div 
                key={cat.id || cat.slug}
                onClick={() => { 
                  const target = isSel ? 'all' : (cat.id || cat.slug);
                  setSelectedCategory(target); 
                  updateParams({ category: target }); 
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  isSel ? 'bg-amber-500 text-stone-950 font-black' : 'hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded object-cover shrink-0" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                  <span className="truncate">{cat.name}</span>
                </div>
                {cat.count !== undefined && (
                  <span className="text-[10px] opacity-75 font-mono">{cat.count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Availability Checkbox */}
      <div className="pt-3 border-t border-stone-100 space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-stone-900 block">
          Tình Trạng Kho Sách
        </label>
        <Checkbox 
          checked={inStockOnly}
          onChange={(e) => {
            setInStockOnly(e.target.checked);
            updateParams({ inStock: e.target.checked });
          }}
          className="text-xs font-bold text-stone-700"
        >
          Chỉ hiển thị sách còn sẵn trong kho
        </Checkbox>
      </div>

      {/* 4. Price & Deposit Filter */}
      <div className="pt-3 border-t border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-stone-900">
            Tiền Cọc / Phí Mua
          </label>
          <span className="text-xs font-black text-amber-700">
            {maxDeposit >= 300000 ? 'Tất cả mức giá' : `<= ${maxDeposit.toLocaleString()}đ`}
          </span>
        </div>
        <Slider 
          min={0} 
          max={300000} 
          step={20000}
          value={maxDeposit}
          onChange={setMaxDeposit}
          onChangeComplete={(val) => updateParams({ maxDeposit: val })}
        />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button 
            onClick={() => { setMaxDeposit(50000); updateParams({ maxDeposit: 50000 }); }}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              maxDeposit === 50000 ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            Dưới 50.000đ
          </button>
          <button 
            onClick={() => { setMaxDeposit(100000); updateParams({ maxDeposit: 100000 }); }}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              maxDeposit === 100000 ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            Dưới 100.000đ
          </button>
        </div>
      </div>

      {/* 5. Rating Filter */}
      <div className="pt-3 border-t border-stone-100 space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-stone-900 block">
          Đánh Giá Độc Giả
        </label>
        <div className="space-y-1.5">
          {[5, 4, 3].map((star) => (
            <div 
              key={star}
              onClick={() => {
                const target = minRating === star ? 0 : star;
                setMinRating(target);
                updateParams({ rating: target });
              }}
              className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-colors ${
                minRating === star ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Rate disabled defaultValue={star} className="text-amber-400 text-xs" />
                <span className="font-bold">Từ {star} sao</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
      {/* Top Headers */}
      <MainHeader />
      <CategoryNavbar />

      {/* Main Search Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { title: <Link to="/" className="text-stone-500 font-bold">Trang chủ</Link> },
            { title: <span className="text-amber-700 font-black">Tìm kiếm & Lọc nâng cao</span> },
          ]}
          className="text-xs font-semibold"
        />

        {/* HERO SEARCH BAR & QUICK TAGS */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Input
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm kiếm theo tên sách, tác giả, chuyên đề hoặc mã đồ án..."
                prefix={<Search className="w-5 h-5 text-amber-600 mr-2 stroke-[2.5]" />}
                allowClear
                className="rounded-2xl h-12 text-sm font-medium border-stone-200 focus:border-amber-500 shadow-2xs"
              />
            </div>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<Search className="w-4 h-4" />}
              className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 border-none font-black text-sm shadow-md"
            >
              Tìm Kiếm Ngay
            </Button>
          </form>

          {/* Quick Keyword Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Gợi ý:
            </span>
            {quickKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setSearchText(kw);
                  updateParams({ q: kw });
                }}
                className="text-xs font-bold bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-600 px-3 py-1 rounded-full border border-stone-200/80 transition-colors cursor-pointer"
              >
                #{kw}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID (Filters on Left, Results on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (Left 3.5 cols) */}
          <div className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs sticky top-24">
            <FilterSidebar />
          </div>

          {/* Search Results Area (Right 8.5 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Toolbar Header (Results Count, Active Pills, Sort & View Mode) */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Result headline count */}
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                    Kết Quả Tìm Kiếm Sách & Tài Liệu
                  </h1>
                  <p className="text-xs text-stone-500 font-medium">
                    Tìm thấy <strong className="text-amber-700">{filteredItems.length}</strong> kết quả phù hợp
                  </p>
                </div>

                {/* Controls: Mobile Filter Button, Sort Selector, View Mode */}
                <div className="flex items-center gap-3">
                  
                  {/* Mobile filter drawer trigger */}
                  <Button
                    icon={<SlidersHorizontal className="w-4 h-4 text-amber-600" />}
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden rounded-xl font-bold text-xs h-10 border-stone-200"
                  >
                    Bộ Lọc ({activeFilters.length})
                  </Button>

                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                    <span className="hidden sm:inline font-bold">Sắp xếp:</span>
                    <Select
                      value={sortBy}
                      onChange={(val) => {
                        setSortBy(val);
                        updateParams({ sort: val });
                      }}
                      className="w-40 text-xs font-bold"
                      options={[
                        { value: 'popular', label: 'Phổ biến nhất' },
                        { value: 'newest', label: 'Mới nhất' },
                        { value: 'price-asc', label: 'Giá cọc: Thấp -> Cao' },
                        { value: 'price-desc', label: 'Giá cọc: Cao -> Thấp' },
                        { value: 'rating', label: 'Đánh giá cao nhất' },
                      ]}
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-white shadow-xs text-amber-600' : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Chế độ lưới"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'list' ? 'bg-white shadow-xs text-amber-600' : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Chế độ danh sách"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Active Filter Tags */}
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">Đang lọc theo:</span>
                  {activeFilters.map((f) => (
                    <Tag
                      key={f.key}
                      closable
                      onClose={f.onRemove}
                      className="bg-amber-50 border-amber-300 text-amber-900 font-bold text-xs rounded-lg py-0.5 px-2.5"
                    >
                      {f.label}
                    </Tag>
                  ))}
                  <button 
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-stone-400 hover:text-amber-600 underline ml-2 cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>

            {/* Results Grid / List Rendering */}
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Spin size="large" />
                <p className="text-xs text-stone-500 font-bold">Đang tìm kiếm dữ liệu sách...</p>
              </div>
            ) : paginatedItems.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {paginatedItems.map((item) => {
                      if (item.isDigital) {
                        // Digital Document Card
                        return (
                          <div 
                            key={`digital-${item.id}`}
                            className="bg-white rounded-3xl border border-stone-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
                          >
                            {/* Media */}
                            <div 
                              className="relative aspect-3/4 bg-stone-100 overflow-hidden cursor-pointer"
                              onClick={() => navigate(`/digital-docs/${item.id}`)}
                            >
                              <img 
                                src={item.cover} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              <div className="absolute top-3 left-3 z-10">
                                <span className="bg-purple-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                                  {item.badge}
                                </span>
                              </div>
                              <div className="absolute bottom-3 left-3 z-10">
                                <span className="bg-stone-950/80 backdrop-blur-md text-cyan-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                                  Đọc thử 5 trang PDF
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                                  <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-lg text-[11px]">
                                    {item.categoryName}
                                  </span>
                                  <div className="flex items-center gap-1 font-extrabold text-stone-800">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                                    <span>5.0</span>
                                  </div>
                                </div>
                                <h3 
                                  onClick={() => navigate(`/digital-docs/${item.id}`)}
                                  className="font-black text-stone-900 text-base group-hover:text-purple-600 transition-colors line-clamp-2 cursor-pointer leading-snug mb-1"
                                >
                                  {item.title}
                                </h3>
                                <p className="text-xs text-stone-500 font-medium">
                                  Tác giả / GVHD: <span className="text-stone-800 font-bold">{item.author}</span>
                                </p>
                              </div>

                              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                                <div>
                                  <div className="text-[10px] font-bold text-stone-400 uppercase">Bản quyền số</div>
                                  <div className="text-sm font-black text-amber-900">
                                    {item.price > 0 ? `${item.price.toLocaleString()}đ` : 'Miễn phí'}
                                  </div>
                                </div>
                                <Button
                                  type="primary"
                                  icon={<Eye className="w-3.5 h-3.5" />}
                                  onClick={() => navigate(`/digital-docs/${item.id}`)}
                                  className="bg-purple-600 hover:bg-purple-700 font-bold text-xs rounded-xl border-none h-9 px-4"
                                >
                                  Đọc Thử
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Physical Book Card
                      return (
                        <BookCard
                          key={`book-${item.id}`}
                          book={item}
                          onQuickView={() => navigate(`/books/${item.id}`)}
                          onAddToCart={addToCart}
                          isBookInCart={cartBookIds.has(item.id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  // List View Mode
                  <div className="space-y-4">
                    {paginatedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-20 h-28 object-cover rounded-2xl border border-stone-200 shrink-0 cursor-pointer"
                            onClick={() => navigate(item.isDigital ? `/digital-docs/${item.id}` : `/books/${item.id}`)}
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                              <span className="text-xs font-bold text-stone-500">{item.categoryName}</span>
                            </div>
                            <h3 
                              onClick={() => navigate(item.isDigital ? `/digital-docs/${item.id}` : `/books/${item.id}`)}
                              className="font-black text-stone-900 text-base hover:text-amber-600 cursor-pointer line-clamp-1"
                            >
                              {item.title}
                            </h3>
                            <p className="text-xs text-stone-500 font-medium">
                              Tác giả: <span className="text-stone-800 font-bold">{item.author}</span>
                            </p>
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Action column */}
                        <div className="sm:text-right shrink-0 space-y-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          <div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase">
                              {item.isDigital ? 'Bản Quyền Số' : 'Tình Trạng Kho'}
                            </div>
                            <div className="text-sm font-black text-stone-900">
                              {item.isDigital ? (
                                item.price > 0 ? (
                                  <span className="text-amber-900">{item.price.toLocaleString()}đ</span>
                                ) : (
                                  <span className="text-emerald-700">Miễn Phí</span>
                                )
                              ) : (
                                <span className="text-emerald-700">Sẵn sàng mượn</span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="primary"
                            onClick={() => navigate(item.isDigital ? `/digital-docs/${item.id}` : `/books/${item.id}`)}
                            className="bg-amber-600 hover:bg-amber-700 font-bold text-xs rounded-xl w-full sm:w-auto"
                          >
                            Xem Chi Tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filteredItems.length > pageSize && (
                  <div className="flex justify-center pt-6">
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredItems.length}
                      onChange={setCurrentPage}
                      showSizeChanger={false}
                      className="custom-pagination font-bold text-xs"
                    />
                  </div>
                )}
              </>
            ) : (
              // Empty State
              <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center shadow-2xs space-y-4">
                <Empty
                  description={
                    <div className="space-y-1">
                      <div className="font-black text-stone-800 text-base">Không tìm thấy sách hoặc tài liệu phù hợp</div>
                      <div className="text-xs text-stone-400">
                        Vui lòng thử điều chỉnh lại từ khóa hoặc xóa bớt tiêu chí trong bộ lọc.
                      </div>
                    </div>
                  }
                />
                <Button 
                  onClick={handleResetFilters}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="rounded-xl font-bold text-xs bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                >
                  Xóa Tất Cả Bộ Lọc
                </Button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Mobile Filters Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2 font-black text-stone-900 text-base">
            <SlidersHorizontal className="w-5 h-5 text-amber-600" />
            <span>Bộ Lọc Nâng Cao</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileFilterOpen(false)}
        open={mobileFilterOpen}
        width={300}
      >
        <FilterSidebar />
      </Drawer>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SearchPage;
