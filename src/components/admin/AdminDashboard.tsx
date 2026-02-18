import { useState, useEffect } from "react";
import {
  getEstablishment, setEstablishment,
  getCategories, setCategories,
  getProducts, setProducts,
  setAdminAuth, generateId,
} from "@/lib/store";
import { Establishment, Category, Product, MAX_PRODUCTS } from "@/lib/types";
import { Store, LogOut, Plus, Trash2, Edit2, Save, X, QrCode, Copy, Link, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<"profile" | "categories" | "products">("profile");
  const [estab, setEstab] = useState<Establishment>(getEstablishment);
  const [cats, setCats] = useState<Category[]>(getCategories);
  const [prods, setProds] = useState<Product[]>(getProducts);
  const [showQr, setShowQr] = useState(false);

  // Editing states
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  const publicUrl = `${window.location.origin}/${estab.slug}`;

  const saveEstab = () => {
    setEstablishment(estab);
    toast.success("Perfil salvo!");
  };

  // Categories
  const addCategory = () => {
    const newCat: Category = { id: generateId(), name: "Nova Categoria", order: cats.length };
    const updated = [...cats, newCat];
    setCats(updated);
    setCategories(updated);
    setEditingCat(newCat.id);
    setCatName(newCat.name);
  };

  const saveCat = (id: string) => {
    const updated = cats.map((c) => (c.id === id ? { ...c, name: catName } : c));
    setCats(updated);
    setCategories(updated);
    setEditingCat(null);
  };

  const deleteCat = (id: string) => {
    const updated = cats.filter((c) => c.id !== id);
    setCats(updated);
    setCategories(updated);
    // Remove products in this category
    const updatedProds = prods.filter((p) => p.categoryId !== id);
    setProds(updatedProds);
    setProducts(updatedProds);
  };

  // Products
  const addProduct = () => {
    if (prods.length >= MAX_PRODUCTS) {
      toast.error(`Plano básico permite até ${MAX_PRODUCTS} produtos.`);
      return;
    }
    const newProd: Product = {
      id: generateId(),
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: cats[0]?.id || "",
      active: true,
    };
    setEditingProd(newProd);
  };

  const saveProd = () => {
    if (!editingProd) return;
    if (!editingProd.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    const exists = prods.find((p) => p.id === editingProd.id);
    let updated: Product[];
    if (exists) {
      updated = prods.map((p) => (p.id === editingProd.id ? editingProd : p));
    } else {
      updated = [...prods, editingProd];
    }
    setProds(updated);
    setProducts(updated);
    setEditingProd(null);
    toast.success("Produto salvo!");
  };

  const deleteProd = (id: string) => {
    const updated = prods.filter((p) => p.id !== id);
    setProds(updated);
    setProducts(updated);
  };

  const toggleProdActive = (id: string) => {
    const updated = prods.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setProds(updated);
    setProducts(updated);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  const handleLogout = () => {
    setAdminAuth(false);
    onLogout();
  };

  const tabs = [
    { id: "profile" as const, label: "Perfil" },
    { id: "categories" as const, label: "Categorias" },
    { id: "products" as const, label: "Produtos" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQr(!showQr)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
              <QrCode className="h-5 w-5" />
            </button>
            <button onClick={handleLogout} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* QR Code Modal */}
        {showQr && (
          <div className="mb-4 rounded-2xl bg-card p-6 shadow-card text-center">
            <h3 className="font-bold text-foreground mb-3">QR Code do Cardápio</h3>
            <div className="inline-block rounded-xl bg-card p-4 border border-border">
              <QRCodeSVG value={publicUrl} size={180} />
            </div>
            <div className="mt-4 flex items-center gap-2 justify-center">
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{publicUrl}</span>
              <button onClick={copyLink} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Copy className="h-3 w-3" /> Copiar
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-secondary p-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-card p-5 shadow-card space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Logo (URL da imagem)</label>
                <input
                  value={estab.logo}
                  onChange={(e) => setEstab({ ...estab, logo: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome do estabelecimento</label>
                <input
                  value={estab.name}
                  onChange={(e) => setEstab({ ...estab, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                <textarea
                  value={estab.description}
                  onChange={(e) => setEstab({ ...estab, description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
                <input
                  value={estab.slug}
                  onChange={(e) => setEstab({ ...estab, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">WhatsApp (com DDD e código do país)</label>
                <input
                  value={estab.whatsapp}
                  onChange={(e) => setEstab({ ...estab, whatsapp: e.target.value })}
                  placeholder="5511999999999"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Status</span>
                <button
                  onClick={() => setEstab({ ...estab, isOpen: !estab.isOpen })}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    estab.isOpen ? "bg-primary text-primary-foreground" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {estab.isOpen ? "Aberto" : "Fechado"}
                </button>
              </div>
              <button onClick={saveEstab} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
                <Save className="inline h-4 w-4 mr-1" /> Salvar Perfil
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        {tab === "categories" && (
          <div className="space-y-3">
            {cats.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 rounded-xl bg-card p-3 shadow-card">
                {editingCat === cat.id ? (
                  <>
                    <input
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    <button onClick={() => saveCat(cat.id)} className="rounded-full p-2 text-primary hover:bg-secondary">
                      <Save className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingCat(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                    <button onClick={() => { setEditingCat(cat.id); setCatName(cat.name); }} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteCat(cat.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
            <button onClick={addCategory} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="h-4 w-4" /> Nova Categoria
            </button>
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-right">{prods.length}/{MAX_PRODUCTS} produtos</p>
            
            {/* Edit Product Modal */}
            {editingProd && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
                <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">{prods.find(p => p.id === editingProd.id) ? "Editar" : "Novo"} Produto</h3>
                    <button onClick={() => setEditingProd(null)} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    value={editingProd.name}
                    onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                    placeholder="Nome do produto"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={editingProd.description}
                    onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                    placeholder="Descrição curta"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editingProd.price || ""}
                    onChange={(e) => setEditingProd({ ...editingProd, price: parseFloat(e.target.value) || 0 })}
                    placeholder="Preço"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={editingProd.image}
                    onChange={(e) => setEditingProd({ ...editingProd, image: e.target.value })}
                    placeholder="URL da imagem (opcional)"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <select
                    value={editingProd.categoryId}
                    onChange={(e) => setEditingProd({ ...editingProd, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button onClick={saveProd} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
                    Salvar Produto
                  </button>
                </div>
              </div>
            )}

            {prods.map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card">
                <div className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary ${!prod.active ? 'opacity-40' : ''}`}>
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 text-xs">IMG</div>
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${!prod.active ? 'opacity-40' : ''}`}>
                  <p className="text-sm font-medium text-foreground truncate">{prod.name || "Sem nome"}</p>
                  <p className="text-xs text-primary font-semibold">R$ {prod.price.toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleProdActive(prod.id)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                    {prod.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditingProd({ ...prod })} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteProd(prod.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addProduct} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="h-4 w-4" /> Novo Produto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
