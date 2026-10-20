import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Modal, Tag, Button, Spin, Breadcrumb, Alert, Tooltip } from 'antd';
import {
    ArrowLeft,
    FileText,
    Lock,
    Unlock,
    Download,
    Eye,
    GraduationCap,
    BookOpen,
    ShoppingCart,
    LogIn,
    ShieldAlert,
    ZoomIn,
    ZoomOut,
    CheckCircle2,
    Calendar,
    UserCheck,
    Layers,
    Share2,
    Sparkles,
    Wallet,
    ExternalLink,
    AlertTriangle,
} from 'lucide-react';

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import {
    getDigitalDocDetailPublicApi,
    checkDigitalDocOwnershipApi,
    purchaseDigitalDocApi,
} from '../../api/digitalDocReader.api';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';

// Component to render a single PDF page on Canvas
function PdfCanvasPage({ pdfDoc, pageNumber, zoom, isOwned, totalPages, previewLimit, docCode }) {
    const canvasRef = useRef(null);
    const [rendering, setRendering] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const renderPage = async () => {
            if (!pdfDoc || !canvasRef.current) return;
            setRendering(true);
            setError(false);

            try {
                const page = await pdfDoc.getPage(pageNumber);
                if (isCancelled) return;

                const scale = (zoom / 100) * 1.5;
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;
                if (!isCancelled) setRendering(false);
            } catch (err) {
                console.warn(`Error rendering PDF page ${pageNumber}:`, err);
                if (!isCancelled) {
                    setError(true);
                    setRendering(false);
                }
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
        };
    }, [pdfDoc, pageNumber, zoom]);

    return (
        <div
            id={`doc-page-${pageNumber}`}
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden relative shrink-0 transition-all duration-200"
            style={{
                width: `${Math.round(720 * (zoom / 100))}px`,
                minHeight: `${Math.round(920 * (zoom / 100))}px`,
            }}
        >
            {/* Header Watermark */}
            <div className="bg-stone-50 px-6 py-2.5 flex justify-between items-center text-[10px] text-stone-400 font-mono border-b border-stone-100">
                <span className="font-bold">TRƯỜNG ĐẠI HỌC - THƯ VIỆN SỐ HỌC THUẬT</span>
                <span className={isOwned ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>
                    {isOwned ? `BẢN QUYỀN ĐÃ MỞ KHÓA (TRANG ${pageNumber} / ${totalPages})` : `CHẾ ĐỘ ĐỌC THỬ (TRANG ${pageNumber} / ${previewLimit})`}
                </span>
            </div>

            {/* Canvas Body */}
            <div className="flex items-center justify-center p-4 min-h-[820px] bg-white relative">
                {rendering && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 gap-2">
                        <Spin size="small" />
                        <span className="text-[11px] text-stone-400 font-medium">Đang kết xuất trang {pageNumber}...</span>
                    </div>
                )}

                {error ? (
                    <div className="p-8 text-center text-stone-500 space-y-2">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                        <div className="font-bold text-xs">Không thể kết xuất trực tiếp trang {pageNumber}</div>
                        <div className="text-[11px] text-stone-400">File PDF đang được bảo vệ hoặc định dạng nén đặc biệt.</div>
                    </div>
                ) : (
                    <canvas ref={canvasRef} className="max-w-full h-auto shadow-xs" />
                )}
            </div>

            {/* Footer Watermark */}
            <div className="bg-stone-50 px-6 py-2.5 flex justify-between items-center text-[10px] text-stone-400 font-mono border-t border-stone-100">
                <span>Mã tài liệu: {docCode}</span>
                <span className="font-bold text-stone-700">Trang {pageNumber} / {totalPages}</span>
            </div>
        </div>
    );
}

export function DigitalDocDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwned, setIsOwned] = useState(false);
    const [buying, setBuying] = useState(false);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [zoom, setZoom] = useState(100);

    // PDF Document instance loaded by PDF.js
    const [pdfDoc, setPdfDoc] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfLoadError, setPdfLoadError] = useState(false);

    // Fetch document details
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getDigitalDocDetailPublicApi(id);
            const data = res.metadata || res.data || null;
            setDoc(data);

            if (data) {
                if (data.price === 0 || user?.role === 'admin' || user?.role === 'superadmin') {
                    setIsOwned(true);
                } else if (isAuthenticated) {
                    const ownRes = await checkDigitalDocOwnershipApi(id);
                    setIsOwned(Boolean(ownRes.metadata?.isOwned));
                }
            }
        } catch (err) {
            console.warn('Fetch digital doc detail error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id, isAuthenticated]);

    // Load PDF file via PDF.js
    useEffect(() => {
        if (!doc?.pdfFile) return;

        let isCancelled = false;
        setLoadingPdf(true);
        setPdfLoadError(false);

        const loadPdf = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument({
                    url: doc.pdfFile,
                    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                });
                const loadedDoc = await loadingTask.promise;
                if (!isCancelled) {
                    setPdfDoc(loadedDoc);
                    setLoadingPdf(false);
                }
            } catch (err) {
                console.warn('PDF.js failed to load document from URL:', err);
                if (!isCancelled) {
                    setPdfLoadError(true);
                    setLoadingPdf(false);
                }
            }
        };

        loadPdf();

        return () => {
            isCancelled = true;
        };
    }, [doc?.pdfFile]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center items-center space-y-4">
                <Spin size="large" />
                <p className="text-xs font-bold text-stone-500">Đang tải tài liệu số...</p>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center space-y-4 p-6">
                <h2 className="text-xl font-bold text-stone-800">Không tìm thấy tài liệu số!</h2>
                <Button onClick={() => navigate('/digital-docs')} icon={<ArrowLeft className="w-4 h-4" />}>
                    Quay về danh sách tài liệu
                </Button>
            </div>
        );
    }

    const previewLimit = doc.previewPages || 5;
    const realTotalPages = pdfDoc?.numPages || doc.pages || 80;
    const pagesToRenderCount = isOwned ? realTotalPages : Math.min(previewLimit, realTotalPages);
    const pagesArray = Array.from({ length: pagesToRenderCount }, (_, i) => i + 1);

    const handleBuyClick = () => {
        if (!isAuthenticated) {
            showToast.info('Vui lòng đăng nhập để mua bản quyền tài liệu số!');
            navigate('/auth');
            return;
        }
        if (isOwned) {
            showToast.success('Bạn đã sở hữu bản quyền tài liệu số này!');
            return;
        }
        setPurchaseModalVisible(true);
    };

    const handleConfirmPurchase = async () => {
        setBuying(true);
        try {
            const res = await purchaseDigitalDocApi(id, 'wallet');
            setIsOwned(true);
            setPurchaseModalVisible(false);
            showToast.success(res.message || 'Mua bản quyền tài liệu số thành công! Đã mở khóa 100% tất cả các trang.');

            if (res.metadata?.userWalletBalance !== undefined && user) {
                user.walletBalance = res.metadata.userWalletBalance;
            }
        } catch (err) {
            showToast.error(err.message || 'Không thể thanh toán mua tài liệu số!');
        } finally {
            setBuying(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!doc.pdfFile) {
            showToast.error('Không tìm thấy file PDF gốc trên máy chủ!');
            return;
        }
        const link = document.createElement('a');
        link.href = doc.pdfFile;
        link.download = `${doc.docCode}_file.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast.success(`Đã tải file PDF gốc "${doc.docCode}" xuống máy tính!`);
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            {/* Header Navigation */}
            <MainHeader />
            <CategoryNavbar />

            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Breadcrumb
                        items={[
                            { title: <Link to="/" className="text-stone-500 hover:text-stone-800 text-xs">Trang chủ</Link> },
                            { title: <Link to="/digital-docs" className="text-stone-500 hover:text-stone-800 text-xs">Tài Liệu Số & Đồ Án</Link> },
                            { title: <span className="text-amber-800 font-bold text-xs truncate max-w-xs">{doc.title}</span> },
                        ]}
                    />

                    <div className="flex items-center gap-2 text-xs">
                        {isOwned ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300 shadow-2xs">
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                Đã Mở Khóa Bản Quyền ({realTotalPages} Trang)
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs border border-amber-300 shadow-2xs">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                Đọc Thử 5/{realTotalPages} Trang
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
                
                {/* Book Metadata Top Card */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cover Image (3 cols) */}
                        <div className="lg:col-span-3 flex flex-col items-center sm:items-start space-y-3">
                            <div className="relative aspect-[3/4] w-48 sm:w-full rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-100">
                                <img
                                    src={doc.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                                    alt={doc.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2.5 left-2.5 bg-stone-900/90 text-amber-400 font-mono font-black text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-xs">
                                    {doc.docCode}
                                </div>
                            </div>
                        </div>

                        {/* Details (9 cols) */}
                        <div className="lg:col-span-9 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Tag color="amber" className="font-extrabold text-xs px-2.5 py-0.5 rounded-lg border-amber-300">
                                    Khoa: {doc.category || 'Công nghệ Thông tin'}
                                </Tag>
                                <Tag color="purple" className="font-extrabold text-xs px-2.5 py-0.5 rounded-lg border-purple-300">
                                    {doc.documentType === 'thesis' ? 'Khóa Luận / Đồ Án Tốt Nghiệp' : doc.documentType === 'ebook' ? 'Sách Điện Tử (E-Book)' : doc.documentType}
                                </Tag>
                                <Tag color="stone" className="font-bold text-xs px-2.5 py-0.5 rounded-lg">
                                    Năm {doc.publishYear || 2026}
                                </Tag>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">
                                {doc.title}
                            </h1>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs md:text-sm text-stone-600 font-medium bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                <div>Tác giả / Sinh viên: <strong className="text-stone-900 font-extrabold">{doc.author}</strong></div>
                                {doc.advisor && <div>GVHD: <strong className="text-amber-800 font-extrabold">{doc.advisor}</strong></div>}
                                <div>Dung lượng: <span className="font-bold text-stone-800">{doc.fileSize || '5.2 MB'}</span></div>
                                <div>Tổng số trang: <span className="font-bold text-stone-800">{realTotalPages} trang PDF</span></div>
                            </div>

                            <div className="text-xs md:text-sm text-stone-600 leading-relaxed">
                                <span className="font-bold text-stone-900">Tóm tắt đề tài: </span>
                                {doc.description || 'Tài liệu nghiên cứu khoa học và đồ án tốt nghiệp chính thức lưu chiểu tại Thư viện số.'}
                            </div>

                            {/* Action Bar */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                {isOwned ? (
                                    <Button
                                        type="primary"
                                        icon={<Download className="w-4 h-4" />}
                                        onClick={handleDownloadPdf}
                                        className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs rounded-xl h-11 px-6 shadow-md"
                                    >
                                        Tải Xuống File PDF Gốc ({doc.fileSize || '5MB'})
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        icon={<ShoppingCart className="w-4 h-4" />}
                                        onClick={handleBuyClick}
                                        className="bg-amber-600 hover:bg-amber-700 border-none font-black text-xs rounded-xl h-11 px-6 shadow-md flex-1 sm:flex-initial"
                                    >
                                        {Number(doc.price) === 0 ? 'Đăng Ký Đọc Toàn Văn Miễn Phí' : `Mua Bản Quyền Mở Khóa ${realTotalPages} Trang: ${Number(doc.price).toLocaleString('vi-VN')} đ`}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* STRICT PDF READER SECTION */}
                <div className="bg-stone-900 text-stone-100 rounded-3xl overflow-hidden border border-stone-800 shadow-xl space-y-0">
                    
                    {/* Status Banner */}
                    {isOwned ? (
                        <div className="bg-emerald-950 border-b border-emerald-900 px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-emerald-200">
                            <div className="flex items-center gap-2 font-bold">
                                <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>ĐÃ MỞ KHÓA BẢN QUYỀN: Xem 100% tất cả {realTotalPages} trang & Tải file PDF gốc</span>
                            </div>
                            <Tag color="emerald" className="font-extrabold text-xs px-3 py-0.5 rounded-full m-0">
                                Full Access ({realTotalPages}/{realTotalPages} Trang)
                            </Tag>
                        </div>
                    ) : (
                        <div className="bg-amber-950 border-b border-amber-900 px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-amber-200">
                            <div className="flex items-center gap-2 font-bold">
                                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>CHẾ ĐỘ ĐỌC THỬ KHÁCH VÃNG LAI: Chỉ xem tối đa {previewLimit} trang đầu tiên</span>
                            </div>
                            <Tag color="amber" className="font-extrabold text-xs px-3 py-0.5 rounded-full m-0">
                                Giới Hạn Đọc Thử (5 / {realTotalPages} Trang)
                            </Tag>
                        </div>
                    )}

                    {/* PDF Control Bar */}
                    <div className="bg-stone-950 px-6 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
                        {/* Page Jump Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 custom-scrollbar">
                            <span className="font-bold text-stone-400 mr-1">Chuyển trang:</span>
                            {pagesArray.map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => {
                                        const el = document.getElementById(`doc-page-${pageNum}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-extrabold transition-colors border border-stone-700 cursor-pointer"
                                >
                                    Trang {pageNum}
                                </button>
                            ))}
                            {!isOwned && (
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('doc-page-paywall');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold hover:bg-amber-500/30 transition-colors border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                                >
                                    <Lock className="w-3 h-3" />
                                    <span>Trang 6 - {realTotalPages} (Khóa)</span>
                                </button>
                            )}
                        </div>

                        {/* Zoom & Download Controls */}
                        <div className="flex items-center gap-3">
                            {isOwned && (
                                <Button
                                    size="small"
                                    icon={<Download className="w-3.5 h-3.5" />}
                                    onClick={handleDownloadPdf}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold text-xs rounded-xl h-8"
                                >
                                    Tải PDF Gốc
                                </Button>
                            )}

                            <div className="flex items-center gap-1 bg-stone-900 px-3 py-1 rounded-xl border border-stone-800">
                                <button onClick={() => setZoom((z) => Math.max(75, z - 15))} className="p-1 hover:text-white cursor-pointer">
                                    <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono text-xs font-bold px-2">{zoom}%</span>
                                <button onClick={() => setZoom((z) => Math.min(150, z + 15))} className="p-1 hover:text-white cursor-pointer">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PDF Reader Canvas Area - Strictly renders only up to 5 pages when not owned */}
                    <div className="bg-stone-950 p-6 md:p-10 max-h-[880px] overflow-y-auto custom-scrollbar flex flex-col items-center gap-8">
                        {loadingPdf ? (
                            <div className="p-16 text-center text-stone-400 space-y-3">
                                <Spin size="large" />
                                <div className="text-xs font-bold">Đang tải và giải mã file PDF từ máy chủ...</div>
                            </div>
                        ) : (
                            <>
                                {/* RENDER CANVAS PAGES (1..5 for guest, all for owned) */}
                                {pagesArray.map((pageNum) => (
                                    <PdfCanvasPage
                                        key={pageNum}
                                        pdfDoc={pdfDoc}
                                        pageNumber={pageNum}
                                        zoom={zoom}
                                        isOwned={isOwned}
                                        totalPages={realTotalPages}
                                        previewLimit={previewLimit}
                                        docCode={doc.docCode}
                                    />
                                ))}

                                {/* STRICT PAYWALL BLOCK FOR PAGES 6+ (ONLY SHOWN IF NOT OWNED) */}
                                {!isOwned && (
                                    <div
                                        id="doc-page-paywall"
                                        className="bg-stone-900 border-2 border-dashed border-amber-600/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl shrink-0 my-4"
                                        style={{
                                            width: `${Math.round(720 * (zoom / 100))}px`,
                                        }}
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                                            <Lock className="w-8 h-8" />
                                        </div>

                                        <div className="space-y-2">
                                            <Tag color="amber" className="font-black text-xs uppercase px-4 py-1 rounded-full">
                                                Đã Đạt Giới Hạn Đọc Thử (5/5 Trang)
                                            </Tag>
                                            <h3 className="text-2xl font-black text-white">
                                                Bạn Đã Xem Hết 5 Trang Đọc Thử Miễn Phí
                                            </h3>
                                            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
                                                Nội dung từ <strong>trang 6 đến trang {realTotalPages}</strong> đã được bảo vệ bản quyền.
                                                Vui lòng mở khóa để đọc toàn văn 100% nội dung và tải file PDF gốc về máy tính.
                                            </p>
                                        </div>

                                        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-left text-xs max-w-md mx-auto">
                                            <div className="flex justify-between text-stone-400">
                                                <span>Tên đề tài:</span>
                                                <span className="font-bold text-stone-200 truncate max-w-[200px]">{doc.title}</span>
                                            </div>
                                            <div className="flex justify-between text-stone-400">
                                                <span>Số trang cần mở khóa:</span>
                                                <span className="font-bold text-stone-200">{realTotalPages - previewLimit} trang còn lại</span>
                                            </div>
                                            <div className="flex justify-between text-stone-400">
                                                <span>Đơn giá:</span>
                                                <span className="font-black text-amber-400 text-sm">
                                                    {Number(doc.price) > 0 ? `${Number(doc.price).toLocaleString('vi-VN')} VNĐ` : 'Miễn Phí Đọc Toàn Văn'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 max-w-md mx-auto">
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<ShoppingCart className="w-4 h-4" />}
                                                onClick={handleBuyClick}
                                                className="bg-amber-600 hover:bg-amber-700 border-none font-black text-xs rounded-xl h-12 flex-1 shadow-md cursor-pointer"
                                            >
                                                {Number(doc.price) === 0 ? 'Đăng Ký Đọc Toàn Văn Miễn Phí' : `Mua Bản Quyền: ${Number(doc.price).toLocaleString('vi-VN')} đ`}
                                            </Button>
                                            {!isAuthenticated && (
                                                <Button
                                                    size="large"
                                                    icon={<LogIn className="w-4 h-4" />}
                                                    onClick={() => navigate('/auth')}
                                                    className="bg-stone-800 text-stone-200 hover:bg-stone-700 border-stone-700 font-bold text-xs rounded-xl h-12 flex-1 cursor-pointer"
                                                >
                                                    Đăng Nhập Ngay
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL XÁC NHẬN MUA BẢN QUYỀN */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-stone-900 font-black text-base">
                        <ShoppingCart className="w-5 h-5 text-amber-600" />
                        <span>Xác Nhận Mua Bản Quyền Tài Liệu Số</span>
                    </div>
                }
                open={purchaseModalVisible}
                onCancel={() => setPurchaseModalVisible(false)}
                footer={null}
                width={500}
                className="rounded-3xl"
            >
                <div className="space-y-4 pt-3 text-xs text-stone-600 font-sans">
                    <Alert
                        type="info"
                        showIcon
                        message={<span className="font-bold text-xs">Mở khóa vĩnh viễn</span>}
                        description={<span className="text-xs">Sau khi thanh toán thành công, bạn sẽ xem được 100% các trang và tải file PDF gốc về máy tính.</span>}
                        className="rounded-2xl"
                    />

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-stone-500">Tài liệu:</span>
                            <span className="font-bold text-stone-900 text-right max-w-[250px] truncate">{doc.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-stone-500">Tổng số trang:</span>
                            <span className="font-bold text-stone-900">{realTotalPages} trang</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-stone-200">
                            <span className="font-bold text-stone-800">Số tiền thanh toán:</span>
                            <span className="font-black text-amber-800 text-base">
                                {Number(doc.price).toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button onClick={() => setPurchaseModalVisible(false)} className="rounded-xl font-bold text-xs h-10 px-5">
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="primary"
                            loading={buying}
                            onClick={handleConfirmPurchase}
                            className="bg-amber-600 hover:bg-amber-700 border-none font-bold text-xs h-10 px-6 rounded-xl shadow-sm"
                        >
                            Xác Nhận Mở Khóa
                        </Button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
}

export default DigitalDocDetailPage;
