import React, { useState } from "react";
import { CreditCard, Loader2, ChevronDown, QrCode, Copy, CheckCircle2, Tag, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerTransaction } from "../lib/transactionStore";
import { enrollUser } from "../lib/enrollmentStore";

export default function CheckoutModal({ course, onClose, user }) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="min-h-full flex items-center justify-center p-4">
        {/* Backdrop Area to close */}
        <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>
        
        {/* Main Checkout Form Wrapper */}
        <CheckoutForm course={course} user={user} onClose={onClose} />
      </div>
    </div>
  );
}

function CheckoutForm({ course, user, onClose }) {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix"); // "pix" or "card"
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Extract Order Bumps from Course Modules (Locked modules with a price)
  const orderBumps = (course.modules || []).filter(m => m.locked && m.price > 0);
  const [selectedBumps, setSelectedBumps] = useState([]);

  const toggleBump = (bumpId) => {
    setSelectedBumps(prev => prev.includes(bumpId) ? prev.filter(id => id !== bumpId) : [...prev, bumpId]);
  };

  // Fake Pix Address (under the hood it is DPIX)
  const pixAddress = "00020126580014br.gov.bcb.pix0136...";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código Pix copiado!");
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    // Qualquer código aplica 25% e vira o affiliate_id simulado
    setAppliedCoupon(couponCode.trim().toUpperCase());
    toast.success("Cupom de Afiliado aplicado! Você ganhou 25% de desconto.");
  };

  const getNumericPrice = () => {
    const priceStr = course.price || course.formattedPrice || "0";
    return parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
  };

  const getBumpsTotal = () => {
    return selectedBumps.reduce((sum, bumpId) => {
      const bump = orderBumps.find(b => b.id === bumpId);
      return sum + (bump ? bump.price : 0);
    }, 0);
  };

  const getFinalPrice = () => {
    const base = getNumericPrice() + getBumpsTotal();
    return appliedCoupon ? base * 0.75 : base;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=/courses/${course.id}`);
      return;
    }

    setPaying(true);

    // Simulando delay de blockchain ou operadora de cartão
    setTimeout(async () => {
      try {
        const basePrice = getNumericPrice();
        const finalPrice = getFinalPrice();
        const discountAmount = basePrice - finalPrice;

        // Registrar transação na plataforma
        await registerTransaction({
          user_id: user.id,
          course_id: course.id,
          producer_id: course.producerId,
          amount: finalPrice,
          payment_method: paymentMethod === 'pix' ? 'liquid_dpix' : 'credit_card',
          status: 'completed',
          origin: appliedCoupon ? 'affiliate' : 'platform',
          affiliate_id: appliedCoupon || null,
          discount_amount: discountAmount,
          purchased_bumps: selectedBumps
        });

        // Dar acesso ao aluno no coursePlayer
        await enrollUser(user.id, course.id, selectedBumps);

        // Ir para a página de sucesso
        const mockSessionId = `ws_mock_${Date.now()}`;
        navigate(`/checkout/success?session_id=${mockSessionId}&course_id=${course.id}`);
      } catch (err) {
        toast.error("Erro ao processar pagamento.");
        setPaying(false);
      }
    }, 2000);
  };
  
  return (
    <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl flex flex-col z-10 my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
      
      {/* Header with Rectangular Banner */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-full h-24 sm:h-28 bg-[#161111] rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-[#E4E4E6] shadow-sm flex-shrink-0">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br bg-[#C05746] to-[#FFB74D] flex items-center justify-center text-white font-bold text-2xl text-center p-4">
              {course.title}
            </div>
          )}
        </div>
        <h2 className="text-[20px] sm:text-[22px] font-bold text-[#202124] text-center leading-tight px-2">
          {course.title}
        </h2>
      </div>

      {/* Access Summary (Main Offer) */}
      <div className="mb-4">
        <h3 className="text-[14px] sm:text-[15px] font-bold text-[#202124] mb-3">Sua Compra</h3>
        <div className="border border-[#E4E4E6] rounded-xl p-4 bg-[#F8FAFF] shadow-sm flex items-center justify-between">
           <div>
              <div className="font-bold text-[#202124] text-[15px]">Acesso ao Curso Completo</div>
              <div className="text-[#5D6068] text-[12px] mt-1">Pagamento único. Acesso vitalício e suporte incluso.</div>
           </div>
           <div className="font-black text-[#2E6EF5] text-[18px]">{course.price || course.formattedPrice || "$0.00"}</div>
        </div>
      </div>

      {/* Order Bumps */}
      {orderBumps.length > 0 && (
        <div className="mb-5 bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-6 h-6 rounded-full bg-[#00B4A0]/20 flex items-center justify-center text-[#00B4A0]">
               <Flame size={14} />
             </div>
             <h3 className="text-[14px] font-bold text-[#202124]">Aproveite e turbine seus resultados:</h3>
          </div>
          
          <div className="space-y-3">
            {orderBumps.map(bump => {
              const isSelected = selectedBumps.includes(bump.id);
              return (
                <div 
                  key={bump.id} 
                  onClick={() => toggleBump(bump.id)}
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 bg-white shadow-sm hover:shadow-md ${isSelected ? 'border-[#00B4A0] ring-1 ring-[#00B4A0]' : 'border-[#E4E4E6] hover:border-[#00B4A0]/50'}`}
                >
                  {/* The Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    readOnly
                    className="mt-1 flex-shrink-0 w-5 h-5 cursor-pointer accent-[#00B4A0]"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-[#202124] text-[14px] leading-tight pr-2">{bump.title}</div>
                      <div className="font-black text-[#00B4A0] text-[14px] flex-shrink-0 bg-[#00B4A0]/10 px-2 py-0.5 rounded-md">+ ${bump.price.toFixed(2)}</div>
                    </div>
                    <div className="text-[#5D6068] text-[12px] leading-snug mt-1.5">
                      {bump.bumpDescription || "Adicione este módulo premium à sua compra agora mesmo."}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coupon Field */}
      <div className="mb-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
             <div className="flex items-center gap-2">
               <Tag size={16} />
               <span className="text-sm font-bold">Cupom {appliedCoupon} aplicado!</span>
             </div>
             <button onClick={() => setAppliedCoupon(null)} className="text-xs font-bold underline hover:text-green-900">Remover</button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex items-center bg-[#F6F6F8]/80 border border-[#E4E4E6] rounded-xl overflow-hidden focus-within:border-[#202124] focus-within:ring-1 focus-within:ring-[#202124] transition-all h-[48px] pr-1">
             <input 
               type="text" 
               placeholder="CÓDIGO DO CUPOM" 
               value={couponCode}
               onChange={e => setCouponCode(e.target.value)}
               className="flex-1 bg-transparent px-4 h-full text-sm font-bold outline-none uppercase text-[#202124] placeholder:text-[#5D6068]" 
             />
             <button type="submit" disabled={!couponCode} className="px-5 h-[38px] bg-[#161111] hover:bg-black text-white rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:bg-gray-300 shrink-0">
               Aplicar
             </button>
          </form>
        )}
      </div>

      {/* Payment Methods */}
      <div className="mb-5">
        <h3 className="text-[14px] sm:text-[15px] font-bold text-[#202124] mb-3">Método de Pagamento</h3>
        
        <div className="flex gap-2 mb-4 bg-[#F6F6F8] p-1 rounded-xl border border-[#E4E4E6]">
          <button 
            onClick={() => setPaymentMethod('pix')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${paymentMethod === 'pix' ? 'bg-white shadow-sm text-[#00B4A0]' : 'text-[#5D6068] hover:text-[#202124]'}`}
          >
            <QrCode size={16} /> Pix (10% Off)
          </button>
          <button 
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${paymentMethod === 'card' ? 'bg-white shadow-sm text-[#2E6EF5]' : 'text-[#5D6068] hover:text-[#202124]'}`}
          >
            <CreditCard size={16} /> Cartão
          </button>
        </div>

        {/* Dynamic Payment Content */}
        <div className="min-h-[240px]">
          {paymentMethod === 'pix' ? (
            <div className="border border-[#E4E4E6] rounded-xl p-5 bg-[#00B4A0]/5 flex flex-col items-center animate-fade-in text-center h-full justify-center">
               <div className="w-32 h-32 bg-white rounded-lg p-2 shadow-sm border border-[#00B4A0]/20 mb-3 flex items-center justify-center relative">
                 <QrCode size={100} className="text-[#00B4A0]" />
               </div>
               <p className="text-xs text-[#5D6068] mb-3">Escaneie o QR Code ou copie a chave abaixo para realizar o pagamento.</p>
               
               <div className="flex w-full items-center gap-2 bg-white border border-[#E4E4E6] rounded-lg p-2">
                  <div className="flex-1 text-xs font-mono text-[#5D6068] truncate text-left pl-2">{pixAddress}</div>
                  <button onClick={handleCopy} className="h-8 px-3 bg-[#00B4A0]/10 text-[#00B4A0] rounded-md hover:bg-[#00B4A0]/20 transition shrink-0 flex items-center gap-1 font-bold text-xs">
                    {copied ? <CheckCircle2 size={14}/> : <Copy size={14}/>} Copiar
                  </button>
               </div>
            </div>
          ) : (
            <div className="border border-[#E4E4E6] rounded-xl p-5 bg-blue-50/50 flex flex-col justify-center space-y-4 animate-fade-in h-full">
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-1">Número do Cartão (Simulação)</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-[#E4E4E6] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2E6EF5]" />
               </div>
               <div className="flex gap-3">
                  <div className="flex-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-1">Validade</label>
                     <input type="text" placeholder="MM/AA" className="w-full bg-white border border-[#E4E4E6] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2E6EF5]" />
                  </div>
                  <div className="flex-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-1">CVV</label>
                     <input type="text" placeholder="123" className="w-full bg-white border border-[#E4E4E6] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2E6EF5]" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-1">Nome no Cartão</label>
                  <input type="text" placeholder="Seu Nome Completo" className="w-full bg-white border border-[#E4E4E6] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2E6EF5]" />
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Details */}
      <div className="mb-5 pt-4 border-t border-[#E4E4E6] flex flex-col gap-2">
        {appliedCoupon && (
           <div className="flex justify-between items-center text-[13px] text-[#5D6068]">
             <div>Subtotal:</div>
             <div className="line-through">${getNumericPrice().toFixed(2)}</div>
           </div>
        )}
        {appliedCoupon && (
           <div className="flex justify-between items-center text-[13px] text-green-600 font-bold">
             <div>Desconto (25%):</div>
             <div>- ${(getNumericPrice() - getFinalPrice()).toFixed(2)}</div>
           </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-[13px] font-bold text-[#5D6068]">
            Total a pagar:
          </div>
          <div className="font-black text-[#202124] text-xl">${getFinalPrice().toFixed(2)}</div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handlePayment}
        disabled={paying}
        style={{ backgroundColor: paymentMethod === 'pix' ? '#00B4A0' : '#2E6EF5' }}
        className="w-full h-14 shrink-0 text-white rounded-xl font-bold text-[14px] uppercase tracking-wide transition-all flex items-center justify-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
      >
        {paying ? (
          <><Loader2 className="animate-spin mr-2" size={18} /> Processando Pagamento...</>
        ) : (
          paymentMethod === 'pix' ? 'Pagar com Pix' : 'Pagar com Cartão'
        )}
      </button>

    </div>
  );
}
