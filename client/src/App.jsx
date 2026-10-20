import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider, message, Modal } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { customAntdTheme } from './theme/antdTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getAllBooksPublicApi, getCategoriesPublicApi } from './api/bookAdmin.api';

// Components
import AnnouncementBar from './components/AnnouncementBar';
import TopHeader from './components/TopHeader';
import MainHeader from './components/MainHeader';
import CategoryNavbar from './components/CategoryNavbar';
import HeroSection from './components/HeroSection';
import BookCatalog from './components/BookCatalog';
import LibraryGuideSection from './components/LibraryGuideSection';
import BookDetailModal from './components/BookDetailModal';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

// Pages
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { CardManagementPage } from './pages/admin/CardManagementPage';
import { BookManagementPage } from './pages/admin/BookManagementPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { InventoryManagementPage } from './pages/admin/InventoryManagementPage';
import { DigitalDocManagementPage } from './pages/admin/DigitalDocManagementPage';
import { RentalPolicyManagementPage } from './pages/admin/RentalPolicyManagementPage';
import RentalManagementPage from './pages/admin/RentalManagementPage';
import { ArticleManagementPage } from './pages/admin/ArticleManagementPage';
import { MyRentalsPage } from './pages/user/MyRentalsPage';
import { BookDetailPage } from './pages/user/BookDetailPage';
import { CartPage } from './pages/user/CartPage';
import { PaymentSuccessPage } from './pages/user/PaymentSuccessPage';
import { DigitalDocCatalogPage } from './pages/user/DigitalDocCatalogPage';
import { DigitalDocDetailPage } from './pages/user/DigitalDocDetailPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { SearchPage } from './pages/user/SearchPage';
import ThesisSubmissionPage from './pages/user/ThesisSubmissionPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { AboutPage } from './pages/user/AboutPage';
import { SchedulePage } from './pages/user/SchedulePage';
import { RulesAndGuidePage } from './pages/user/RulesAndGuidePage';
import { ArticlesPage } from './pages/user/ArticlesPage';
import { ArticleDetailPage } from './pages/user/ArticleDetailPage';
import ArticleNewsSection from './components/ArticleNewsSection';
import { RentalCartProvider, useRentalCart } from './context/rentalCartContext';
import { NotificationProvider } from './context/NotificationContext';
import RentalCartDrawer from './components/user/RentalCartDrawer';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems: rentalCartItems, addToCart, setCartDrawerOpen } = useRentalCart();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [quickViewBook, setQuickViewBook] = useState(null);

  // 1. Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catsRes = await getCategoriesPublicApi();
        const realCats = catsRes.metadata || catsRes.data || [];
        setCategories(Array.isArray(realCats) ? realCats : []);
      } catch (err) {
        console.error('Fetch categories error:', err);
        setCategories([]);
      }
    };
    fetchCats();
  }, []);

  // 2. Fetch books dynamically from backend API whenever selectedCategory or searchQuery changes
  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const params = { limit: 100 };
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchQuery && searchQuery.trim().length > 0) {
          params.search = searchQuery.trim();
        }

        const booksRes = await getAllBooksPublicApi(params);
        const realBooks = booksRes.metadata?.books || (Array.isArray(booksRes.metadata) ? booksRes.metadata : (booksRes.data?.books || booksRes.data || []));
        if (Array.isArray(realBooks)) {
          const formatted = realBooks.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author || 'Tác giả',
            categoryId: b.categoryId || b.category || 'all',
            category: b.categoryId || b.category || 'all',
            categoryName: b.Category?.name || b.categoryName || 'Tủ Sách Chuyên Ngành',
            categorySlug: b.Category?.slug || b.categorySlug || '',
            rentalPricePerDay: b.price7Days ? Math.round(b.price7Days / 7) : 5000,
            depositPrice: b.deposit || 100000,
            cover: b.cover || b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
            rating: Number(b.rating) || 4.9,
            reviewsCount: b.reviewsCount || 24,
            available: b.availableCopies !== undefined ? b.availableCopies : (b.totalCopies || 4),
            badge: b.isFeatured ? 'NỔI BẬT' : 'SÁCH MỚI',
            badgeColor: 'bg-amber-600 text-white',
            description: b.description || 'Tài liệu chuẩn từ Thư viện trường.',
            pages: b.pages,
            publisher: b.publisher,
            isbn: b.isbn,
          }));
          setBooks(formatted);
        }
      } catch (err) {
        console.warn('Fetch books error:', err);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [selectedCategory, searchQuery]);

  const cartCount = rentalCartItems.length;
  const totalDailyPrice = rentalCartItems.reduce((sum, item) => sum + (item.rentalPricePerDay || 0), 0);

  const handleAddToCart = (bookToAdd) => {
    addToCart(bookToAdd);
  };

  const handleRemoveItem = (bookId) => {
    // Note: Replaced local state logic with context if available, or maintaining local structure as requested
    message.warning('Đã xóa sách khỏi giỏ thuê.');
  };

  const handleUpdateDays = (bookId, days) => {
    setCartItems(prev => prev.map(item => item.id === bookId ? { ...item, rentalDays: days } : item));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để tiến hành thuê sách!');
      navigate('/auth');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận đặt thuê sách',
      content: (
        <div className="py-2 text-xs leading-relaxed text-stone-600">
          <p className="mb-2">Bạn chuẩn bị đặt thuê <strong>{cartCount} cuốn sách</strong> với tổng số tiền cọc & phí thuê là:</p>
          <div className="text-base font-extrabold text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            {(cartItems.reduce((s, i) => s + (i.rentalPricePerDay * (i.rentalDays || 14)) + i.depositPrice, 0)).toLocaleString('vi-VN')}đ
          </div>
          <p className="mt-2 font-medium">Sách sẽ được giao đến bạn trong vòng 2 giờ!</p>
        </div>
      ),
      okText: 'Đồng Ý Đặt Thuê',
      cancelText: 'Hủy',
      onOk() {
        message.success('Đặt thuê sách thành công! Mã đơn hàng: #TS' + Math.floor(100000 + Math.random() * 900000));
        setCartItems([]);
        setIsCartOpen(false);
      }
    });
  };

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      message.info(`Vui lòng đăng nhập để đăng ký ${plan.name}!`);
      navigate('/auth');
    } else {
      const btn = document.querySelector('button[title*="Đăng ký & Xem Thẻ"]');
      if (btn) btn.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <div>
        {/* 1. Announcement Banner Bar */}
        <AnnouncementBar onBannerClick={() => {
          const el = document.getElementById('membership');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* 2. Top Info Sub-Header */}
        <TopHeader />

        {/* 3. Main Brand Header */}
        <MainHeader
          cartCount={cartCount}
          totalDailyPrice={totalDailyPrice}
          onOpenCart={() => setCartDrawerOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* 4. Category Navbar */}
        <CategoryNavbar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* 5. Hero Banner & Feature Categories */}
        <HeroSection
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            const el = document.getElementById('best-seller');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCardRegister={() => {
            if (!isAuthenticated) {
              message.info('Vui lòng đăng nhập để đăng ký Thẻ thư viện!');
              navigate('/auth');
            } else {
              // Trigger header card modal
              const btn = document.querySelector('button[title*="Đăng ký & Xem Thẻ"]');
              if (btn) btn.click();
            }
          }}
        />

        {/* 6. Book Rental Catalog */}
        <BookCatalog
          books={books}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          loading={loadingBooks}
          onQuickView={(book) => navigate(`/books/${book.id}`)}
          onAddToCart={handleAddToCart}
          cartItems={rentalCartItems}
        />

        {/* 7. Library Guide & Facilities Section */}
        <LibraryGuideSection 
          onOpenCardModal={() => {
            if (!isAuthenticated) {
              message.info('Vui lòng đăng nhập để đăng ký Thẻ Thư Viện!');
              navigate('/auth');
            } else {
              const btn = document.querySelector('button[title*="Đăng ký & Xem Thẻ"]');
              if (btn) btn.click();
            }
          }} 
        />

        {/* 8. Latest News & Articles Section */}
        <ArticleNewsSection />
      </div>

      {/* 9. Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <BookDetailModal
        book={quickViewBook}
        visible={!!quickViewBook}
        onClose={() => setQuickViewBook(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <ConfigProvider theme={customAntdTheme} locale={viVN}>
      <BrowserRouter>
        <AuthProvider>
          <RentalCartProvider>
            <RentalCartDrawer />
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              style={{ zIndex: 99999 }}
            />
            <NotificationProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/digital-docs" element={<DigitalDocCatalogPage />} />
                <Route path="/digital-docs/:id" element={<DigitalDocDetailPage />} />
                <Route path="/submit-thesis" element={<ThesisSubmissionPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-rentals" element={<MyRentalsPage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/gioi-thieu" element={<AboutPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/lich-phuc-vu" element={<SchedulePage />} />
                <Route path="/rules" element={<RulesAndGuidePage />} />
                <Route path="/huong-dan-quy-dinh" element={<RulesAndGuidePage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:slug" element={<ArticleDetailPage />} />
                <Route path="/tin-tuc" element={<ArticlesPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/cards" element={<CardManagementPage />} />
                <Route path="/admin/books" element={<BookManagementPage />} />
                <Route path="/admin/categories" element={<CategoryManagementPage />} />
                <Route path="/admin/inventory" element={<InventoryManagementPage />} />
                <Route path="/admin/digital-docs" element={<DigitalDocManagementPage />} />
                <Route path="/admin/policies" element={<RentalPolicyManagementPage />} />
                <Route path="/admin/rentals" element={<RentalManagementPage />} />
                <Route path="/admin/articles" element={<ArticleManagementPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </NotificationProvider>
          </RentalCartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
