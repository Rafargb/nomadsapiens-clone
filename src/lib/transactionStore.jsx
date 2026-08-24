import { supabase } from "./supabaseClient";

const TRANSACTIONS_KEY = "nomad_transactions_v1";
const WITHDRAWALS_KEY = "nomad_withdrawals_v1";

export async function getTransactions() {
  try {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw error;
    return data || [];
  } catch (e) {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  }
}

export async function registerTransaction(tx) {
  const newTx = {
    ...tx,
    id: `tx_${Date.now()}`,
    status: "completed",
    created_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('transactions').insert([newTx]);
    if (error) throw error;
  } catch (e) {
    const existing = await getTransactions();
    existing.push(newTx);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(existing));
  }
  
  window.dispatchEvent(new Event("transactions_updated"));
  return newTx;
}

export async function getAdminStats() {
  const txs = await getTransactions();
  
  const stats = {
    gmv: 0,
    platform_revenue: 0,
    sales_count: txs.length,
    users_count: 0,
    affiliates_count: 0,
    producers_count: 0,
    by_channel: {
      platform: 0,
      affiliate: 0,
      producer: 0
    }
  };

  txs.forEach(tx => {
    stats.gmv += tx.amount;
    stats.by_channel[tx.origin || 'platform'] += tx.amount;
    
    // Opção A: Plataforma sempre pega 10% do total
    stats.platform_revenue += (tx.amount * 0.10); 
  });

  return stats;
}

/**
 * Calcula as estatísticas para um afiliado específico
 */
export function getAffiliateStats(affiliateId, transactions = []) {
  const affiliateSales = transactions.filter(tx => tx.affiliate_id === affiliateId);
  
  let total_earnings = 0;
  
  affiliateSales.forEach(tx => {
    // Opção A: Afiliado ganha 45% do valor da venda
    total_earnings += tx.amount * 0.45;
  });

  return {
    total_sales: affiliateSales.length,
    total_earnings,
    sales: affiliateSales
  };
}

// -------------------------------------------------------------
// WEB3 / FINANCIAL MODULE (WITHDRAWALS)
// -------------------------------------------------------------

export async function getWithdrawals() {
  const data = localStorage.getItem(WITHDRAWALS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function requestWithdrawal(producerId, amount, walletAddress) {
  const withdrawals = await getWithdrawals();
  const newRequest = {
    id: `wd_${Date.now()}`,
    producer_id: producerId,
    amount,
    wallet_address: walletAddress,
    status: "pending",
    created_at: new Date().toISOString()
  };
  
  withdrawals.push(newRequest);
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
  window.dispatchEvent(new Event("withdrawals_updated"));
  return newRequest;
}

export async function updateWithdrawalStatus(withdrawalId, status) {
  const withdrawals = await getWithdrawals();
  const updated = withdrawals.map(w => w.id === withdrawalId ? { ...w, status } : w);
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("withdrawals_updated"));
}

export async function getProducerStats(producerId) {
  const txs = await getTransactions();
  // Filter sales that belong to this producer
  // In a real DB, txs would have producer_id. For now, we simulate or rely on tx.producer_id.
  const producerSales = txs.filter(tx => tx.producer_id === producerId || tx.origin === 'producer');
  
  let total_earnings = 0;
  
  producerSales.forEach(tx => {
    if (tx.origin === 'affiliate') {
      // Opção A: Plataforma 10%, Afiliado 45%, Produtor 45%
      total_earnings += tx.amount * 0.45;
    } else {
      // Produtor ganha os 90% sozinho (Plataforma 10%)
      total_earnings += tx.amount * 0.90;
    }
  });

  const withdrawals = await getWithdrawals();
  const producerWithdrawals = withdrawals.filter(w => w.producer_id === producerId);
  
  let total_withdrawn = 0;
  let pending_withdrawals = 0;

  producerWithdrawals.forEach(w => {
    if (w.status === "completed") total_withdrawn += w.amount;
    if (w.status === "pending") pending_withdrawals += w.amount;
  });

  const available_balance = total_earnings - total_withdrawn - pending_withdrawals;

  return {
    total_sales: producerSales.length,
    total_earnings,
    available_balance,
    total_withdrawn,
    pending_withdrawals,
    sales: producerSales,
    withdrawals: producerWithdrawals
  };
}
