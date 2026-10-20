import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpen, 
    Search, 
    ShoppingBag, 
    User, 
    Menu, 
    ChevronDown, 
    LogOut, 
    CreditCard, 
    ShieldCheck, 
    Wallet,
    GraduationCap,
    Star,
    ArrowRight,
    Sparkles,
    Layers,
    FileText,
    Eye,
    X,
    Bell,
    Clock,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { Select, Input, Badge, Dropdown, message, Tag, Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useRentalCart } from '../context/rentalCartContext';
import { useNotification } from '../context/NotificationContext';
import { getAllBooksPublicApi, getCategoriesPublicApi } from '../api/bookAdmin.api';
import { getAllDigitalDocsPublicApi } from '../api/digitalDocReader.api';
import ReaderCardModal from './card/ReaderCardModal';
import WalletDepositModal from './user/WalletDepositModal';

export default function MainHeader({
    cartCount,
    totalDailyPrice,
    onOpenCart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
}) {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const rentalCart = useRentalCart ? useRentalCart() : null;
    const activeCartCount = cartCount !== undefined ? cartCount : (rentalCart?.totalItems || 0);

    const notificationContext = useNotification ? useNotification() : null;
    const unreadNotifsCount = notificationContext?.unreadCount || 0;
    const notifList = notificationContext?.notifications || [];
    const markAsRead = notificationContext?.markAsRead || (() => {});
    const markAllAsRead = notificationContext?.markAllAsRead || (() => {});

    const [cardModalVisible, setCardModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);

    // Live search states
    const [internalQuery, setInternalQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchableBooks, setSearchableBooks] = useState([]);
    const [searchableDocs, setSearchableDocs] = useState([]);
    const [searchCategories, setSearchCategories] = useState([]);
    const searchContainerRef = useRef(null);

    const effectiveQuery = searchQuery !== undefined ? searchQuery : internalQuery;

    const handleQueryChange = (val) => {
        if (setSearchQuery) {
            setSearchQuery(val);
        } else {
            setInternalQuery(val);
        }
        if (val.trim().length > 0) {
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    };

    // Fetch live search index on mount
    useEffect(() => {
        let isMounted = true;
        const fetchSearchData = async () => {
            try {
                const [booksRes, docsRes, catsRes] = await Promise.all([
                    getAllBooksPublicApi({ limit: 100 }).catch(() => null),
                    getAllDigitalDocsPublicApi().catch(() => null),
                    getCategoriesPublicApi().catch(() => null)
                ]);

                if (!isMounted) return;

                const realBooks = booksRes?.metadata?.books || (Array.isArray(booksRes?.metadata) ? booksRes?.metadata : (booksRes?.data?.books || booksRes?.data || []));
                setSearchableBooks(Array.isArray(realBooks) ? realBooks : []);

                const realDocs = docsRes?.metadata?.docs || docsRes?.metadata || docsRes?.data?.docs || docsRes?.data || [];
                setSearchableDocs(Array.isArray(realDocs) ? realDocs : []);

                const realCats = catsRes?.metadata || catsRes?.data || [];
                setSearchCategories(Array.isArray(realCats) ? realCats : []);
            } catch (err) {
                console.error('Failed to load search data:', err);
                if (isMounted) {
                    setSearchableBooks([]);
                    setSearchableDocs([]);
                    setSearchCategories([]);
                }
            }
        };
        fetchSearchData();
        return () => { isMounted = false; };
    }, []);

    // Close live search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter matching books
    const matchingBooks = useMemo(() => {
        const q = effectiveQuery.trim().toLowerCase();
        if (!q) return [];
        return searchableBooks.filter(b => {
            const matchCategory = !selectedCategory || selectedCategory === 'all' || 
                                  b.categoryId === selectedCategory || 
                                  b.category === selectedCategory;
            const matchText = b.title?.toLowerCase().includes(q) || 
                              b.author?.toLowerCase().includes(q) ||
                              b.categoryName?.toLowerCase().includes(q);
            return matchCategory && matchText;
        }).slice(0, 4);
    }, [searchableBooks, effectiveQuery, selectedCategory]);

    // Filter matching digital documents
    const matchingDocs = useMemo(() => {
        const q = effectiveQuery.trim().toLowerCase();
        if (!q) return [];
        return searchableDocs.filter(d => 
            d.title?.toLowerCase().includes(q) ||
            d.author?.toLowerCase().includes(q) ||
            d.advisor?.toLowerCase().includes(q) ||
            d.docCode?.toLowerCase().includes(q) ||
            d.category?.toLowerCase().includes(q)
        ).slice(0, 3);
    }, [searchableDocs, effectiveQuery]);

    // Filter matching categories
    const matchingCategories = useMemo(() => {
        const q = effectiveQuery.trim().toLowerCase();
        if (!q) return [];
        return searchCategories.filter(c => c.name?.toLowerCase().includes(q)).slice(0, 3);
    }, [searchCategories, effectiveQuery]);

    const totalMatches = matchingBooks.length + matchingDocs.length + matchingCategories.length;

    const handleOpenCard = () => {
        if (!isAuthenticated) {
            message.info('Vui lòng đăng nhập để đăng ký và xem Thẻ thư viện!');
            navigate('/auth');
            return;
        }
        setCardModalVisible(true);
    };

    const handleSelectBook = (bookId) => {
        setIsDropdownOpen(false);
        navigate(`/books/${bookId}`);
    };

    const handleSelectDoc = (docId) => {
        setIsDropdownOpen(false);
        navigate(`/digital-docs/${docId}`);
    };

    const handleSelectCategory = (catId) => {
        setIsDropdownOpen(false);
        if (setSelectedCategory) setSelectedCategory(catId);
        navigate(`/search?category=${catId}`);
    };

    const handleViewAllResults = (e) => {
        if (e) e.preventDefault();
        setIsDropdownOpen(false);
        const params = new URLSearchParams();
        if (effectiveQuery) params.set('q', effectiveQuery);
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        navigate(`/search?${params.toString()}`);
    };

    const accountMenuItems = isAuthenticated
        ? [
              {
                  key: 'user-info',
                  label: (
                      <div className="py-1">
                          <div className="font-bold text-stone-900">{user?.fullName || 'Người dùng'}</div>
                          <div className="text-xs text-stone-400">{user?.email}</div>
                      </div>
                  ),
              },
              { type: 'divider' },
              {
                  key: 'deposit',
                  label: (
                      <div className="flex items-center justify-between gap-3 font-bold text-amber-900 py-0.5" onClick={() => setDepositModalVisible(true)}>
                          <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-emerald-600" />
                              <span>Ví cọc: {(user?.walletBalance || 0).toLocaleString()}đ</span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Nạp ví</span>
                      </div>
                  ),
              },
              {
                  key: 'my-profile',
                  label: (
                      <div
                          className="flex items-center gap-2 font-extrabold text-stone-900 py-0.5"
                          onClick={() => navigate('/profile')}
                      >
                          <User className="w-4 h-4 text-amber-600" />
                          <span>Trang cá nhân của tôi</span>
                      </div>
                  ),
              },
              {
                  key: 'my-card',
                  label: (
                      <div className="flex items-center gap-2 font-bold text-amber-700 py-0.5" onClick={handleOpenCard}>
                          <CreditCard className="w-4 h-4" />
                          <span>Thẻ thư viện của tôi</span>
                      </div>
                  ),
              },
              {
                  key: 'my-rentals',
                  label: (
                      <div
                          className="flex items-center gap-2 font-bold text-stone-800 py-0.5"
                          onClick={() => navigate('/my-rentals')}
                      >
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <span>Sổ mượn sách của tôi</span>
                      </div>
                  ),
              },
              ...(user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin
                  ? [
                        {
                            key: 'admin-portal',
                            label: (
                                <div
                                    className="flex items-center gap-2 font-black text-amber-600 py-0.5"
                                    onClick={() => navigate('/admin')}
                                >
                                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                                    <span>Trang Quản Trị Thư Viện</span>
                                </div>
                            ),
                        },
                    ]
                  : []),
              { type: 'divider' },
              {
                  key: 'logout',
                  label: (
                      <div className="text-red-600 font-semibold flex items-center gap-1.5 py-0.5" onClick={logout}>
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                      </div>
                  ),
              },
          ]
        : [
              {
                  key: 'auth',
                  label: (
                      <div
                          className="text-amber-600 font-bold flex items-center justify-between py-1 cursor-pointer"
                          onClick={() => navigate('/auth')}
                      >
                          <span>Đăng nhập / Đăng ký</span>
                      </div>
                  ),
              },
          ];

    return (
        <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                        if (setSelectedCategory) setSelectedCategory('all');
                        if (setSearchQuery) setSearchQuery('');
                        navigate('/');
                    }}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                        <Link to="/" className="flex items-center gap-1.5">
                            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-stone-900 font-sans">
                                Thư Viện<span className="text-amber-600"> Sách</span>
                            </span>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                PRO
                            </span>
                        </Link>
                        <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                            Hệ Thống Thư Viện Sách & Tài Liệu Số
                        </p>
                    </div>
                </div>

                {/* SEARCH BAR CONTAINER WITH INSTANT LIVE DROPDOWN */}
                <div ref={searchContainerRef} className="relative hidden lg:flex flex-1 max-w-2xl">
                    <form 
                        onSubmit={handleViewAllResults}
                        className="flex items-center w-full bg-stone-100 rounded-2xl p-1 border border-stone-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:bg-white transition-all shadow-2xs"
                    >
                        <Select
                            value={selectedCategory || 'all'}
                            onChange={(val) => {
                                if (setSelectedCategory) setSelectedCategory(val);
                            }}
                            variant="borderless"
                            className="w-40 text-stone-700 font-bold text-xs"
                            options={searchCategories.map((cat) => ({
                                value: cat.id || cat.slug || cat.name,
                                label: cat.name,
                            }))}
                        />
                        <div className="h-6 w-px bg-stone-300 mx-1 shrink-0" />
                        <Input
                            value={effectiveQuery}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            onFocus={() => {
                                if (effectiveQuery.trim().length > 0) setIsDropdownOpen(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsDropdownOpen(false);
                            }}
                            placeholder="Tìm tên sách, tác giả, đề tài đồ án, ISBN..."
                            variant="borderless"
                            className="flex-1 text-stone-800 placeholder:text-stone-400 text-xs font-semibold"
                        />
                        {effectiveQuery && (
                            <button
                                type="button"
                                onClick={() => handleQueryChange('')}
                                className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer mr-1"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
                            aria-label="Tìm kiếm"
                        >
                            <Search className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </form>

                    {/* FLOATING LIVE SEARCH POPUP DROPDOWN (UNDER THE SEARCH BAR) */}
                    {isDropdownOpen && effectiveQuery.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-stone-200/90 shadow-2xl z-50 overflow-hidden font-sans divide-y divide-stone-100 max-h-[520px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                            
                            {/* Matching Categories Quick Row */}
                            {matchingCategories.length > 0 && (
                                <div className="p-3 bg-amber-50/50">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Chuyên Ngành Khớp</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {matchingCategories.map(cat => (
                                            <button
                                                key={cat.id || cat.slug || cat.name}
                                                onClick={() => handleSelectCategory(cat.id || cat.slug || cat.name)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 text-xs font-bold text-stone-800 hover:text-amber-800 shadow-2xs transition-colors cursor-pointer"
                                            >
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded object-cover" />
                                                ) : (
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                                )}
                                                <span>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Matching Physical Books Section */}
                            {matchingBooks.length > 0 && (
                                <div className="p-3 space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 px-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-stone-600">
                                            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Sách In Mượn Đọc ({matchingBooks.length})</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        {matchingBooks.map((b) => (
                                            <div
                                                key={`live-book-${b.id}`}
                                                onClick={() => handleSelectBook(b.id)}
                                                className="group flex items-center justify-between p-2 rounded-2xl hover:bg-amber-50/60 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 pr-3">
                                                    <img
                                                        src={b.coverImage || b.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'}
                                                        alt={b.title}
                                                        className="w-10 h-14 object-cover rounded-xl border border-stone-200 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="min-w-0 space-y-0.5">
                                                        <h4 className="font-bold text-stone-900 text-xs truncate group-hover:text-amber-600 transition-colors">
                                                            {b.title}
                                                        </h4>
                                                        <p className="text-[11px] text-stone-500 truncate">
                                                            Tác giả: <span className="text-stone-700 font-medium">{b.author || 'Tác giả'}</span>
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <span className="bg-stone-100 text-stone-600 font-semibold px-2 py-0.2 rounded-md">
                                                                {b.categoryName || 'Tủ sách'}
                                                            </span>
                                                            <span className="text-emerald-700 font-extrabold">
                                                                Còn {b.availableCopies !== undefined ? b.availableCopies : (b.available || 5)} cuốn
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                                                    <span className="hidden sm:inline text-[11px]">Xem sách</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Matching Digital Docs Section */}
                            {matchingDocs.length > 0 && (
                                <div className="p-3 space-y-2 bg-purple-50/20">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 px-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-purple-900">
                                            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                                            <span>Tài Liệu Số & Đồ Án ({matchingDocs.length})</span>
                                        </div>
                                        <span className="text-purple-700 font-bold">Đọc 5 trang miễn phí</span>
                                    </div>

                                    <div className="space-y-1">
                                        {matchingDocs.map((d) => (
                                            <div
                                                key={`live-doc-${d.id}`}
                                                onClick={() => handleSelectDoc(d.id)}
                                                className="group flex items-center justify-between p-2 rounded-2xl hover:bg-purple-50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 pr-3">
                                                    <img
                                                        src={d.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=100&q=80'}
                                                        alt={d.title}
                                                        className="w-10 h-14 object-cover rounded-xl border border-stone-200 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="min-w-0 space-y-0.5">
                                                        <h4 className="font-bold text-stone-900 text-xs truncate group-hover:text-purple-600 transition-colors">
                                                            {d.title}
                                                        </h4>
                                                        <p className="text-[11px] text-stone-500 truncate">
                                                            Mã: <span className="font-mono font-bold text-stone-700">{d.docCode || 'THESIS'}</span> • {d.author || d.advisor || 'Đề tài'}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.2 rounded-md">
                                                                {d.documentType === 'thesis' ? 'Đồ Án' : 'Tài Liệu Số'}
                                                            </span>
                                                            <span className="text-stone-700 font-bold">
                                                                {d.price > 0 ? `${Number(d.price).toLocaleString()}đ` : 'Miễn Phí'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                                                    <span className="hidden sm:inline text-[11px]">Đọc thử</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Direct Match */}
                            {totalMatches === 0 && (
                                <div className="p-6 text-center space-y-2">
                                    <div className="text-xs font-bold text-stone-700">
                                        Không tìm thấy kết quả nhanh khớp với "<strong>{effectiveQuery}</strong>"
                                    </div>
                                    <p className="text-[11px] text-stone-400">
                                        Nhấn Enter hoặc bấm nút Tìm Kiếm để mở trang tra cứu nâng cao kèm bộ lọc.
                                    </p>
                                </div>
                            )}

                            {/* Bottom Bar: Go to full search page */}
                            <div className="p-3 bg-stone-50 flex items-center justify-between">
                                <span className="text-[11px] text-stone-500 font-medium pl-2">
                                    Nhấn <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-mono text-[10px] font-bold text-stone-700 shadow-2xs">Enter</kbd> để tìm kiếm đầy đủ
                                </span>
                                <button
                                    onClick={handleViewAllResults}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                                >
                                    <span>Xem tất cả kết quả & Lọc</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                        </div>
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* WALLET DEPOSIT QUICK BUTTON */}
                    {isAuthenticated && (
                        <button
                            onClick={() => setDepositModalVisible(true)}
                            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all cursor-pointer font-bold text-xs shadow-2xs"
                            title="Nạp số dư ví cọc"
                        >
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            <span>Ví cọc:</span>
                            <span className="font-extrabold text-emerald-700">{(user?.walletBalance || 0).toLocaleString()}đ</span>
                        </button>
                    )}

                    {/* READER CARD STATUS / REGISTER BUTTON */}
                    <button
                        onClick={handleOpenCard}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer font-bold text-xs shadow-2xs ${
                            user?.cardStatus === 'active'
                                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                        title="Đăng ký & Xem Thẻ Thư Viện"
                    >
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <span className="hidden sm:inline">
                            {user?.cardStatus === 'active' ? 'Thẻ Đã Kích Hoạt' : 'Thẻ Thư Viện'}
                        </span>
                    </button>

                    {/* Notification Bell Dropdown */}
                    {isAuthenticated && (
                        <Dropdown
                            dropdownRender={() => (
                                <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden font-sans">
                                    <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-amber-400" />
                                            <span className="font-black text-sm">Thông Báo Của Bạn</span>
                                            {unreadNotifsCount > 0 && (
                                                <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                                                    {unreadNotifsCount} mới
                                                </span>
                                            )}
                                        </div>
                                        {unreadNotifsCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer transition-colors"
                                            >
                                                Đã đọc tất cả
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 custom-scrollbar">
                                        {notifList.length === 0 ? (
                                            <div className="p-8 text-center text-stone-400 text-xs font-bold">
                                                Bạn chưa có thông báo nào!
                                            </div>
                                        ) : (
                                            notifList.slice(0, 6).map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => {
                                                        if (!notif.isRead) markAsRead(notif.id);
                                                        if (notif.link) navigate(notif.link);
                                                    }}
                                                    className={`p-3.5 hover:bg-stone-50 transition-colors cursor-pointer flex items-start gap-3 ${
                                                        notif.isRead ? 'opacity-80' : 'bg-amber-50/40'
                                                    }`}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" style={{ opacity: notif.isRead ? 0 : 1 }} />
                                                    <div className="min-w-0 flex-1 space-y-0.5">
                                                        <h5 className="font-bold text-stone-900 text-xs truncate">
                                                            {notif.title}
                                                        </h5>
                                                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] text-stone-400 font-medium block pt-0.5">
                                                            {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
                                        <button
                                            onClick={() => navigate('/notifications')}
                                            className="text-xs font-extrabold text-amber-700 hover:text-amber-800 cursor-pointer"
                                        >
                                            Xem tất cả thông báo &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <button
                                className="relative p-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                                title="Thông báo"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadNotifsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                        {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                                    </span>
                                )}
                            </button>
                        </Dropdown>
                    )}

                    {/* Rental Cart Icon */}
                    <button
                        onClick={onOpenCart}
                        className="relative p-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                        title="Giỏ mượn sách"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {activeCartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                {activeCartCount}
                            </span>
                        )}
                    </button>

                    {/* User Profile Dropdown */}
                    <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="bottomRight">
                        <button className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer">
                            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-extrabold text-xs">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-bold text-stone-800 hidden md:block max-w-[100px] truncate">
                                {user?.fullName ? user.fullName.split(' ').pop() : 'Tài khoản'}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                        </button>
                    </Dropdown>
                </div>
            </div>

            {/* Reader Card Modal */}
            <ReaderCardModal
                visible={cardModalVisible}
                onClose={() => setCardModalVisible(false)}
            />

            {/* Wallet Deposit Modal */}
            <WalletDepositModal
                visible={depositModalVisible}
                onClose={() => setDepositModalVisible(false)}
            />
        </header>
    );
}
