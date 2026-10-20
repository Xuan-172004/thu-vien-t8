import React from 'react';
import { CheckCircle2, Zap, Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from 'antd';

export default function MembershipSection({ onSelectPlan, plans = [] }) {
  return (
    <section className="py-16 px-6 md:px-10 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-white rounded-3xl my-12 max-w-7xl mx-auto shadow-2xl relative overflow-hidden font-sans border border-stone-800" id="membership">
      
      {/* Decorative Glow Ambient Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Hệ Thống Thẻ Bạn Đọc Thư Viện</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Hạng Thẻ & Quyền Lợi Bạn Đọc
        </h2>
        <p className="text-stone-300 text-sm md:text-base leading-relaxed">
          Đăng ký Thẻ Thư Viện để mượn đọc sách in miễn phí 100%, sử dụng không gian nghiên cứu và tra cứu trực tuyến kho đồ án & luận văn.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {(plans || []).map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              plan.isPopular 
                ? 'bg-stone-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/20 md:-translate-y-2' 
                : 'bg-stone-950/80 border border-stone-800 hover:border-stone-700'
            }`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 fill-stone-950" />
                <span>{plan.badge || 'Được Độc Giả Chọn Nhất'}</span>
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-stone-400 text-xs min-h-[36px] mb-6 leading-relaxed">{plan.description}</p>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-stone-800">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">{plan.price}</span>
                <span className="text-xs text-stone-400 font-bold ml-1">{plan.period}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              type={plan.isPopular ? 'primary' : 'default'}
              size="large"
              className={`w-full font-black h-12 text-xs sm:text-sm rounded-xl ${
                plan.isPopular 
                  ? 'bg-amber-600 hover:bg-amber-700 border-none shadow-lg' 
                  : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
              }`}
              onClick={() => onSelectPlan(plan)}
            >
              {plan.buttonText}
            </Button>

          </div>
        ))}
      </div>

    </section>
  );
}
