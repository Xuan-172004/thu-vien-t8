import React from 'react';
import { Truck, Tag, Star, Globe, MapPin, HelpCircle, ChevronDown } from 'lucide-react';
import { Dropdown } from 'antd';

export default function TopHeader() {
    const languageItems = [
        { key: 'vi', label: 'Tiếng Việt (VN)' },
        { key: 'en', label: 'English (US)' },
    ];

    const locationItems = [
        { key: 'hn', label: 'Hà Nội' },
        { key: 'hcm', label: 'TP. Hồ Chí Minh' },
        { key: 'dn', label: 'Đà Nẵng' },
    ];

    return (
        <div className="bg-white border-b border-stone-200 text-stone-600 text-xs py-2 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
                {/* Left Features */}
                <div className="flex items-center gap-6 text-stone-600 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>Giao Hàng Tận Nơi 2H</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <span>Giá Thuê Chỉ Từ 2.000đ/ngày</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                            ))}
                        </div>
                        <span className="font-bold text-stone-800">5.0</span>
                        <span className="text-stone-400">(4.8k đánh giá)</span>
                    </div>
                </div>

                {/* Right Settings */}
                <div className="flex items-center gap-5 text-stone-500">
                    <Dropdown menu={{ items: languageItems }} trigger={['click']}>
                        <button className="flex items-center gap-1 hover:text-stone-900 cursor-pointer">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Tiếng Việt (VN)</span>
                            <ChevronDown className="w-3 h-3 text-stone-400" />
                        </button>
                    </Dropdown>

                    <Dropdown menu={{ items: locationItems }} trigger={['click']}>
                        <button className="flex items-center gap-1 hover:text-stone-900 cursor-pointer">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                                Giao đến: <strong>Hà Nội</strong>
                            </span>
                            <ChevronDown className="w-3 h-3 text-stone-400" />
                        </button>
                    </Dropdown>

                    <a href="#support" className="flex items-center gap-1 hover:text-stone-900">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hỗ Trợ</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
