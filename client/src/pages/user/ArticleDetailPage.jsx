import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Eye,
    User,
    ArrowLeft,
    Share2,
    ChevronRight,
    Tag,
    BookOpen,
    Newspaper,
    Sparkles,
    ShieldCheck,
    Layers,
} from 'lucide-react';
import { Spin, message } from 'antd';
import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import { getArticleDetailPublicApi } from '../../api/article.api';

export function ArticleDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await getArticleDetailPublicApi(slug);
                const data = res.metadata || res.data || {};
                setArticle(data.article || null);
                setRelatedArticles(data.relatedArticles || []);
            } catch (err) {
                console.error('Fetch article detail error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchDetail();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [slug]);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            message.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
                <TopHeader />
                <MainHeader />
                <CategoryNavbar />
                <div className="flex-1 flex items-center justify-center py-32">
                    <Spin size="large" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
                <TopHeader />
                <MainHeader />
                <CategoryNavbar />
                <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
                    <h2 className="text-2xl font-black text-stone-900">Không tìm thấy bài viết!</h2>
                    <p className="text-xs text-stone-500">Bài viết có thể đã bị gỡ hoặc đường dẫn không chính xác.</p>
                    <Link
                        to="/articles"
                        className="px-6 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                        &larr; Về trang Tin tức
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            <TopHeader />
            <MainHeader />
            <CategoryNavbar />

            {/* BREADCRUMB */}
            <div className="bg-white border-b border-stone-200 py-3 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-stone-500 font-semibold overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="hover:text-amber-600">Trang chủ</Link>
                    <ChevronRight className="w-3 h-3 text-stone-300" />
                    <Link to="/articles" className="hover:text-amber-600">Tin tức & Sự kiện</Link>
                    <ChevronRight className="w-3 h-3 text-stone-300" />
                    <span className="text-stone-900 font-bold max-w-xs truncate">{article.title}</span>
                </div>
            </div>

            {/* MAIN ARTICLE DETAIL */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* LEFT CONTENT (8 COLS) */}
                    <article className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-10 border border-stone-200 shadow-sm space-y-6">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                            <div className="flex items-center gap-3 text-xs font-bold">
                                <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full uppercase text-[10px] tracking-wider">
                                    {article.category === 'news' ? 'Tin Tức' : article.category === 'notice' ? 'Thông Báo' : article.category === 'event' ? 'Sự Kiện' : 'Hướng Dẫn'}
                                </span>
                                <span className="text-stone-400">•</span>
                                <span className="text-stone-500 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="text-stone-400">•</span>
                                <span className="text-stone-500 flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5" />
                                    {article.views || 0} lượt xem
                                </span>
                            </div>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 bg-stone-50 hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Chia sẻ</span>
                            </button>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight leading-snug">
                            {article.title}
                        </h1>

                        {/* Summary Block */}
                        {article.summary && (
                            <div className="p-5 rounded-2xl bg-amber-50/80 border-l-4 border-amber-600 text-stone-800 text-xs md:text-sm font-semibold leading-relaxed">
                                {article.summary}
                            </div>
                        )}

                        {/* Thumbnail */}
                        {article.thumbnail && (
                            <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-stone-200 shadow-sm">
                                <img
                                    src={article.thumbnail}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Full HTML Content */}
                        <div
                            className="prose prose-stone max-w-none text-xs md:text-sm leading-relaxed space-y-4 pt-4 border-t border-stone-100 font-sans"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Author Info */}
                        <div className="pt-8 border-t border-stone-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-extrabold">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-extrabold text-stone-900">{article.author || 'Ban Quản Trị Thư Viện'}</div>
                                    <div className="text-[11px] text-stone-400 font-medium">Trung tâm Thông tin - Thư viện</div>
                                </div>
                            </div>

                            <Link
                                to="/articles"
                                className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Xem tin khác</span>
                            </Link>
                        </div>
                    </article>

                    {/* RIGHT SIDEBAR (4 COLS) */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* RELATED ARTICLES */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 font-black text-sm text-stone-900">
                                <Newspaper className="w-4 h-4 text-amber-600" />
                                <span>Bài Viết Liên Quan</span>
                            </div>

                            <div className="divide-y divide-stone-100">
                                {relatedArticles.length === 0 ? (
                                    <p className="text-xs text-stone-400 py-3">Chưa có bài viết liên quan.</p>
                                ) : (
                                    relatedArticles.map((rel) => (
                                        <Link
                                            key={rel.id}
                                            to={`/articles/${rel.slug}`}
                                            className="py-3 flex items-start gap-3 group block first:pt-0 last:pb-0"
                                        >
                                            <div className="w-16 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                                                <img
                                                    src={rel.thumbnail}
                                                    alt={rel.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <h4 className="font-bold text-xs text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                                                    {rel.title}
                                                </h4>
                                                <span className="text-[10px] text-stone-400 font-medium block">
                                                    {new Date(rel.publishedAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* QUICK LINKS BANNER */}
                        <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-6 text-white space-y-4 shadow-lg">
                            <div className="flex items-center gap-2 font-black text-sm text-amber-100">
                                <BookOpen className="w-4 h-4" />
                                <span>Dịch Vụ Bạn Đọc</span>
                            </div>
                            <p className="text-xs text-amber-100 leading-relaxed">
                                Bạn cần mượn sách giấy, đăng ký phòng học nhóm hoặc cần hỗ trợ nộp khóa luận tốt nghiệp?
                            </p>
                            <div className="space-y-2 pt-1">
                                <Link
                                    to="/schedule"
                                    className="block text-center py-2.5 rounded-xl bg-stone-950 hover:bg-black text-amber-400 font-bold text-xs shadow-sm transition-colors"
                                >
                                    Xem Lịch Phục Vụ Thư Viện
                                </Link>
                                <Link
                                    to="/rules"
                                    className="block text-center py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-colors"
                                >
                                    Quy Định Mượn Trả Sách
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ArticleDetailPage;
