import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Tag, Button, Empty, Card, Badge, Spin } from 'antd';
import {
    FileText,
    Search,
    BookOpen,
    GraduationCap,
    Eye,
    ShoppingCart,
    Filter,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    Lock,
    ExternalLink,
} from 'lucide-react';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import { getAllDigitalDocsPublicApi } from '../../api/digitalDocReader.api';
import { DigitalDocPreviewModal } from '../../components/user/DigitalDocPreviewModal';

const categoryOptions = [
    { value: 'all', label: 'Tất cả chuyên ngành' },
    { value: 'CNTT', label: 'Công nghệ Thông tin' },
    { value: 'KinhTe', label: 'Kinh tế & Quản trị' },
    { value: 'DienTu', label: 'Điện tử - Viễn thông' },
    { value: 'NgoaiNgu', label: 'Ngoại ngữ' },
    { value: 'YDuoc', label: 'Y Dược' },
];

export function DigitalDocCatalogPage() {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocType, setSelectedDocType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);

    const fetchPublicDocs = async () => {
        setLoading(true);
        try {
            const res = await getAllDigitalDocsPublicApi({
                search: searchQuery,
                category: selectedCategory,
                documentType: selectedDocType,
            });
            const list = res.metadata?.docs || res.data?.docs || (Array.isArray(res.metadata) ? res.metadata : (Array.isArray(res.data) ? res.data : []));
            setDocs(Array.isArray(list) ? list : []);
        } catch (err) {
            console.warn('Fetch public docs error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicDocs();
    }, [selectedDocType, selectedCategory]);

    const filteredDocs = docs.filter((doc) => {
        const matchSearch =
            !searchQuery ||
            doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.docCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.advisor?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchType = selectedDocType === 'all' || doc.documentType === selectedDocType;
        const matchCategory = selectedCategory === 'all' || doc.category === selectedCategory;

        return matchSearch && matchType && matchCategory;
    });

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            {/* Header */}
            <MainHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <CategoryNavbar />

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Hero Header Banner */}
                <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 max-w-2xl relative z-10">
                        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            <span>Kho Tài Liệu Số & Đồ Án Tốt Nghiệp</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
                            Tra Cứu & Đọc Thử Tài Liệu Số Trực Tuyến
                        </h1>
                        <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                            Khách vãng lai và Độc giả truy cập hệ thống để tra cứu đồ án tốt nghiệp, luận văn thạc sĩ, sách điện tử và đọc thử <strong>5 trang đầu tiên miễn phí</strong>.
                        </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-2xl p-4 text-amber-200 text-xs space-y-1.5 shrink-0 max-w-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Quy Định Đọc Thử:</span>
                        </div>
                        <p className="text-[11px] leading-normal text-stone-300">
                            - <strong>Khách vãng lai:</strong> Đọc thử tối đa 5 trang đầu.
                            <br />- <strong>Mua bản quyền:</strong> Đọc trọn vẹn 100% trang & tải file PDF gốc.
                        </p>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Type Tabs */}
                        <div className="flex items-center bg-stone-100 p-1 rounded-xl w-full md:w-auto text-xs font-bold">
                            <button
                                onClick={() => setSelectedDocType('all')}
                                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg transition-all ${
                                    selectedDocType === 'all' ? 'bg-white text-stone-900 shadow-2xs font-black' : 'text-stone-600'
                                }`}
                            >
                                Tất Cả Tài Liệu
                            </button>
                            <button
                                onClick={() => setSelectedDocType('thesis')}
                                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg transition-all ${
                                    selectedDocType === 'thesis' ? 'bg-white text-stone-900 shadow-2xs font-black' : 'text-stone-600'
                                }`}
                            >
                                Đồ Án / Luận Văn
                            </button>
                            <button
                                onClick={() => setSelectedDocType('ebook')}
                                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg transition-all ${
                                    selectedDocType === 'ebook' ? 'bg-white text-stone-900 shadow-2xs font-black' : 'text-stone-600'
                                }`}
                            >
                                Sách Điện Tử (E-Book)
                            </button>
                        </div>

                        {/* Search & Category Select */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Input
                                prefix={<Search className="w-4 h-4 text-stone-400" />}
                                placeholder="Tìm theo tên đề tài, sinh viên, GVHD..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="rounded-xl text-xs h-10 w-full md:w-64"
                            />
                            <Select
                                value={selectedCategory}
                                onChange={(val) => setSelectedCategory(val)}
                                options={categoryOptions}
                                className="h-10 text-xs rounded-xl min-w-[160px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Documents Cards Grid */}
                {loading ? (
                    <div className="py-20 text-center space-y-3">
                        <Spin size="large" />
                        <p className="text-xs text-stone-500 font-medium">Đang tải danh sách tài liệu số...</p>
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
                        <Empty description="Không tìm thấy tài liệu số hoặc đồ án nào phù hợp!" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                            >
                                <div className="p-5 space-y-4">
                                    {/* Cover & Badges */}
                                    <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-3/2 flex items-center justify-center">
                                        <img
                                            src={doc.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                                            alt={doc.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                            <Tag color={doc.documentType === 'thesis' ? 'purple' : 'blue'} className="font-extrabold text-[10px] uppercase shadow-2xs m-0">
                                                {doc.documentType === 'thesis' ? 'Đồ Án Tốt Nghiệp' : 'E-Book'}
                                            </Tag>
                                            <Tag color="amber" className="font-bold text-[10px] uppercase shadow-2xs m-0">
                                                {doc.category || 'CNTT'}
                                            </Tag>
                                        </div>

                                        <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-md text-amber-300 font-mono text-[11px] font-black px-2.5 py-1 rounded-lg">
                                            {doc.docCode}
                                        </div>
                                    </div>

                                    {/* Title & Metadata */}
                                    <div className="space-y-2">
                                        <h3 className="font-black text-stone-900 text-sm md:text-base leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                                            {doc.title}
                                        </h3>

                                        <div className="space-y-1 text-xs text-stone-600 font-medium">
                                            <p className="line-clamp-1">
                                                <strong className="text-stone-800">Tác giả/SV:</strong> {doc.author}
                                            </p>
                                            {doc.advisor && (
                                                <p className="line-clamp-1">
                                                    <strong className="text-stone-800">GVHD:</strong> {doc.advisor}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono pt-1">
                                            <span>{doc.publishYear || 2026}</span>
                                            <span>•</span>
                                            <span>{doc.pages || 85} trang</span>
                                            <span>•</span>
                                            <span>{doc.fileSize || '5.0 MB'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions & Price */}
                                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                                    <div>
                                        <div className="text-[10px] text-stone-400 font-bold uppercase">Bản Quyền</div>
                                        <div className="text-sm font-black text-amber-900">
                                            {doc.price > 0 ? `${Number(doc.price).toLocaleString()}đ` : 'Miễn Phí'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            icon={<Eye className="w-3.5 h-3.5" />}
                                            onClick={() => navigate(`/digital-docs/${doc.id}`)}
                                            className="rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white border-none h-9 px-3.5 shadow-2xs"
                                        >
                                            Xem Chi Tiết & Đọc Thử (5 Trang)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
