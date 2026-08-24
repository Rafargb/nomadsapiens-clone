const ANNOUNCEMENTS_KEY = "nomad_announcements";

// Mock inicial para não ficar vazio na primeira vez
const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann_1",
    title: "Nova Aula de Contingência Liberada!",
    date: new Date().toISOString(),
    type: "update",
    content: "Acabamos de liberar o novo módulo avançado de contingência no Facebook Ads. Corre lá na Imersão para assistir.",
    link: "/dashboard"
  },
  {
    id: "ann_2",
    title: "Link da Call de Mentoria (Sexta-feira)",
    date: new Date(Date.now() - 86400000).toISOString(), // ontem
    type: "live",
    content: "Nossa próxima call de acompanhamento será nesta sexta-feira às 20h. Preparem suas dúvidas sobre escala de campanhas.",
    link: "#"
  }
];

export function getAnnouncements() {
  try {
    const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (!data) {
      // Popular mock inicial se estiver vazio
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    return JSON.parse(data).sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return INITIAL_ANNOUNCEMENTS;
  }
}

export function createAnnouncement(announcementData) {
  const announcements = getAnnouncements();
  
  const newAnn = {
    id: `ann_${Date.now()}`,
    date: new Date().toISOString(),
    ...announcementData
  };
  
  announcements.push(newAnn);
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  
  window.dispatchEvent(new Event("announcements_updated"));
  return newAnn;
}
