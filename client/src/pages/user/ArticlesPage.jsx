import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Newspaper,
    Calendar,
    Sparkles,
    Search,
    Clock,
    Eye,
    Tag,
    ChevronRight,
    ArrowRight,
    Filter,
    Layers,
    FileText,
    Share2,
    BookOpen,
    GraduationCap,
    BellRing,
} from 'lucide-react';
import { Input, Pagination, Spin, Empty, Tag as AntTag } from 'antd';
import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import { getAllArticlesPublicApi } from '../../api/article.api';

const categoryMap = {
    all: { label: 'Tất Cả Bài Viết', color: 'stone', icon: Layers },
    news: { label: 'Tin Tức Thư Viện', color: 'blue', icon: Newspaper },
    notice: { label: 'Thông Báo Chính Thức', color: 'rose', icon: BellRing },
    event: { label: 'Sự Kiện & Hội Thảo', color: 'amber', icon: Calendar },
    guide: { label: 'Hướng Dẫn Bạn Đọc', color: 'emerald', icon: BookOpen },
};

export function ArticlesPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchArticles = async (page = 1, cat = selectedCategory, search = searchQuery) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 9,
                status: 'published',
            };
            if (cat && cat !== 'all') params.category = cat;
            if (search && search.trim()) params.search = search.trim();

            const res = await getAllArticlesPublicApi(params);
            const data = res.metadata || res.data || {};
            setArticles(data.articles || []);
            setTotal(data.total || 0);
            setCurrentPage(data.page || 1);
        } catch (err) {
            console.error('Fetch articles error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(1, selectedCategory, searchQuery);
    }, [selectedCategory]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchArticles(1, selectedCategory, searchQuery);
    };

    const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            <TopHeader />
            <MainHeader />
            <CategoryNavbar />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white py-14 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>Bản Tin & Sự Kiện Thư Viện Đại Học</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-stone-100 leading-tight">
                        Tin Tức, Thông Báo & Sự Kiện Học Thuật
                    </h1>
                    <p className="text-stone-300 text-xs md:text-sm max-w-2xl leading-relaxed">
                        Khám phá các hoạt động văn hóa đọc, thông báo lịch phục vụ, cẩm nang tra cứu và hội thảo khoa học mới nhất từ Thư viện.
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10 flex-1 w-full">
                {/* FEATURED HERO ARTICLE (if available) */}
                {featuredArticle && !searchQuery && selectedCategory === 'all' && (
                    <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-0 group">
                        <div className="md:col-span-7 aspect-[16/10] md:aspect-auto overflow-hidden relative">
                            <img
                                src={featuredArticle.thumbnail}
                                alt={featuredArticle.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                                TIN NỔI BẬT
                            </div>
                        </div>

                        <div className="md:col-span-5 p-6 md:p-10 flex flex-col justify-between space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs text-stone-400 font-bold">
                                    <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                                        {categoryMap[featuredArticle.category]?.label || 'Tin tức'}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('vi-VN')}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" /> {featuredArticle.views || 0}
                                    </span>
                                </div>

                                <h2 className="text-xl md:text-2xl font-black text-stone-900 leading-snug group-hover:text-amber-700 transition-colors line-clamp-3">
                                    <Link to={`/articles/${featuredArticle.slug}`}>
                                        {featuredArticle.title}
                                    </Link>
                                </h2>

                                <p className="text-xs md:text-sm text-stone-600 line-clamp-4 leading-relaxed">
                                    {featuredArticle.summary}
                                </p>
                            </div>

                            <Link
                                to={`/articles/${featuredArticle.slug}`}
                                className="inline-flex items-center gap-2 text-xs font-black text-amber-700 hover:text-amber-800 transition-colors"
                            >
                                <span>Đọc chi tiết toàn văn</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* FILTER BAR & SEARCH */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                        {Object.entries(categoryMap).map(([key, item]) => {
                            const Icon = item.icon;
                            const isActive = selectedCategory === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedCategory(key);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 shrink-0">
                        <Input
                            placeholder="Tìm kiếm tin tức, thông báo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                            className="rounded-xl h-10 text-xs w-full md:w-64"
                            allowClear
                        />
                        <button
                            type="submit"
                            className="px-4 h-10 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer"
                        >
                            Tìm
                        </button>
                    </form>
                </div>

                {/* ARTICLES GRID */}
                {loading ? (
                    <div className="py-20 text-center">
                        <Spin size="large" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center">
                        <Empty description="Chưa có bài viết nào phù hợp với bộ lọc này!" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {articles.map((article) => {
                            const cat = categoryMap[article.category] || categoryMap.news;
                            return (
                                <article
                                    key={article.id}
                                    className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <Link to={`/articles/${article.slug}`} className="block h-48 overflow-hidden relative">
                                        <img
                                            src={article.thumbnail}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-stone-700">
                                            {cat.label}
                                        </span>
                                    </Link>

                                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-[11px] text-stone-400 font-bold">
                                                <span>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {article.views || 0}
                                                </span>
                                            </div>

                                            <h3 className="font-black text-sm md:text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                                                <Link to={`/articles/${article.slug}`}>
                                                    {article.title}
                                                </Link>
                                            </h3>

                                            <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                                                {article.summary}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-stone-400">
                                                {article.author || 'Thư viện'}
                                            </span>
                                            <Link
                                                to={`/articles/${article.slug}`}
                                                className="text-xs font-black text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                                            >
                                                <span>Chi tiết</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {total > 9 && (
                    <div className="flex justify-center pt-6">
                        <Pagination
                            current={currentPage}
                            total={total}
                            pageSize={9}
                            onChange={(page) => fetchArticles(page, selectedCategory, searchQuery)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default ArticlesPage;
