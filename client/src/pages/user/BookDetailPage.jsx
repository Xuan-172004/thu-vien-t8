import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Button, Table, Tooltip, message, Breadcrumb, Spin, Divider } from 'antd';
import { 
  BookOpen, 
  ShoppingBag, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  ShieldAlert, 
  Share2, 
  Heart, 
  Layers, 
  Building2, 
  Calendar, 
  Hash, 
  FileText,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import Footer from '../../components/Footer';
import { useRentalCart } from '../../context/rentalCartContext';
import axiosInstance from '../../api/axiosInstance';
import BookCard from '../../components/BookCard';

export function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isBookInCart } = useRentalCart();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    const fetchBookDetail = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/books/${id}`);
        const data = res.metadata || res.data?.metadata || res.data || res;
        if (data && (data.id || data.title)) {
          const rawCopies = data.copies || [];
          const formattedCopies = rawCopies.map((c, idx) => ({
            id: c.id || `c-${idx}`,
            dkcbCode: c.dkcbCode || `DKCB-2026-${String(idx + 1).padStart(4, '0')}`,
            warehouse: c.warehouse?.name || c.location || 'Kho Sách Thư Viện',
            shelf: c.shelf?.name || c.shelf || 'Kệ A1',
            condition: c.conditionText || c.physicalCondition || 'Rất tốt (95%)',
            status: c.status || 'Available',
            statusText: c.statusText || (c.status === 'Available' ? 'Có sẵn trong kho' : 'Đang mượn'),
          }));

          setBook({
            id: data.id,
            title: data.title,
            author: data.author || 'Chưa cập nhật',
            publisher: data.publisher || 'NXB Đại Học Quốc Gia',
            publishYear: data.year || data.publishYear || 2024,
            isbn: data.isbn || '978-604-0-12345-6',
            pages: data.pages || 320,
            categoryName: data.Category?.name || data.categoryName || 'Tủ Sách Chuyên Ngành',
            rentalPricePerDay: data.price7Days ? Math.round(data.price7Days / 7) : 5000,
            depositPrice: data.deposit || 100000,
            cover: data.cover || data.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            rating: Number(data.rating) || 4.9,
            reviewsCount: data.reviewsCount || 38,
            available: data.availableCopies !== undefined ? data.availableCopies : (data.totalCopies || 0),
            description: data.description || data.summary || 'Tài liệu giáo trình và sách chuyên khảo chuẩn từ Thư viện.',
            copies: formattedCopies,
          });

          // Fetch related books in the same category
          try {
            const relRes = await axiosInstance.get(`/api/books?category=${data.categoryId || ''}&limit=5`);
            const relBooks = relRes.metadata?.books || (Array.isArray(relRes.metadata) ? relRes.metadata : (relRes.data?.books || relRes.data || []));
            if (Array.isArray(relBooks)) {
              setRelatedBooks(relBooks.filter(b => String(b.id) !== String(id)).slice(0, 4).map(b => ({
                id: b.id,
                title: b.title,
                author: b.author || 'Tác giả',
                category: b.categoryId || 'all',
                categoryName: b.categoryName || 'Tủ Sách Thư Viện',
                cover: b.cover || b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
                rating: Number(b.rating) || 4.9,
                reviewsCount: b.reviewsCount || 24,
                available: b.availableCopies !== undefined ? b.availableCopies : 4,
              })));
            }
          } catch (relErr) {
            console.warn('Error fetching related books:', relErr);
          }
        }
      } catch (err) {
        console.warn('Error fetching book detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      addToCart(book);
    }
  };

  const handleBorrowNow = () => {
    if (book) {
      addToCart(book);
      navigate('/cart');
    }
  };

  const copyColumns = [
    {
      title: 'Mã ĐKCB',
      dataIndex: 'dkcbCode',
      key: 'dkcbCode',
      render: (text) => <span className="font-mono font-bold text-amber-900">{text}</span>,
    },
    {
      title: 'Kho & Vị Trí Kệ',
      key: 'location',
      render: (_, r) => (
        <div className="flex items-center gap-1.5 text-xs text-stone-700">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{r.warehouse} ({r.shelf})</span>
        </div>
      ),
    },
    {
      title: 'Tình Trạng Sách',
      dataIndex: 'condition',
      key: 'condition',
      render: (text) => <Tag color="blue" className="font-bold text-xs">{text}</Tag>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) =>
        status === 'Available' || status === 'Sẵn sàng' ? (
          <Tag color="emerald" className="font-extrabold text-xs">Sẵn Sàng Cho Mượn</Tag>
        ) : (
          <Tag color="orange" className="font-bold text-xs">Đang Được Mượn</Tag>
        ),
    },
  ];

  if (loading || !book) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
        <TopHeader />
        <MainHeader />
        <div className="flex-1 flex items-center justify-center py-20">
          <Spin size="large" tip="Đang tải thông tin sách..." />
        </div>
        <Footer />
      </div>
    );
  }

  const inCart = isBookInCart(book.id);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
      <TopHeader />
      <MainHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { title: <a onClick={() => navigate('/')}>Trang chủ</a> },
              { title: <span>Tủ sách</span> },
              { title: <span className="font-bold text-stone-900">{book.title}</span> },
            ]}
          />

          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="rounded-xl font-bold text-xs"
          >
            Quay lại danh mục
          </Button>
        </div>

        {/* Main Book Detail Section */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Book Cover & Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-md group">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-amber-600 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-sm">
                CÒN {book.available} BẢN SAO
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button icon={<Heart className="w-4 h-4 text-red-500" />} className="rounded-xl font-bold text-xs flex-1">
                Yêu Thích
              </Button>
              <Button icon={<Share2 className="w-4 h-4 text-stone-600" />} className="rounded-xl font-bold text-xs flex-1">
                Chia Sẻ
              </Button>
            </div>
          </div>

          {/* Right: Book Meta & Action Box (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag color="amber" className="font-black text-xs px-2.5 py-0.5 rounded-lg border-amber-300">
                  {book.categoryName}
                </Tag>
                <div className="flex items-center gap-1 font-bold text-stone-800 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span>{book.rating}</span>
                  <span className="text-stone-400">({book.reviewsCount} đánh giá)</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">
                {book.title}
              </h1>

              <p className="text-sm font-bold text-stone-600">
                Tác giả: <span className="text-amber-800 font-extrabold">{book.author}</span>
              </p>

              {/* Metadata List - Vertical Layout */}
              <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200/80 text-xs divide-y divide-stone-200/60 space-y-2.5">
                <div className="flex items-center justify-between pt-0">
                  <span className="text-stone-500 font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    Nhà xuất bản:
                  </span>
                  <span className="font-extrabold text-stone-900 text-right">{book.publisher || 'NXB Tổng Hợp'}</span>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-stone-500 font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    Năm xuất bản:
                  </span>
                  <span className="font-extrabold text-stone-900">{book.publishYear || 2024}</span>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-stone-500 font-bold flex items-center gap-2">
                    <Hash className="w-4 h-4 text-amber-700" />
                    Mã chuẩn ISBN:
                  </span>
                  <span className="font-mono font-extrabold text-stone-900">{book.isbn || '978-604-56-7890-1'}</span>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-stone-500 font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    Số trang:
                  </span>
                  <span className="font-extrabold text-stone-900">{book.pages || 350} trang</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200">
              <Button
                size="large"
                icon={<ShoppingBag className="w-5 h-5" />}
                onClick={handleAddToCart}
                className={`rounded-2xl font-extrabold text-xs h-12 ${
                  inCart ? 'bg-amber-100 text-amber-800 border-amber-300' : 'border-stone-300'
                }`}
              >
                {inCart ? 'Đã Có Trong Giỏ Mượn' : 'Thêm Vào Giỏ Mượn'}
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={handleBorrowNow}
                className="rounded-2xl font-extrabold text-xs h-12 bg-amber-600 hover:bg-amber-700 border-none shadow-md"
              >
                Mượn Ngay (Đến Giỏ Hàng)
              </Button>
            </div>

          </div>

        </div>

        {/* Section: Physical Copies List in Inventory */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-stone-900 text-base">Danh Sách Bản Sao ĐKCB & Vị Trí Trong Kho</h3>
            </div>
            <Tag color="amber" className="font-bold text-xs">Tổng {book.copies.length} bản sao</Tag>
          </div>

          <Table
            columns={copyColumns}
            dataSource={book.copies}
            rowKey="id"
            pagination={false}
            size="middle"
            className="custom-table"
          />
        </div>

        {/* Section: Book Summary / Description */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>Giới Thiệu & Tóm Tắt Nội Dung</span>
          </h3>
          <div
              className="prose prose-sm max-w-none text-xs md:text-sm leading-relaxed text-stone-700 book-summary"
              dangerouslySetInnerHTML={{ __html: book.description || '' }}
              />
        </div>

        {/* Section: Related Books */}
        {relatedBooks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-stone-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Sách Cùng Thể Loại Có Thể Bạn Thích</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relBook) => (
                <BookCard
                  key={relBook.id}
                  book={relBook}
                  onQuickView={() => navigate(`/books/${relBook.id}`)}
                  onAddToCart={() => addToCart(relBook)}
                  isBookInCart={isBookInCart(relBook.id)}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default BookDetailPage;
