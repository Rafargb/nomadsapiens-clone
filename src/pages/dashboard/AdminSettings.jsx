import React, { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "../../lib/settingsStore";
import { toast } from "sonner";
import { Save, Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    hero_title: "",
    hero_subtitle: "",
    accent_color: "#C05746",
    logo_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(data => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("Configurações salvas com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#C05746]" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black font-heading">Configurações da Loja</h2>
          <p className="text-nomad-muted text-sm mt-1">Personalize a identidade visual da sua plataforma</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Salvar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="nomad-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><ImageIcon size={18} /> Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título Principal</label>
                <input 
                  type="text" 
                  name="hero_title"
                  value={settings.hero_title || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Aprenda as Habilidades do Futuro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <textarea 
                  name="hero_subtitle"
                  value={settings.hero_subtitle || ""}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Junte-se a milhares de alunos..."
                />
              </div>
            </div>
          </div>

          <div className="nomad-card p-6">
            <h3 className="font-bold mb-4">Cores & Logo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cor de Destaque (HEX)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    name="accent_color"
                    value={settings.accent_color || "#C05746"}
                    onChange={handleChange}
                    className="h-10 w-10 border-0 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    name="accent_color"
                    value={settings.accent_color || "#C05746"}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL do Logo</label>
                <input 
                  type="text" 
                  name="logo_url"
                  value={settings.logo_url || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <h3 className="font-bold mb-4">Live Preview</h3>
          <div className="border rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: "#F8F7F5" }}>
            <div className="p-4 border-b bg-white flex items-center justify-between">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-6" />
              ) : (
                <div className="font-black">NOMAD SAPIENS</div>
              )}
              <div className="flex gap-2">
                <div className="w-16 h-2 rounded bg-gray-200"></div>
                <div className="w-16 h-2 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="p-8 text-center" style={{ backgroundColor: "#161111", color: "white" }}>
              <h1 className="text-3xl font-black mb-3">{settings.hero_title || "Título Padrão"}</h1>
              <p className="text-sm opacity-80 mb-6">{settings.hero_subtitle || "Subtítulo padrão da plataforma"}</p>
              <button 
                className="px-6 py-2 rounded-full font-bold text-white text-sm"
                style={{ backgroundColor: settings.accent_color || "#C05746" }}
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
