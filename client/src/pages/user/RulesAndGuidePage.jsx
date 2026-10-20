import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    CreditCard,
    BookOpen,
    AlertTriangle,
    GraduationCap,
    CheckCircle2,
    Clock,
    FileText,
    HelpCircle,
    ArrowRight,
    Sparkles,
    Ban,
    DollarSign,
    Zap,
} from 'lucide-react';
import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';

export function RulesAndGuidePage() {
    const [activeTab, setActiveTab] = useState('card'); // 'general' | 'card' | 'borrow' | 'fine' | 'thesis'

    const tabs = [
        { id: 'card', label: '1. Làm Thẻ Thư Viện', icon: CreditCard },
        { id: 'borrow', label: '2. Mượn - Trả & Gia Hạn', icon: BookOpen },
        { id: 'fine', label: '3. Xử Phạt & Bồi Thường', icon: AlertTriangle },
        { id: 'thesis', label: '4. Nộp Đồ Án Lưu Chiểu', icon: GraduationCap },
        { id: 'general', label: '5. Nội Quy Phòng Đọc', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            <TopHeader />
            <MainHeader />
            <CategoryNavbar />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white py-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sổ Tay Bạn Đọc & Quy Chế Học Thuật</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-stone-100 max-w-3xl mx-auto leading-tight">
                        Hướng Dẫn Sử Dụng & Quy Định Thư Viện
                    </h1>
                    <p className="text-stone-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Tổng hợp đầy đủ quy định cấp thẻ, thủ tục mượn trả tài liệu, chính sách gia hạn, quy chế nộp đồ án và bảo vệ quyền lợi độc giả.
                    </p>
                </div>
            </div>

            {/* MAIN CONTAINER */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1 w-full space-y-8">
                {/* TABS NAVIGATION */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-stone-200">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB CONTENT */}
                <div className="bg-white rounded-3xl p-6 md:p-10 border border-stone-200 shadow-sm space-y-8">
                    {/* TAB 1: CARD */}
                    {activeTab === 'card' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <CreditCard className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-stone-900">
                                        Quy Định & Hướng Dẫn Cấp Thẻ Thư Viện Điện Tử
                                    </h2>
                                    <p className="text-xs text-stone-500">Áp dụng cho Sinh viên, Giảng viên và Độc giả ngoài trường</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                                    <div className="text-xs font-black text-amber-700 uppercase">Đối tượng: Sinh Viên</div>
                                    <div className="text-xl font-black text-stone-900">Miễn Phí 100%</div>
                                    <p className="text-xs text-stone-600">Kích hoạt trực tuyến theo mã số sinh viên, mượn tối đa 5 cuốn/lần, thời hạn theo khóa học.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                                    <div className="text-xs font-black text-indigo-700 uppercase">Đối tượng: Giảng Viên</div>
                                    <div className="text-xl font-black text-stone-900">Ưu Tiên Nghiên Cứu</div>
                                    <p className="text-xs text-stone-600">Hạn mức mượn 10 cuốn sách giáo trình, thời gian mượn cả học kỳ phục vụ giảng dạy.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                                    <div className="text-xs font-black text-emerald-700 uppercase">Đối tượng: Độc Giả Ngoài</div>
                                    <div className="text-xl font-black text-stone-900">Thẻ Thành Viên</div>
                                    <p className="text-xs text-stone-600">Đăng ký tài khoản, nộp tiền cọc và phí duy trì thẻ hàng năm để mượn sách.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-black text-stone-900">Quy Trình 3 Bước Kích Hoạt Thẻ Trực Tuyến:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs">
                                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                                        <div>
                                            <strong className="text-stone-900">Đăng ký & Cập nhật hồ sơ:</strong> Đăng nhập tài khoản, vào mục <em>"Trang cá nhân / Thẻ thư viện"</em>, bổ sung ảnh thẻ và thông tin khoa/lớp.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs">
                                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                                        <div>
                                            <strong className="text-stone-900">Thủ thư thẩm định & cấp mã:</strong> Ban Quản trị xét duyệt hồ sơ trong vòng 2-4 giờ làm việc và cấp mã số thẻ điện tử <code>CARD-2026-xxx</code>.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs">
                                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                                        <div>
                                            <strong className="text-stone-900">Nhận thẻ điện tử & sử dụng:</strong> Thẻ điện tử hiển thị mã QR & Barcode trực tiếp trên điện thoại để quẹt mở cửa phòng tự học 24/7 và mượn sách.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: BORROW & RENEWAL */}
                    {activeTab === 'borrow' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                                    <BookOpen className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-stone-900">
                                        Quy Định Mượn - Trả Sách Giấy & Gia Hạn Trực Tuyến
                                    </h2>
                                    <p className="text-xs text-stone-500">Chính sách lưu thông tài liệu và bảo quản kho sách</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Hạn mức & Thời gian mượn:</h3>
                                    <ul className="space-y-2 text-xs text-stone-600">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span><strong>Số lượng tối đa:</strong> 5 cuốn sách giấy cùng một lúc.</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span><strong>Thời hạn mượn:</strong> 14 ngày kể từ ngày nhận sách tại quầy.</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span><strong>Gia hạn trực tuyến:</strong> Tối đa 02 lần (mỗi lần thêm 7 ngày).</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span><strong>Tài liệu đọc tại chỗ:</strong> Từ điển, Báo/Tạp chí số mới và Khóa luận gốc không mượn về nhà.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                                        <Zap className="w-4 h-4 text-amber-600" />
                                        <span>Hộp Trả Sách Thông Minh 24/7</span>
                                    </div>
                                    <p className="text-xs text-stone-700 leading-relaxed">
                                        Bạn đọc có thể hoàn trả sách bất cứ thời điểm nào (kể cả ban đêm và ngày nghỉ) bằng cách thả sách vào <strong>Hộp trả sách tự động</strong> đặt tại sảnh trước Thư viện. Hệ thống RFID sẽ tự động quét mã và cập nhật phiếu trả trong vòng 10 giây.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: FINE */}
                    {activeTab === 'fine' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                                    <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-stone-900">
                                        Quy Định Xử Lý Vi Phạm & Mức Phí Phạt
                                    </h2>
                                    <p className="text-xs text-stone-500">Đảm bảo công bằng và bảo vệ tài sản tri thức chung</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                                    <div className="text-xs font-black text-rose-700 uppercase">Trễ hạn trả sách</div>
                                    <div className="text-xl font-black text-stone-900">5.000đ / ngày / cuốn</div>
                                    <p className="text-xs text-stone-600">Tính từ ngày kế tiếp của hạn trả ghi trên phiếu mượn. Quá 30 ngày tự động tạm khóa thẻ.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                                    <div className="text-xs font-black text-amber-700 uppercase">Làm hư hỏng sách</div>
                                    <div className="text-xl font-black text-stone-900">Bồi thường 30% - 100%</div>
                                    <p className="text-xs text-stone-600">Tùy mức độ rách trang, gãy gáy, vẽ bẩn sẽ tính chi phí phục chế hoặc đền sách mới.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-stone-100 border border-stone-300 space-y-2">
                                    <div className="text-xs font-black text-stone-700 uppercase">Làm mất sách</div>
                                    <div className="text-xl font-black text-stone-900">Mua đền hoặc 200% giá bìa</div>
                                    <p className="text-xs text-stone-600">Bạn đọc mua đền đúng ấn bản bị mất hoặc thanh toán 200% giá trị sách theo giá hiện hành.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: THESIS */}
                    {activeTab === 'thesis' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
                                    <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-stone-900">
                                        Quy Chế Nộp Khóa Luận, Luận Văn & Đề Tài Lưu Chiểu Số
                                    </h2>
                                    <p className="text-xs text-stone-500">Quy định bắt buộc đối với sinh viên và học viên cao học trước khi tốt nghiệp</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
                                <h3 className="text-sm font-black text-stone-900">1. Quy chuẩn hồ sơ nộp trực tuyến:</h3>
                                <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                                    <li>File PDF định dạng chuẩn (không đặt mật khẩu bảo vệ), dung lượng dưới 50MB.</li>
                                    <li>Trang bìa đầy đủ thông tin: Trường, Khoa, Chuyên ngành, Tên đề tài (Tiếng Việt & Tiếng Anh), Mã số sinh viên, Chữ ký scan của Giảng viên hướng dẫn.</li>
                                    <li>Phần tóm tắt (Abstract) tối thiểu 200 từ và từ 3-5 từ khóa nghiên cứu (Keywords).</li>
                                </ul>

                                <h3 className="text-sm font-black text-stone-900 pt-2">2. Thẩm định & Giấy xác nhận lưu chiểu:</h3>
                                <p>
                                    Sau khi nộp tại mục <strong>"Nộp Đồ Án / Luận Văn"</strong>, trong vòng 48 giờ Thủ thư sẽ phản hồi kết quả qua Email và Thông báo hệ thống. Sau khi duyệt thành công, hệ thống cấp mã <code>THESIS-2026-xxx</code> và giấy xác nhận hoàn thành nghĩa vụ lưu chiểu gửi sang Phòng Đào Tạo.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Link
                                    to="/submit-thesis"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-colors"
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Đến Cổng Nộp Đồ Án Trực Tuyến &rarr;</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-stone-900">
                                        Nội Quy Phòng Đọc & Văn Hóa Không Gian Học Thuật
                                    </h2>
                                    <p className="text-xs text-stone-500">Giữ gìn không gian học tập văn minh, yên tĩnh và tôn trọng cộng đồng</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-black text-emerald-800 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Những Điều Nên Làm:</span>
                                    </h3>
                                    <ul className="space-y-2 pl-2">
                                        <li>• Xuất trình Thẻ Thư Viện khi vào cửa và quẹt thẻ mượn sách.</li>
                                        <li>• Để điện thoại ở chế độ rung hoặc im lặng; nghe điện thoại tại khu vực hành lang.</li>
                                        <li>• Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định.</li>
                                        <li>• Đặt lại sách vào khay sách chờ xếp sau khi đọc xong tại chỗ.</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-black text-rose-800 flex items-center gap-2">
                                        <Ban className="w-4 h-4 text-rose-600" />
                                        <span>Những Điều Nghiêm Cấm:</span>
                                    </h3>
                                    <ul className="space-y-2 pl-2">
                                        <li>• Mang đồ ăn có mùi, nước ngọt không có nắp đậy vào phòng đọc.</li>
                                        <li>• Nói chuyện ồn ào, gây mất trật tự hoặc chiếm chỗ cho người khác.</li>
                                        <li>• Cắt xén, xé trang, viết vẽ bẩn lên tài liệu học thuật.</li>
                                        <li>• Tự ý mang tài liệu chưa làm thủ tục mượn ra khỏi Thư viện.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default RulesAndGuidePage;
