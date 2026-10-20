import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  Tag, 
  Tabs, 
  Modal, 
  Card, 
  Table, 
  Steps, 
  Alert, 
  Empty, 
  Spin,
  Tooltip
} from 'antd';
import { 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Sparkles, 
  Send, 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  FileCheck,
  User,
  Building,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';
import { 
  submitThesisApi, 
  getMyThesesApi, 
  uploadThesisPdfApi, 
  resubmitThesisApi 
} from '../../api/thesisSubmission.api';

const { TextArea } = Input;

const facultyOptions = [
  { value: 'CNTT', label: 'Công Nghệ Thông Tin & AI' },
  { value: 'Kinh Tế', label: 'Kinh Tế & Quản Trị Kinh Doanh' },
  { value: 'Khoa Học', label: 'Khoa Học Tự Nhiên & Kỹ Thuật' },
  { value: 'Y Dược', label: 'Y Khoa & Dược Học' },
  { value: 'Ngoại Ngữ', label: 'Ngoại Ngữ & Sư Phạm' },
  { value: 'Tâm Lý', label: 'Tâm Lý & Xã Hội Học' },
];

const thesisTypeOptions = [
  { value: 'bachelor', label: 'Khóa luận Tốt nghiệp Cử nhân / Kỹ sư' },
  { value: 'master', label: 'Luận văn Thạc sĩ' },
  { value: 'doctoral', label: 'Luận án Tiến sĩ' },
  { value: 'scientific_paper', label: 'Báo cáo NCKH Sinh viên cấp Trường' },
];

export default function ThesisSubmissionPage() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isAuthenticated = auth.isAuthenticated ?? !!user;

  const [activeTab, setActiveTab] = useState('submit');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');

  const [myTheses, setMyTheses] = useState([]);
  const [loadingTheses, setLoadingTheses] = useState(false);

  // Resubmit Modal State
  const [resubmitModalVisible, setResubmitModalVisible] = useState(false);
  const [editingThesis, setEditingThesis] = useState(null);
  const [resubmitForm] = Form.useForm();

  // Load user submissions
  const loadMySubmissions = async () => {
    if (!isAuthenticated) return;
    setLoadingTheses(true);
    try {
      const res = await getMyThesesApi();
      const list = res.metadata || res.data || [];
      setMyTheses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Load my theses err:', err);
    } finally {
      setLoadingTheses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMySubmissions();
    }
  }, [isAuthenticated]);

  // Handle PDF Upload
  const handlePdfUpload = async ({ file }) => {
    if (file.type !== 'application/pdf') {
      showToast.error('Vui lòng chỉ tải lên file định dạng PDF!');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast.error('Kích thước file PDF không được vượt quá 50MB!');
      return false;
    }

    setUploadingPdf(true);
    try {
      const res = await uploadThesisPdfApi(file);
      const data = res.metadata || res.data;
      if (data?.url) {
        setPdfFileUrl(data.url);
        setPdfFileName(file.name);
        setPdfFileSize(data.size || `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
        form.setFieldsValue({ pdfFile: data.url });
        showToast.success('Tải lên file PDF toàn văn thành công!');
      }
    } catch (err) {
      showToast.error('Tải file PDF thất bại, vui lòng thử lại!');
    } finally {
      setUploadingPdf(false);
    }
    return false;
  };

  // Submit new thesis
  const handleFinishSubmit = async (values) => {
    if (!isAuthenticated) {
      showToast.info('Vui lòng đăng nhập để nộp hồ sơ đồ án lưu chiểu!');
      navigate('/auth');
      return;
    }

    if (!pdfFileUrl) {
      showToast.warning('Vui lòng đính kèm file PDF đồ án toàn văn!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        pdfFile: pdfFileUrl,
        fileSize: pdfFileSize,
      };

      await submitThesisApi(payload);
      showToast.success('Nộp đồ án lưu chiểu thành công! Hồ sơ đang chờ Thủ thư duyệt.');
      form.resetFields();
      setPdfFileUrl('');
      setPdfFileName('');
      setActiveTab('history');
      loadMySubmissions();
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ!');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Resubmit Modal
  const handleOpenResubmit = (thesis) => {
    setEditingThesis(thesis);
    resubmitForm.setFieldsValue({
      title: thesis.title,
      advisor: thesis.advisor,
      abstract: thesis.abstract,
      faculty: thesis.faculty,
      thesisType: thesis.thesisType,
      pdfFile: thesis.pdfFile,
    });
    setPdfFileUrl(thesis.pdfFile);
    setPdfFileName('File PDF đồ án hiện tại');
    setResubmitModalVisible(true);
  };

  // Submit Resubmission
  const handleFinishResubmit = async (values) => {
    if (!editingThesis) return;
    setSubmitting(true);
    try {
      await resubmitThesisApi(editingThesis.id, {
        ...values,
        pdfFile: pdfFileUrl || editingThesis.pdfFile,
      });
      showToast.success('Đã cập nhật và nộp lại hồ sơ thành công!');
      setResubmitModalVisible(false);
      setEditingThesis(null);
      loadMySubmissions();
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Lỗi cập nhật hồ sơ!');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ DUYỆT LƯU CHIỂU
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5" /> YÊU CẦU CHỈNH SỬA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> CHỜ THỦ THƯ DUYỆT
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col justify-between">
      <TopHeader />
      <MainHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white p-8 md:p-12 mb-8 shadow-xl border border-stone-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Cổng Nộp Tài Liệu Học Thuật & Lưu Chiểu Số
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Nộp Khóa Luận Tốt Nghiệp & Luận Văn Thạc Sĩ
            </h1>

            <p className="text-sm md:text-base text-stone-300 font-medium leading-relaxed">
              Hệ thống tiếp nhận, kiểm duyệt thể thức và lưu trữ bản mềm số hóa các công trình nghiên cứu, 
              khóa luận, đồ án sinh viên phục vụ bảo tồn và chia sẻ học thuật trong toàn trường.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-stone-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">1</div>
                <div className="text-xs">
                  <div className="font-bold text-white">Điền Thông Tin</div>
                  <div className="text-stone-400 text-[11px]">Đề tài, GVHD, Khoa/Ngành</div>
                </div>
              </div>
              <div className="bg-stone-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">2</div>
                <div className="text-xs">
                  <div className="font-bold text-white">Tải File PDF</div>
                  <div className="text-stone-400 text-[11px]">Toàn văn & tóm tắt đề tài</div>
                </div>
              </div>
              <div className="bg-stone-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">3</div>
                <div className="text-xs">
                  <div className="font-bold text-white">Xuất Bản Kho Số</div>
                  <div className="text-stone-400 text-[11px]">Thủ thư cấp mã lưu chiểu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-sm ${
              activeTab === 'submit'
                ? 'bg-stone-900 text-white shadow-stone-900/20 scale-[1.02]'
                : 'bg-white text-stone-600 hover:bg-amber-50/60 border border-stone-200'
            }`}
          >
            <Send className="w-4 h-4 text-amber-500" />
            Nộp Hồ Sơ Đồ Án Mới
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              loadMySubmissions();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-sm ${
              activeTab === 'history'
                ? 'bg-stone-900 text-white shadow-stone-900/20 scale-[1.02]'
                : 'bg-white text-stone-600 hover:bg-amber-50/60 border border-stone-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-amber-500" />
            Hồ Sơ Đã Nộp Của Tôi ({myTheses.length})
          </button>
        </div>

        {/* TAB 1: FORM NỘP HỒ SƠ */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-stone-200 shadow-2xs">
            <div className="mb-6 pb-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  Thông Tin Hồ Sơ Đồ Án / Luận Văn Lưu Chiểu
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-1">
                  Vui lòng cung cấp chính xác thông tin theo đúng bản in nộp hội đồng bảo vệ tốt nghiệp.
                </p>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinishSubmit}
              initialValues={{
                faculty: 'CNTT',
                thesisType: 'bachelor',
                defenseYear: 2026,
                pages: 80,
                studentName: user?.fullName || '',
                author: user?.fullName || '',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Tiêu đề đồ án */}
                <div className="md:col-span-12">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Tên đề tài Khóa luận / Đồ án tốt nghiệp *</span>}
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                  >
                    <Input 
                      placeholder="Ví dụ: Xây dựng hệ thống quản lý thư viện số và tra cứu học thuật tích hợp AI..."
                      className="h-11 rounded-xl text-sm font-semibold"
                    />
                  </Form.Item>
                </div>

                {/* Họ tên sinh viên & MSSV */}
                <div className="md:col-span-6">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Họ và tên Tác giả / Sinh viên thực hiện *</span>}
                    name="studentName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên sinh viên!' }]}
                  >
                    <Input 
                      placeholder="Nguyễn Văn A" 
                      className="h-11 rounded-xl text-sm font-medium"
                    />
                  </Form.Item>
                </div>

                <div className="md:col-span-6">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Mã số Sinh viên (MSSV / Học viên) *</span>}
                    name="studentId"
                    rules={[{ required: true, message: 'Vui lòng nhập MSSV!' }]}
                  >
                    <Input 
                      placeholder="SV2022001" 
                      className="h-11 rounded-xl text-sm font-mono font-bold"
                    />
                  </Form.Item>
                </div>

                {/* Giảng viên hướng dẫn & Đồng tác giả */}
                <div className="md:col-span-6">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Giảng viên hướng dẫn (Kèm học hàm, học vị) *</span>}
                    name="advisor"
                    rules={[{ required: true, message: 'Vui lòng nhập tên GVHD!' }]}
                  >
                    <Input 
                      placeholder="PGS.TS. Trần Minh Khoa" 
                      className="h-11 rounded-xl text-sm font-medium"
                    />
                  </Form.Item>
                </div>

                <div className="md:col-span-6">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Đồng tác giả (Nếu làm theo nhóm)</span>}
                    name="coAuthors"
                  >
                    <Input 
                      placeholder="Lê Thị B (MSSV: SV2022002)" 
                      className="h-11 rounded-xl text-sm font-medium"
                    />
                  </Form.Item>
                </div>

                {/* Khoa & Loại đồ án */}
                <div className="md:col-span-4">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Khoa / Viện Đào tạo *</span>}
                    name="faculty"
                    rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}
                  >
                    <Select 
                      options={facultyOptions}
                      className="h-11 rounded-xl text-xs font-bold"
                    />
                  </Form.Item>
                </div>

                <div className="md:col-span-4">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Bậc đào tạo / Loại hình *</span>}
                    name="thesisType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại hình!' }]}
                  >
                    <Select 
                      options={thesisTypeOptions}
                      className="h-11 rounded-xl text-xs font-bold"
                    />
                  </Form.Item>
                </div>

                <div className="md:col-span-2">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Năm bảo vệ</span>}
                    name="defenseYear"
                  >
                    <Input 
                      type="number"
                      className="h-11 rounded-xl text-sm font-bold text-center"
                    />
                  </Form.Item>
                </div>

                <div className="md:col-span-2">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Tổng số trang</span>}
                    name="pages"
                  >
                    <Input 
                      type="number"
                      className="h-11 rounded-xl text-sm font-bold text-center"
                    />
                  </Form.Item>
                </div>

                {/* Upload PDF */}
                <div className="md:col-span-12">
                  <div className="bg-stone-50 p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-500 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-stone-900">
                          {pdfFileName ? (
                            <span className="text-emerald-700 font-black flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Đã chọn file: {pdfFileName} ({pdfFileSize})
                            </span>
                          ) : (
                            'Đính kèm File PDF Đồ Án Toàn Văn'
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Định dạng .pdf, tối đa 50MB (Bao gồm trang bìa có chữ ký và toàn văn nội dung)
                        </div>
                      </div>

                      <Upload 
                        customRequest={handlePdfUpload} 
                        showUploadList={false}
                        accept=".pdf"
                      >
                        <Button 
                          loading={uploadingPdf} 
                          className="rounded-xl font-black text-xs bg-white hover:bg-stone-100 border border-stone-300 h-10 px-5 shadow-2xs cursor-pointer"
                        >
                          {uploadingPdf ? 'Đang tải file lên...' : (pdfFileUrl ? 'Thay đổi file PDF khác' : 'Chọn file PDF từ máy tính')}
                        </Button>
                      </Upload>

                      {pdfFileUrl && (
                        <a 
                          href={pdfFileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Xem trước file PDF vừa tải lên
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tóm tắt đề tài */}
                <div className="md:col-span-12">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Tóm tắt nội dung đề tài & Đóng góp nghiên cứu (Abstract) *</span>}
                    name="abstract"
                    rules={[{ required: true, message: 'Vui lòng nhập tóm tắt đề tài!' }]}
                  >
                    <TextArea 
                      rows={5}
                      placeholder="Trình bày mục tiêu nghiên cứu, phương pháp thực hiện, kết quả đạt được và hướng phát triển tương lai..."
                      className="rounded-xl text-sm"
                    />
                  </Form.Item>
                </div>

                {/* Từ khóa */}
                <div className="md:col-span-12">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Từ khóa nghiên cứu (Cách nhau bằng dấu phẩy)</span>}
                    name="keywords"
                  >
                    <Input 
                      placeholder="React, Machine Learning, Digital Library, Blockchain..."
                      className="h-11 rounded-xl text-sm"
                    />
                  </Form.Item>
                </div>

              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <Button 
                  onClick={() => form.resetFields()} 
                  className="rounded-xl font-bold text-xs h-11 px-6 border-stone-200"
                >
                  Xóa Làm Lại
                </Button>
                <Button 
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<Send className="w-4 h-4" />}
                  className="rounded-xl font-black text-xs h-11 px-8 bg-amber-600 hover:bg-amber-700 border-none shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Gửi Hồ Sơ Phê Duyệt
                </Button>
              </div>

            </Form>
          </div>
        )}

        {/* TAB 2: DANH SÁCH ĐỒ ÁN ĐÃ NỘP */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                Hồ Sơ Đồ Án Lưu Chiểu Đã Nộp
              </h2>
              <Button 
                icon={<RefreshCw className={`w-3.5 h-3.5 ${loadingTheses ? 'animate-spin' : ''}`} />}
                onClick={loadMySubmissions}
                className="rounded-xl font-bold text-xs"
              >
                Làm mới
              </Button>
            </div>

            {loadingTheses ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-2xs">
                <Spin size="large" />
                <div className="text-xs font-bold text-stone-500 mt-2">Đang tải danh sách hồ sơ...</div>
              </div>
            ) : myTheses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {myTheses.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Tag color="stone" className="font-bold text-xs rounded-lg">
                          Khoa: {item.faculty}
                        </Tag>
                        <Tag color="amber" className="font-bold text-xs rounded-lg">
                          Năm: {item.defenseYear}
                        </Tag>
                      </div>

                      <div className="text-xs text-stone-400 font-medium">
                        Ngày nộp: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-stone-900 hover:text-amber-700 transition-colors">
                        {item.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium text-stone-600 mt-2">
                        <div>Tác giả: <span className="font-bold text-stone-900">{item.studentName} ({item.studentId})</span></div>
                        <div>GVHD: <span className="font-bold text-stone-900">{item.advisor}</span></div>
                        <div>Số trang: <span className="font-bold text-stone-900">{item.pages} trang ({item.fileSize || '5MB'})</span></div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50 p-3 rounded-xl border border-stone-100">
                      {item.abstract}
                    </p>

                    {/* Rejection / Modification alert */}
                    {item.status === 'rejected' && (
                      <Alert
                        type="error"
                        showIcon
                        message={<span className="font-bold text-xs">Yêu cầu từ Thủ thư:</span>}
                        description={<span className="text-xs">{item.rejectReason || 'Vui lòng kiểm tra lại file đồ án và thông tin.'}</span>}
                        className="rounded-2xl"
                      />
                    )}

                    {/* Approved details & Link */}
                    {item.status === 'approved' && item.digitalDocument && (
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-emerald-900 font-medium space-y-0.5">
                          <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Đã xuất bản lên Kho Tài Liệu Số Thư Viện
                          </div>
                          <div>Mã lưu chiểu: <span className="font-mono font-bold">{item.digitalDocument.docCode}</span></div>
                        </div>

                        <Button 
                          type="primary"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/digital-docs/${item.digitalDocument.id}`)}
                          className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs border-none shadow-sm"
                        >
                          Xem Trên Kho Số
                        </Button>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <a 
                        href={item.pdfFile} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-300 bg-white"
                      >
                        <FileText className="w-3.5 h-3.5" /> Xem File PDF Đã Nộp
                      </a>

                      {item.status === 'rejected' && (
                        <Button 
                          type="primary"
                          onClick={() => handleOpenResubmit(item)}
                          className="bg-amber-600 hover:bg-amber-700 rounded-xl font-bold text-xs border-none"
                        >
                          Chỉnh Sửa & Nộp Lại
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-2xs">
                <Empty 
                  description={
                    <div className="space-y-1">
                      <div className="font-extrabold text-stone-800 text-sm">Bạn chưa nộp hồ sơ đồ án nào</div>
                      <div className="text-xs text-stone-400">Hãy chuyển sang tab "Nộp Hồ Sơ Đồ Án Mới" để gửi hồ sơ lưu chiểu</div>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* Resubmit Modal */}
      <Modal
        title={
          <div className="font-black text-base text-stone-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            Chỉnh Sửa & Nộp Lại Hồ Sơ Đồ Án
          </div>
        }
        open={resubmitModalVisible}
        onCancel={() => setResubmitModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-3xl"
      >
        <Form
          form={resubmitForm}
          layout="vertical"
          onFinish={handleFinishResubmit}
          className="pt-4"
        >
          <Form.Item
            label={<span className="font-bold text-xs">Tên đề tài *</span>}
            name="title"
            rules={[{ required: true }]}
          >
            <Input className="rounded-xl" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs">Giảng viên hướng dẫn *</span>}
            name="advisor"
            rules={[{ required: true }]}
          >
            <Input className="rounded-xl" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs">Tóm tắt nội dung đề tài *</span>}
            name="abstract"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} className="rounded-xl" />
          </Form.Item>

          <div className="mb-4 bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center justify-between">
            <div className="text-xs text-stone-600">
              File PDF: <span className="font-bold">{pdfFileName || 'File hiện tại'}</span>
            </div>
            <Upload customRequest={handlePdfUpload} showUploadList={false} accept=".pdf">
              <Button size="small" className="rounded-lg font-bold text-xs" loading={uploadingPdf}>
                Đổi file PDF mới
              </Button>
            </Upload>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setResubmitModalVisible(false)} className="rounded-xl font-bold text-xs">
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting} 
              className="bg-amber-600 hover:bg-amber-700 rounded-xl font-bold text-xs border-none"
            >
              Lưu & Nộp Lại
            </Button>
          </div>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
}
