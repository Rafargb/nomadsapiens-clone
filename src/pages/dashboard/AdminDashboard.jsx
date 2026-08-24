import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../lib/api";
import { getAdminStats, getTransactions, getWithdrawals, updateWithdrawalStatus } from "../../lib/transactionStore";
import DashboardLayout from "../../components/DashboardLayout";
import AdminSettings from "./AdminSettings";
import {
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Shield,
  Share2,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    // Carregar usuários do localStorage (salvos no register)
    const storedUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nomad_user_")) {
        try {
          storedUsers.push(JSON.parse(localStorage.getItem(key)));
        } catch(e) {}
      }
    }
    setUsers(storedUsers);

    const loadData = async () => {
      const stats = await getAdminStats();
      const allTxs = await getTransactions();

      const affiliatesList = storedUsers.filter(u => u.role === 'affiliate' || u.role === 'producer');
      const affiliatesStats = affiliatesList.map(a => {
        const aSales = allTxs.filter(tx => tx.affiliate_id === a.id);
        let earn = 0;
        aSales.forEach(tx => earn += tx.amount * 0.5);
        return { ...a, total_clicks: 0, total_sales: aSales.length, total_earnings: earn };
      });
      setAffiliates(affiliatesStats);

      setStats({
        ...stats,
        users_count: storedUsers.length,
        affiliates_count: storedUsers.filter(u => u.role === 'affiliate').length,
        producers_count: storedUsers.filter(u => u.role === 'producer').length,
      });
      setSales(Array.isArray(allTxs) ? [...allTxs].reverse() : []);
      
      const wds = await getWithdrawals();
      setWithdrawals(Array.isArray(wds) ? [...wds].reverse() : []);
    };
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("transactions_updated", handleUpdate);
    window.addEventListener("withdrawals_updated", handleUpdate);
    return () => {
      window.removeEventListener("transactions_updated", handleUpdate);
      window.removeEventListener("withdrawals_updated", handleUpdate);
    };
  }, []);

  const handleApproveWithdrawal = async (id) => {
    if(!window.confirm("Confirmar que a transferência DPIX já foi realizada?")) return;
    await updateWithdrawalStatus(id, "completed");
  };

  const handleRejectWithdrawal = async (id) => {
    if(!window.confirm("Rejeitar este saque?")) return;
    await updateWithdrawalStatus(id, "rejected");
  };

  const ORIGIN_LABEL = { affiliate: "Afiliado", platform: "Plataforma", producer: "Direto" };

  return (
    <DashboardLayout title="Admin" subtitle="Controle total da plataforma Nomad Sapiens.">
      <div className="grid md:grid-cols-4 gap-5 mb-8">
        <Stat label="GMV" value={formatCurrency(stats?.gmv)} accent icon={<DollarSign size={20} />} testid="admin-gmv" />
        <Stat label="Receita Plataforma" value={formatCurrency(stats?.platform_revenue)} icon={<Shield size={20} />} testid="admin-platform-rev" />
        <Stat label="Vendas" value={stats?.sales_count || 0} icon={<TrendingUp size={20} />} testid="admin-sales-count" />
        <Stat label="Usuários" value={stats?.users_count || 0} icon={<Users size={20} />} testid="admin-users-count" />
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="nomad-card p-6">
          <div className="overline">Por canal</div>
          <div className="mt-4 space-y-3">
            {stats?.by_channel &&
              Object.entries(stats.by_channel).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between" data-testid={`channel-${k}`}>
                  <span className="font-medium">{ORIGIN_LABEL[k]}</span>
                  <span className="font-heading font-black">{formatCurrency(v)}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="nomad-card p-6">
          <div className="overline">Afiliados</div>
          <div className="font-heading font-black text-4xl mt-2">{stats?.affiliates_count || 0}</div>
          <div className="text-sm text-nomad-muted">usuários promovendo</div>
        </div>
        <div className="nomad-card p-6">
          <div className="overline">Produtores</div>
          <div className="font-heading font-black text-4xl mt-2">{stats?.producers_count || 0}</div>
          <div className="text-sm text-nomad-muted">criando cursos</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#E6D7C3] mb-6 overflow-x-auto pb-2">
        {["overview", "withdrawals", "users", "sales", "affiliates", "settings"].map((t) => (
          <button
            key={t}
            data-testid={`admin-tab-${t}`}
            onClick={() => setTab(t)}
            className={`px-5 py-3 font-semibold capitalize border-b-2 transition whitespace-nowrap ${
              tab === t ? "border-[#C05746] text-[#C05746]" : "border-transparent text-nomad-muted"
            }`}
          >
            {t === "overview" ? "Visão geral" : t === "withdrawals" ? "Saques Pendentes" : t === "users" ? "Usuários" : t === "sales" ? "Vendas" : t === "settings" ? "Configurações" : "Afiliados"}
          </button>
        ))}
      </div>

      {tab === "settings" && <AdminSettings />}

      {tab === "withdrawals" && (
        <div className="nomad-card p-8">
           <h3 className="font-heading font-black text-2xl mb-6">Pedidos de Saque (DPIX/Web3)</h3>
           <div className="space-y-4">
              {withdrawals.length === 0 ? (
                 <div className="text-nomad-muted py-8 text-center border border-dashed border-[#E6D7C3] rounded-xl">Nenhum saque solicitado.</div>
              ) : (
                 withdrawals.map(w => {
                    const prod = users.find(u => u.id === w.producer_id);
                    return (
                       <div key={w.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-[#FDFBF7] border border-[#E6D7C3] rounded-xl gap-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <span className="font-bold">{prod?.name || w.producer_id}</span>
                               <span className="text-xs text-nomad-muted">{new Date(w.created_at).toLocaleDateString()}</span>
                             </div>
                             <div className="text-sm font-mono bg-black/5 px-2 py-1 rounded inline-block text-black/70">
                               {w.wallet_address}
                             </div>
                          </div>
                          <div className="text-center md:text-right">
                             <div className="font-heading font-black text-xl">{formatCurrency(w.amount)}</div>
                             <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${w.status === 'completed' ? 'text-emerald-500' : w.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                               {w.status}
                             </div>
                          </div>
                          {w.status === 'pending' && (
                             <div className="flex gap-2">
                                <button onClick={() => handleApproveWithdrawal(w.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition">APROVAR</button>
                                <button onClick={() => handleRejectWithdrawal(w.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition">REJEITAR</button>
                             </div>
                          )}
                       </div>
                    );
                 })
              )}
           </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="nomad-card p-8">
          <h3 className="font-heading font-black text-2xl mb-4">Visão Geral</h3>
          <p className="text-nomad-muted">
            A plataforma tem processado {stats?.sales_count || 0} vendas com GMV de {formatCurrency(stats?.gmv)}.
            Receita total da plataforma: {formatCurrency(stats?.platform_revenue)}.
          </p>
        </div>
      )}

      {tab === "users" && (
        <div className="nomad-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-nomad-sand/40 text-left text-xs uppercase tracking-wider text-nomad-muted">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Papel</th>
                <th className="p-4">Criado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#E6D7C3]" data-testid={`user-${u.id}`}>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-nomad-muted">{u.email}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-nomad-sand/60 capitalize">{u.role}</span></td>
                  <td className="p-4 text-nomad-muted">Hoje</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "sales" && (
        <div className="nomad-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-nomad-sand/40 text-left text-xs uppercase tracking-wider text-nomad-muted">
              <tr>
                <th className="p-4">Curso</th>
                <th className="p-4">Origem</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-[#E6D7C3]">
                  <td className="p-4 font-medium">{s.course_title}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-nomad-sand/60">{ORIGIN_LABEL[s.origin] || s.origin}</span></td>
                  <td className="p-4">{formatCurrency(s.amount)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${s.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-nomad-muted">{new Date(s.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "affiliates" && (
        <div className="nomad-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-nomad-sand/40 text-left text-xs uppercase tracking-wider text-nomad-muted">
              <tr>
                <th className="p-4">Afiliado</th>
                <th className="p-4">Email</th>
                <th className="p-4">Cliques</th>
                <th className="p-4">Vendas</th>
                <th className="p-4">Ganhos</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="border-t border-[#E6D7C3]">
                  <td className="p-4 font-medium">{a.name}</td>
                  <td className="p-4 text-nomad-muted">{a.email}</td>
                  <td className="p-4">{a.total_clicks}</td>
                  <td className="p-4">{a.total_sales}</td>
                  <td className="p-4 text-[#2D4A22] font-semibold">{formatCurrency(a.total_earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, accent, icon, testid }) {
  return (
    <div data-testid={testid} className={`rounded-2xl p-6 ${accent ? "bg-[#232F2A] text-white" : "bg-white border border-[#E6D7C3]"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accent ? "bg-white/10" : "bg-[#C05746]/10 text-[#C05746]"}`}>{icon}</div>
      <div className={`text-xs uppercase tracking-wider mt-4 ${accent ? "text-white/60" : "text-nomad-muted"}`}>{label}</div>
      <div className="font-heading font-black text-3xl mt-1">{value}</div>
    </div>
  );
}
