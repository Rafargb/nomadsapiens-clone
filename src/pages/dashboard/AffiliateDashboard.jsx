import React, { useEffect, useState } from "react";
import { formatCurrency, formatError } from "../../lib/api";
import { getAffiliateStats } from "../../lib/transactionStore";
import { getCourses } from "../../lib/courseStore";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import { Share2, Copy, Plus, Check, TrendingUp, DollarSign, Users } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateDashboard() {
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ course_id: "", label: "" });
  const { user } = useAuth();
  const [copied, setCopied] = useState(null);

  const load = () => {
    if (!user) return;
    
    // Load links
    let savedLinks = [];
    try {
      const data = localStorage.getItem(`nomad_links_${user.id}`);
      if (data) savedLinks = JSON.parse(data);
    } catch(e) {}
    
    // Load stats
    const st = getAffiliateStats(user.id);
    
    // Update links with click/sales data (mocking clicks as sales for now since we don't track clicks)
    savedLinks = savedLinks.map(l => {
      const relatedSales = st.sales.filter(tx => {
        if (l.course_id) return tx.course_id === l.course_id;
        return true; // generic link
      });
      let earn = 0;
      relatedSales.forEach(tx => earn += tx.amount * 0.5);
      return { ...l, clicks: relatedSales.length * 3, sales: relatedSales.length, earnings: earn };
    });
    
    setLinks(savedLinks);
    setStats(st);
    getCourses().then(setCourses);
  };

  useEffect(() => {
    load();
    const handleTx = () => load();
    window.addEventListener("transactions_updated", handleTx);
    return () => window.removeEventListener("transactions_updated", handleTx);
  }, [user]);

  const create = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const courseId = form.course_id || null;
      const allCourses = await getCourses();
      const course = allCourses.find(c => c.id === courseId || c.course_id === courseId);
      
      const newLink = {
        link_id: `link_${Date.now()}`,
        course_id: courseId,
        course_title: course ? course.title : null,
        label: form.label || null,
        ref_code: user.id, // Using user ID as the ref code
        clicks: 0,
        sales: 0,
        earnings: 0
      };
      
      let savedLinks = [];
      try {
        const data = localStorage.getItem(`nomad_links_${user.id}`);
        if (data) savedLinks = JSON.parse(data);
      } catch(e) {}
      
      savedLinks.push(newLink);
      localStorage.setItem(`nomad_links_${user.id}`, JSON.stringify(savedLinks));
      
      toast.success("Link gerado com sucesso!");
      setDialogOpen(false);
      setForm({ course_id: "", label: "" });
      load();
    } catch (err) {
      toast.error(formatError(err));
    }
  };

  const buildUrl = (link) => {
    const origin = window.location.origin;
    if (link.course_id) return `${origin}/courses/${link.course_id}?ref=${link.ref_code}`;
    return `${origin}/?ref=${link.ref_code}`;
  };

  const copy = async (link) => {
    await navigator.clipboard.writeText(buildUrl(link));
    setCopied(link.link_id);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout title="Área do Afiliado" subtitle="Gere links, acompanhe conversões e receba suas comissões.">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Stat label="Ganhos totais" value={formatCurrency(stats?.total_earnings)} accent icon={<DollarSign size={20} />} />
        <Stat label="Pendente" value={formatCurrency(stats?.pending_commission)} icon={<TrendingUp size={20} />} />
        <Stat label="Cliques" value={stats?.total_clicks || 0} icon={<Users size={20} />} />
        <Stat label="Conversão" value={`${stats?.conversion_rate || 0}%`} icon={<Share2 size={20} />} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-black text-2xl">Seus links</h2>
        <button data-testid="create-link-btn" onClick={() => setDialogOpen(true)} className="btn-primary text-sm !py-2.5 !px-5">
          <Plus size={16} /> Gerar novo link
        </button>
      </div>

      <div className="nomad-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-nomad-sand/40 text-left text-xs uppercase tracking-wider text-nomad-muted">
              <tr>
                <th className="p-4">Label / Curso</th>
                <th className="p-4">URL</th>
                <th className="p-4">Cliques</th>
                <th className="p-4">Vendas</th>
                <th className="p-4">Ganhos</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nomad-muted" data-testid="no-links">
                    Nenhum link criado ainda. Crie o primeiro!
                  </td>
                </tr>
              ) : (
                links.map((l) => (
                  <tr key={l.link_id} data-testid={`link-row-${l.link_id}`} className="border-t border-[#E6D7C3]">
                    <td className="p-4">
                      <div className="font-semibold">{l.label || (l.course_id ? "Por curso" : "Genérico")}</div>
                      <div className="text-xs text-nomad-muted">{l.course_title || "Plataforma inteira"}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-nomad-muted max-w-xs truncate">
                      {buildUrl(l)}
                    </td>
                    <td className="p-4 font-semibold">{l.clicks}</td>
                    <td className="p-4 font-semibold">{l.sales}</td>
                    <td className="p-4 font-semibold text-[#2D4A22]">{formatCurrency(l.earnings)}</td>
                    <td className="p-4">
                      <button onClick={() => copy(l)} data-testid={`copy-link-${l.link_id}`} className="btn-ghost text-sm !py-1.5 !px-3">
                        {copied === l.link_id ? <Check size={14} /> : <Copy size={14} />}
                        {copied === l.link_id ? "Copiado" : "Copiar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDialogOpen(false)}>
          <div data-testid="create-link-dialog" className="nomad-card max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-black text-2xl mb-2">Gerar novo link</h3>
            <p className="text-sm text-nomad-muted mb-6">Deixe em branco para criar um link genérico da plataforma.</p>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Curso</label>
                <select
                  data-testid="link-course-select"
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="input-field mt-1.5"
                >
                  <option value="">— Link genérico (plataforma) —</option>
                  {courses.map((c) => (
                    <option key={c.id || c.course_id} value={c.id || c.course_id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Label (opcional)</label>
                <input
                  data-testid="link-label-input"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="input-field mt-1.5"
                  placeholder="Ex: Campanha Instagram"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setDialogOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" data-testid="link-submit" className="btn-primary flex-1">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, accent, icon }) {
  return (
    <div className={`rounded-2xl p-6 ${accent ? "bg-[#232F2A] text-white" : "bg-white border border-[#E6D7C3]"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accent ? "bg-white/10" : "bg-[#C05746]/10 text-[#C05746]"}`}>
        {icon}
      </div>
      <div className={`text-xs uppercase tracking-wider mt-4 ${accent ? "text-white/60" : "text-nomad-muted"}`}>{label}</div>
      <div className="font-heading font-black text-3xl mt-1">{value}</div>
    </div>
  );
}
