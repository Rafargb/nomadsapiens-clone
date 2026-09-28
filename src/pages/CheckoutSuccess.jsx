import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, getPersistedRef } from "../lib/api";
import Navbar from "../components/Navbar";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { getCourses } from "../lib/courseStore";
import { enrollUser, hasCourseAccess } from "../lib/enrollmentStore";
import { registerTransaction } from "../lib/transactionStore";
import { useAuth } from "../context/AuthContext";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("pending");
  const [tx, setTx] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!sessionId) return;

    if (sessionId.startsWith("mock-session-id")) {
      const courseId = params.get("course_id");
      const allCourses = getCourses();
      const matched = allCourses.find(c => c.id === courseId || c.course_id === courseId);
      const title = matched ? matched.title : "Curso Nômade";
      setTx({
        course_title: title,
        payment_status: "paid"
      });
      setStatus("paid");
      
      // Extract numeric price from course, default to 99
      const priceStr = matched ? (matched.price || "$99.00") : "$99.00";
      const amount = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 99;

      // Determine Origin
      const ref = getPersistedRef();
      const isProducer = params.get("producer") === "1";
      const origin = ref ? "affiliate" : (isProducer ? "producer" : "platform");


      const timer = setInterval(() => {
        setAttempts(a => {
          if (a >= 3) {
            clearInterval(timer);
            setStatus("paid");
            // Realizar a matrícula
            if (user && courseId) {
              hasCourseAccess(user.id, courseId).then(hasAccess => {
                if (!hasAccess) {
                  enrollUser(user.id, courseId);
                  
                  getCourses().then(allCourses => {
                    const matched = allCourses.find(c => c.id === courseId || c.course_id === courseId);
                    const priceStr = matched ? (matched.price || "$99.00") : "$99.00";
                    const amount = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 99;
                    const ref = getPersistedRef();
                    const origin = ref ? "affiliate" : (params.get("producer") === "1" ? "producer" : "platform");

                    registerTransaction({
                      course_id: courseId,
                      amount: amount,
                      affiliate_id: ref,
                      origin: origin
                    });
                  });
                }
              });
            }
            return a;
          }
          return a + 1;
        });
      }, 800);
      return () => clearInterval(timer);
    }

    const poll = async (n = 0) => {
      if (n >= 10) {
        setStatus("timeout");
        return;
      }
      try {
        const { data } = await api.get(`/checkout/status/${sessionId}`);
        setTx(data);
        if (data.payment_status === "paid") {
          setStatus("paid");
          // Realizar a matrícula
          const courseId = params.get("course_id");
          if (user && courseId) {
            if (!(await hasCourseAccess(user.id, courseId))) {
              await enrollUser(user.id, courseId);
              
              const allCourses = await getCourses();
              const matched = allCourses.find(c => c.id === courseId || c.course_id === courseId);
              const priceStr = matched ? (matched.price || "$99.00") : "$99.00";
              const amount = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 99;
              const ref = getPersistedRef();
              const origin = ref ? "affiliate" : (params.get("producer") === "1" ? "producer" : "platform");

              await registerTransaction({
                course_id: courseId,
                course_title: matched ? matched.title : "Curso",
                amount: amount,
                origin: origin,
                affiliate_id: ref,
                buyer_id: user.id
              });
            }
          }
          return;
        }
        if (data.status === "expired") {
          setStatus("expired");
          return;
        }
        setAttempts(n + 1);
        setTimeout(() => poll(n + 1), 2500);
      } catch {
        setStatus("error");
      }
    };
    poll(0);
  }, [sessionId, params]);

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <Navbar />
      <section className="pt-32 pb-20 nomad-container">
        <div className="max-w-xl mx-auto nomad-card p-10 text-center" data-testid="checkout-result">
          {status === "paid" && (
            <>
              <div className="inline-flex w-20 h-20 rounded-full bg-[#2D4A22] items-center justify-center text-white mb-5">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="font-heading font-black text-4xl">Pagamento confirmado!</h1>
              <p className="mt-3 text-nomad-muted">
                Você agora faz parte do curso <strong>{tx?.course_title}</strong>. Boa jornada, nômade.
              </p>
              {!user ? (
                <div className="mt-8 border-t border-[#E6D7C3] pt-8">
                  <h2 className="font-heading font-black text-2xl mb-2">Quase lá!</h2>
                  <p className="text-nomad-muted mb-4">Seu pagamento está vinculado ao e-mail <b>{params.get("guest_email")}</b>. Defina uma senha para acessar as aulas agora mesmo.</p>
                  <Link to={`/register?email=${encodeURIComponent(params.get("guest_email") || '')}&name=${encodeURIComponent(params.get("guest_name") || '')}`} className="btn-primary w-full max-w-[200px] mb-4">
                    Criar minha senha
                  </Link>
                  <div className="text-sm text-nomad-muted mt-2">
                    Já tem conta? <Link to="/login" className="text-[#C05746] font-bold underline">Faça login</Link> para vincular a compra.
                  </div>
                </div>
              ) : (
                <Link to="/dashboard" className="btn-primary mt-8 inline-flex" data-testid="go-dashboard">
                  Ir para o dashboard <ArrowRight size={18} />
                </Link>
              )}
            </>
          )}
          {status === "pending" && (
            <>
              <div className="inline-flex w-20 h-20 rounded-full bg-nomad-sand items-center justify-center text-[#C05746] mb-5 animate-pulse">
                <Clock size={40} />
              </div>
              <h1 className="font-heading font-black text-3xl">Processando pagamento...</h1>
              <p className="mt-3 text-nomad-muted">Aguarde alguns segundos (tentativa {attempts + 1}).</p>
            </>
          )}
          {(status === "expired" || status === "error" || status === "timeout") && (
            <>
              <div className="inline-flex w-20 h-20 rounded-full bg-[#C05746] items-center justify-center text-white mb-5">
                <XCircle size={40} />
              </div>
              <h1 className="font-heading font-black text-3xl">Ops, algo deu errado</h1>
              <p className="mt-3 text-nomad-muted">
                Verifique seu email ou tente novamente em alguns minutos.
              </p>
              <Link to="/courses" className="btn-secondary mt-8 inline-flex">
                Voltar aos cursos
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
