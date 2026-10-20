import React, { useState } from 'react';
import { Modal, Tag, Button, Tooltip, Alert, Badge } from 'antd';
import {
    FileText,
    Lock,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    GraduationCap,
    BookOpen,
    ShoppingCart,
    LogIn,
    ShieldAlert,
    ExternalLink,
    Maximize2,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';

export function DigitalDocPreviewModal({ doc, open, onClose }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);

    if (!doc) return null;

    // Check ownership / admin state. Guest / Unpurchased readers are restricted to 5 preview pages max
    const previewLimit = doc.previewPages || 5;
    const totalPages = doc.pages || 85;
    const isLockedPage = currentPage > previewLimit;

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleBuyClick = () => {
        if (!isAuthenticated) {
            showToast.info('Vui lòng đăng nhập để mua bản quyền tài liệu số!');
            navigate('/auth');
            return;
        }
        showToast.info('Chức năng thanh toán VNPay mua tài liệu số điện tử sẽ khả dụng ở Phase 4.4!');
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={960}
            centered
            className="rounded-3xl overflow-hidden p-0"
            destroyOnClose
        >
            <div className="flex flex-col bg-stone-900 text-stone-100 rounded-3xl min-h-[680px]">
                {/* Header Toolbar */}
                <div className="p-4 md:px-6 bg-stone-950 border-b border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                            {doc.documentType === 'thesis' ? <GraduationCap className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-amber-400 font-mono tracking-wider">{doc.docCode}</span>
                                <Tag color="amber" className="font-black text-[10px] uppercase rounded-full">
                                    {doc.category || 'CNTT'}
                                </Tag>
                            </div>
                            <h3 className="text-sm md:text-base font-black text-white line-clamp-1 mt-0.5">{doc.title}</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <Tag color="purple" className="font-bold text-xs px-3 py-1 rounded-xl">
                            {doc.price > 0 ? `${Number(doc.price).toLocaleString()} VNĐ` : 'Miễn Phí'}
                        </Tag>
                        <Button
                            type="primary"
                            icon={<ShoppingCart className="w-4 h-4" />}
                            onClick={handleBuyClick}
                            className="bg-amber-600 hover:bg-amber-700 border-none font-bold text-xs rounded-xl h-9"
                        >
                            Mua Bản Quyền
                        </Button>
                    </div>
                </div>

                {/* Sub Banner: Guest Preview Warning */}
                <div className="bg-amber-950/80 border-b border-amber-900/60 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2 font-bold">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Chế độ Đọc Thử Khách Vãng Lai: Đang đọc tối đa {previewLimit} trang đầu tiên</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] bg-amber-900/60 px-2.5 py-0.5 rounded-full font-extrabold">
                        <span>Trang {currentPage} / {totalPages}</span>
                    </div>
                </div>

                {/* PDF Viewer Top Controls Bar */}
                <div className="bg-stone-800/80 px-4 py-2 flex items-center justify-between border-b border-stone-700 text-stone-300 text-xs">
                    <div className="flex items-center gap-2">
                        <Button
                            size="small"
                            type="text"
                            icon={<ChevronLeft className="w-4 h-4 text-stone-200" />}
                            disabled={currentPage <= 1}
                            onClick={handlePrev}
                            className="text-stone-300 hover:text-white"
                        />
                        <span className="font-bold text-white px-2">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                            size="small"
                            type="text"
                            icon={<ChevronRight className="w-4 h-4 text-stone-200" />}
                            onClick={handleNext}
                            className="text-stone-300 hover:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                            <button onClick={() => setZoom((z) => Math.max(75, z - 15))} className="p-1 hover:text-white">
                                <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-[11px] font-bold px-1">{zoom}%</span>
                            <button onClick={() => setZoom((z) => Math.min(175, z + 15))} className="p-1 hover:text-white">
                                <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF Canvas Viewport Area */}
                <div className="flex-1 bg-stone-950 p-4 md:p-6 overflow-y-auto flex justify-center items-start min-h-[480px]">
                    {isLockedPage ? (
                        /* PAYWALL LOCK BOX FOR GUEST READERS (scrolled past page 5) */
                        <div className="max-w-md my-auto bg-stone-900 border border-amber-600/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-fade-in">
                            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                                <Lock className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <Tag color="amber" className="font-black text-xs uppercase px-3 py-0.5 rounded-full">
                                    Đã Đạt Giới Hạn Đọc Thử ({previewLimit}/{previewLimit} trang)
                                </Tag>
                                <h4 className="text-xl font-black text-white">Bạn Đang Xem Ở Chế Độ Khách Vãng Lai</h4>
                                <p className="text-xs text-stone-300 leading-relaxed">
                                    Khách vãng lai chỉ được đọc thử tối đa <strong>{previewLimit} trang đầu tiên</strong> của đồ án/tài liệu số này.
                                    Để xem trọn vẹn toàn bộ <strong>{totalPages} trang</strong> và tải bản PDF gốc không đóng dấu watermark, vui lòng mua bản quyền tài liệu.
                                </p>
                            </div>

                            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1 text-left">
                                <div className="flex justify-between text-xs text-stone-400 font-medium">
                                    <span>Tài liệu:</span>
                                    <span className="font-bold text-stone-200">{doc.docCode}</span>
                                </div>
                                <div className="flex justify-between text-xs text-stone-400 font-medium">
                                    <span>Tổng số trang:</span>
                                    <span className="font-bold text-stone-200">{totalPages} trang</span>
                                </div>
                                <div className="flex justify-between text-xs text-stone-400 font-medium">
                                    <span>Đơn giá bản quyền:</span>
                                    <span className="font-extrabold text-amber-400">
                                        {doc.price > 0 ? `${Number(doc.price).toLocaleString()} VNĐ` : 'Miễn Phí'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 pt-2">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingCart className="w-4 h-4" />}
                                    onClick={handleBuyClick}
                                    className="bg-amber-600 hover:bg-amber-700 border-none font-black text-xs rounded-xl h-11 shadow-md"
                                >
                                    Mua Bản Quyền Mở Khóa {totalPages} Trang
                                </Button>
                                {!isAuthenticated && (
                                    <Button
                                        size="large"
                                        icon={<LogIn className="w-4 h-4" />}
                                        onClick={() => navigate('/auth')}
                                        className="bg-stone-800 text-stone-200 hover:bg-stone-700 border-stone-700 font-bold text-xs rounded-xl h-11"
                                    >
                                        Đăng Nhập Tài Khoản Độc Giả
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* UNLOCKED PREVIEW PAGE CANVAS */
                        <div
                            className="bg-white text-stone-900 rounded-2xl p-8 shadow-2xl border border-stone-200 transition-transform duration-200 space-y-6 relative"
                            style={{
                                width: `${Math.round(620 * (zoom / 100))}px`,
                                minHeight: `${Math.round(800 * (zoom / 100))}px`,
                            }}
                        >
                            {/* Page Header Watermark */}
                            <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono border-b pb-2">
                                <span>TRƯỜNG ĐẠI HỌC - THƯ VIỆN SỐ</span>
                                <span>CHẾ ĐỘ ĐỌC THỬ (TRANG {currentPage} / {previewLimit})</span>
                            </div>

                            {/* Page Content simulation */}
                            {currentPage === 1 ? (
                                <div className="space-y-6 pt-4 text-center">
                                    <Tag color="amber" className="font-extrabold text-xs uppercase px-3 py-1">
                                        {doc.documentType === 'thesis' ? 'ĐỒ ÁN TỐT NGHIỆP' : 'TÀI LIỆU SỐ'}
                                    </Tag>
                                    <h2 className="text-xl md:text-2xl font-black text-stone-900 leading-snug">
                                        {doc.title}
                                    </h2>
                                    <div className="py-4 space-y-1.5 text-xs text-stone-600 font-medium">
                                        <p>
                                            <strong>Tác giả / Sinh viên thực hiện:</strong> {doc.author}
                                        </p>
                                        {doc.advisor && (
                                            <p>
                                                <strong>Giảng viên hướng dẫn (GVHD):</strong> {doc.advisor}
                                            </p>
                                        )}
                                        <p>
                                            <strong>Chuyên ngành:</strong> {doc.category || 'Công nghệ Thông tin'}
                                        </p>
                                        <p>
                                            <strong>Năm hoàn thành:</strong> {doc.publishYear || 2026}
                                        </p>
                                    </div>
                                    <div className="bg-stone-50 p-4 rounded-xl text-left border border-stone-200 text-xs leading-relaxed text-stone-700">
                                        <h4 className="font-bold text-stone-900 mb-1">Tóm Tắt Đề Tài (Abstract):</h4>
                                        <p>{doc.description || 'Nội dung tóm tắt chi tiết đề tài nghiên cứu tốt nghiệp...'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2 text-xs leading-relaxed text-stone-700">
                                    <h3 className="font-bold text-sm text-stone-900 border-b pb-1">
                                        CHƯƠNG {currentPage - 1}: CƠ SỞ LÝ THUYẾT & KIẾN TRÚC HỆ THỐNG
                                    </h3>
                                    <p>
                                        Nội dung trang số {currentPage} thể hiện các mô hình dữ liệu, phân tích quy trình nghiệp vụ và các biểu đồ thuật toán được phát triển trong khuôn khổ nghiên cứu đề tài {doc.docCode}.
                                    </p>
                                    <div className="bg-stone-100 p-4 rounded-xl font-mono text-[11px] text-stone-800">
                                        // Sample Code & Architecture Logic
                                        <br />
                                        function analyzeLibrarySystem() &#123;
                                        <br />
                                        &nbsp;&nbsp;return "AI-Integrated Digital Document Workflow";
                                        <br />
                                        &#125;
                                    </div>
                                    <p>
                                        Hệ thống cho phép bạn đọc tra cứu tài liệu số trực tuyến, đọc thử giới hạn {previewLimit} trang đầu đối với khách vãng lai và đăng ký mua bản quyền tài liệu đầy đủ qua VNPay.
                                    </p>
                                </div>
                            )}

                            {/* Page Footer Watermark */}
                            <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center text-[10px] text-stone-400 font-mono border-t pt-2">
                                <span>Mã tài liệu: {doc.docCode}</span>
                                <span>Trang {currentPage}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
