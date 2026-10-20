import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, Eye, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { getAllArticlesPublicApi } from '../api/article.api';

export default function ArticleNewsSection() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLatest = async () => {
            setLoading(true);
            try {
                const res = await getAllArticlesPublicApi({ limit: 4, status: 'published' });
                const data = res.metadata || res.data || {};
                setArticles(data.articles || []);
            } catch (err) {
                console.warn('Fetch news on home error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLatest();
    }, []);

    if (!loading && articles.length === 0) return null;

    const featured = articles[0];
    const rest = articles.slice(1, 4);

    return (
        <section className="py-16 bg-[#f7f5f0] border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" /> Bản Tin & Sự Kiện Mới Nhất
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                            Hoạt Động & Thông Báo Từ Thư Viện
                        </h2>
                    </div>

                    <Link
                        to="/articles"
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl border border-amber-200 transition-colors"
                    >
                        <span>Xem tất cả tin tức</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Featured Item (7 cols) */}
                    {featured && (
                        <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                            <Link to={`/articles/${featured.slug}`} className="aspect-[16/10] overflow-hidden relative block">
                                <img
                                    src={featured.thumbnail}
                                    alt={featured.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-4 left-4 bg-amber-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md">
                                    NỔI BẬT
                                </span>
                            </Link>

                            <div className="p-6 md:p-8 space-y-3">
                                <div className="flex items-center gap-3 text-xs text-stone-400 font-bold">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(featured.publishedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" /> {featured.views || 0} lượt xem
                                    </span>
                                </div>

                                <h3 className="text-lg md:text-xl font-black text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                                    <Link to={`/articles/${featured.slug}`}>
                                        {featured.title}
                                    </Link>
                                </h3>

                                <p className="text-xs md:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                                    {featured.summary}
                                </p>

                                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-500">{featured.author || 'Ban Quản Trị'}</span>
                                    <Link
                                        to={`/articles/${featured.slug}`}
                                        className="text-xs font-black text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                    >
                                        <span>Đọc tiếp</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Secondary List (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {rest.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-3xl p-4 md:p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group flex-1"
                            >
                                <Link
                                    to={`/articles/${item.slug}`}
                                    className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 block relative"
                                >
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </Link>

                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold">
                                        <span>{new Date(item.publishedAt).toLocaleDateString('vi-VN')}</span>
                                        <span>•</span>
                                        <span>{item.views || 0} xem</span>
                                    </div>
                                    <h4 className="font-bold text-xs md:text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                                        <Link to={`/articles/${item.slug}`}>
                                            {item.title}
                                        </Link>
                                    </h4>
                                    <p className="text-[11px] text-stone-500 line-clamp-1">
                                        {item.summary}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
