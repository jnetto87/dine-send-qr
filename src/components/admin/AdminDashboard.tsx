import { useEffect, useMemo, useState, ChangeEvent } from "react";
import {
  getEstablishment,
  setEstablishment,
  getCategories,
  setCategories,
  getProducts,
  setProducts,
  setAdminAuth,
  generateId,
} from "@/lib/store";
import { Establishment, Category, Product, MAX_PRODUCTS } from "@/lib/types";
import {
  Store,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  QrCode,
  Copy,
  Eye,
  EyeOff,
  MessageCircle,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<"profile" | "categories" | "products">("profile");
  const [estab, setEstab] = useState<Establishment>(getEstablishment);
  const [cats, setCats] = useState<Category[]>(getCategories);
  const [prods, setProds] = useState<Product[]>(getProducts);

  // ====== Ajustes / Config ======
  const SUPPORT_PHONE = "5592994054321"; // seu número de suporte

  // Modais / UI
  const [showQr, setShowQr] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Suporte
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const SUPPORT_MAX = 500;

  // Edição categorias
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catName, setCatName] = useState("");

  // ✅ BLOCO 1 (Drag & Drop de categorias) - corrigido
  // ✅ Drag & Drop de categorias (versão sem conflito de nomes)
  const [draggingCatId, setDraggingCatId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

  const reorderCategories = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    const fromIndex = cats.findIndex((c) => c.id === fromId);
    const toIndex = cats.findIndex((c) => c.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const copy = [...cats];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);

    const withOrder = copy.map((c, idx) => ({ ...c, order: idx }));

    setCats(withOrder);
    setCategories(withOrder);
    toast.success("Ordem das categorias atualizada!");
  };

  // 👇 agora com nomes únicos
  const onCatDragStartCategory = (id: string) => (e: React.DragEvent<HTMLElement>) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingCatId(id);
  };

  const onCatDragOverCategory = (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // ✅ obrigatório pra permitir drop
    if (dragOverCatId !== id) setDragOverCatId(id);
  };

  const onCatDropCategory = (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingCatId) return;
    reorderCategories(draggingCatId, id);
    setDraggingCatId(null);
    setDragOverCatId(null);
  };

  const onCatDragEndCategory = () => {
    setDraggingCatId(null);
    setDragOverCatId(null);
  };


  // Edição produtos
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  // Regras de imagem
  const MAX_IMAGE_BYTES = 200 * 1024; // 200KB
  const MAX_DIMENSION = 1080;

  const MAX_LOGO_BYTES = 200 * 1024; // 200KB
  const MAX_LOGO_DIMENSION = 1080;

  const tabs = [
    { id: "profile" as const, label: "Perfil" },
    { id: "categories" as const, label: "Categorias" },
    { id: "products" as const, label: "Produtos" },
  ];


  const themeOptions = [
    { key: "verde", label: "Verde" },
    { key: "azul", label: "Azul" },
    { key: "roxo", label: "Roxo" },
    { key: "laranja", label: "Laranja" },
    { key: "rosa", label: "Rosa" },
  ] as const;

  const publicUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${estab.slug}`;
  }, [estab.slug]);

  // Aplica o tema sempre que mudar (e ao abrir a tela)
  useEffect(() => {
    const theme = (estab as any)?.theme || "verde";
    document.documentElement.dataset.theme = theme;
  }, [estab]);

  const saveEstab = () => {
    setEstablishment(estab);
    toast.success("Perfil salvo!");
  };

  const setTheme = (key: (typeof themeOptions)[number]["key"]) => {
    setEstab((prev) => ({ ...prev, theme: key } as any));
    document.documentElement.dataset.theme = key;
  };

  // ====== Categories ======
  const addCategory = () => {
    const newCat: Category = {
      id: generateId(),
      name: "Nova Categoria",
      order: cats.length,
    };
    const updated = [...cats, newCat];
    setCats(updated);
    setCategories(updated);
    setEditingCat(newCat.id);
    setCatName(newCat.name);
  };

  const saveCat = (id: string) => {
    const updated = cats.map((c) => (c.id === id ? { ...c, name: catName.trim() || "Sem nome" } : c));
    setCats(updated);
    setCategories(updated);
    setEditingCat(null);
    toast.success("Categoria salva!");
  };

  const deleteCat = (id: string) => {
    const updatedCats = cats.filter((c) => c.id !== id);
    setCats(updatedCats);
    setCategories(updatedCats);

    // Remove products in this category
    const updatedProds = prods.filter((p) => p.categoryId !== id);
    setProds(updatedProds);
    setProducts(updatedProds);

    toast.success("Categoria removida!");
  };

  // ====== Products ======
  const addProduct = () => {
    if (prods.length >= MAX_PRODUCTS) {
      toast.error(`Plano básico permite até ${MAX_PRODUCTS} produtos.`);
      return;
    }

    const defaultCatId = cats[0]?.id || "";

    // ✅ Coloca o produto novo no final da categoria
    const nextOrder = prods.filter((p) => p.categoryId === defaultCatId).length;

    const newProd: Product = {
      id: generateId(),
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: defaultCatId,
      active: true,
      order: nextOrder, // ✅ novo
    };

    setEditingProd(newProd);
  };


  const saveProd = () => {
    if (!editingProd) return;

    if (!editingProd.name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }

    if (!editingProd.price || editingProd.price <= 0) {
      toast.error("Informe um preço válido");
      return;
    }

    // Garante que categoria exista
    if (!editingProd.categoryId && cats[0]?.id) {
      editingProd.categoryId = cats[0].id;
    }

    // ✅ Define ordem automaticamente (se for produto novo)
    if (editingProd.order === undefined || editingProd.order === null) {
      const nextOrder = prods.filter(
        (p) => p.categoryId === editingProd.categoryId
      ).length;

      editingProd.order = nextOrder;
    }
  }


  const deleteProd = (id: string) => {
    const updated = prods.filter((p) => p.id !== id);
    setProds(updated);
    setProducts(updated);
    toast.success("Produto removido!");
  };

  const toggleProdActive = (id: string) => {
    const updated = prods.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setProds(updated);
    setProducts(updated);
  };

  // ====== QR / Link ======
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const downloadQr = () => {
    const canvas = document.getElementById("menu-qr-canvas") as HTMLCanvasElement | null;
    if (!canvas) {
      toast.error("QR Code não encontrado.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-cardapio-${estab.slug || "menu"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  // -----------------------

  // ====== Logout ======
  const handleLogout = () => {
    setAdminAuth(false);
    onLogout();
  };

  // ====== Uploads ======
  const validateAndReadImage = (
    file: File,
    maxBytes: number,
    maxDim: number,
    onOk: (base64: string) => void,
    onFinally?: () => void
  ) => {
    const allowedTypes = ["image/webp", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido. Use WebP, JPG ou PNG.");
      onFinally?.();
      return;
    }

    if (file.size > maxBytes) {
      toast.error(`Imagem muito pesada. Use no máximo ${Math.floor(maxBytes / 1024)}KB.`);
      onFinally?.();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);

      if (width > maxDim || height > maxDim) {
        toast.error(`A imagem deve ter no máximo ${maxDim}x${maxDim}px.`);
        onFinally?.();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => onOk(reader.result as string);
      reader.onerror = () => toast.error("Falha ao ler a imagem.");
      reader.onloadend = () => onFinally?.();
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Arquivo de imagem inválido.");
      onFinally?.();
    };

    img.src = objectUrl;
  };

  const handleProductImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingProd) {
      toast.error("Abra o editor de produto antes de enviar uma imagem.");
      e.target.value = "";
      return;
    }

    validateAndReadImage(
      file,
      MAX_IMAGE_BYTES,
      MAX_DIMENSION,
      (base64) => {
        setEditingProd((prev) => (prev ? { ...prev, image: base64 } : prev));
        toast.success("Imagem carregada!");
      },
      () => {
        e.target.value = "";
      }
    );
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndReadImage(
      file,
      MAX_LOGO_BYTES,
      MAX_LOGO_DIMENSION,
      (base64) => {
        setEstab((prev) => ({ ...prev, logo: base64 }));
        toast.success("Logo carregado!");
      },
      () => {
        e.target.value = "";
      }
    );
  };

  // ====== Support ======
  const sendSupport = () => {
    if (!supportSubject.trim()) {
      toast.error("Informe o assunto");
      return;
    }
    if (!supportMessage.trim()) {
      toast.error("Descreva o problema");
      return;
    }
    if (supportMessage.trim().length > SUPPORT_MAX) {
      toast.error(`Máximo de ${SUPPORT_MAX} caracteres`);
      return;
    }

    const message =
      `*SUPORTE - Painel Admin*\n\n` +
      `*Estabelecimento:* ${estab.name}\n` +
      `*Slug:* ${estab.slug}\n\n` +
      `*Assunto:* ${supportSubject.trim()}\n\n` +
      `*Mensagem:*\n${supportMessage.trim()}`;

    const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setShowSupport(false);
    setSupportSubject("");
    setSupportMessage("");
    toast.success("Abrindo WhatsApp...");
  };

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
            <button
              onClick={() => setShowSupport(true)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Suporte"
              title="Suporte"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowQr((v) => !v)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label="QR Code"
              title="QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>

            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Support Modal */}
        {showSupport && (
          <div className="mb-4 rounded-2xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Falar com o suporte</h3>
              <button
                onClick={() => setShowSupport(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Fechar suporte"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Envia uma mensagem pronta para o WhatsApp do suporte.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Assunto *</label>
                <input
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Ex: Não consigo cadastrar produto"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Descrição *</label>
                  <span className="text-[11px] text-muted-foreground">
                    {supportMessage.length}/{SUPPORT_MAX}
                  </span>
                </div>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value.slice(0, SUPPORT_MAX))}
                  placeholder="Explique o que aconteceu, se possível diga o que você clicou e o que esperava..."
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <button
                onClick={sendSupport}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Enviar no WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* QR Code Card */}
        {showQr && (
          <div className="mb-4 rounded-2xl bg-card p-6 shadow-card text-center">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">QR Code do Cardápio</h3>
              <button
                onClick={() => setShowQr(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Fechar QR"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 inline-block rounded-xl bg-card p-4 border border-border">
              <QRCodeCanvas id="menu-qr-canvas" value={publicUrl} size={200} includeMargin />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs text-muted-foreground truncate max-w-[260px]">{publicUrl}</span>

              <button
                onClick={copyLink}
                className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                <Copy className="h-3 w-3" /> Copiar
              </button>

              <button
                onClick={downloadQr}
                className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80"
              >
                Baixar
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
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {tab === "profile" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="w-full rounded-xl border border-border bg-card py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              {showAdvanced ? "Ocultar ajustes avançados" : "Mostrar ajustes avançados"}
            </button>

            <div className="rounded-2xl bg-card p-5 shadow-card space-y-4">
              {showAdvanced && (
                <>
                  {/* Logo upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Logo (WebP/JPG/PNG • até 1080x1080 • máx 200KB)
                    </label>

                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      onChange={handleLogoUpload}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground
                      file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80"
                    />

                    {estab.logo ? (
                      <div className="overflow-hidden rounded-xl border border-border bg-secondary">
                        <img src={estab.logo} alt="Logo do estabelecimento" className="h-28 w-full object-contain p-3" />
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">Dica: logo quadrado 512x512 em WebP fica leve e bonito.</p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                    <textarea
                      value={estab.description}
                      onChange={(e) => setEstab({ ...estab, description: e.target.value })}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
                    <input
                      value={estab.slug}
                      onChange={(e) =>
                        setEstab({
                          ...estab,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Ex: <span className="font-medium">{typeof window !== "undefined" ? window.location.origin : ""}/burger-house</span>
                    </p>
                  </div>
                </>
              )}

              {/* Nome */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome do estabelecimento</label>
                <input
                  value={estab.name}
                  onChange={(e) => setEstab({ ...estab, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">WhatsApp (com DDD e código do país)</label>
                <input
                  value={estab.whatsapp}
                  onChange={(e) => setEstab({ ...estab, whatsapp: e.target.value })}
                  placeholder="5592999999999"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Dica: sem espaços e sem símbolos. Ex: 5592999999999</p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Status</span>
                <button
                  onClick={() => setEstab({ ...estab, isOpen: !estab.isOpen })}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${estab.isOpen ? "bg-primary text-primary-foreground" : "bg-destructive/10 text-destructive"
                    }`}
                >
                  {estab.isOpen ? "Aberto" : "Fechado"}
                </button>
              </div>

              {/* Tema */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tema do cardápio</label>

                <div className="mt-2 grid grid-cols-5 gap-2">
                  {themeOptions.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTheme(t.key)}
                      className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${(estab as any).theme === t.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      title={t.label}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  Isso muda apenas a cor principal (botões e destaques).
                </p>
              </div>

              <button
                onClick={saveEstab}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <Save className="inline h-4 w-4 mr-1" /> Salvar Perfil
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        {tab === "categories" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Categorias</p>
                  <p className="text-[12px] text-muted-foreground">
                    Arraste pelo ícone à esquerda para reordenar.
                  </p>
                </div>

                <button
                  onClick={addCategory}
                  className="shrink-0 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  <Plus className="h-4 w-4" /> Nova
                </button>
              </div>

              <div className="space-y-2">
                {cats
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((cat) => {
                    const isDragging = draggingCatId === cat.id;
                    const isOver = dragOverCatId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onDragOver={onCatDragOverCategory(cat.id)}
                        onDrop={onCatDropCategory(cat.id)}
                        onDragEnd={onCatDragEndCategory}
                        className={[
                          "group flex items-center gap-2 rounded-xl border bg-background px-3 py-3 transition",
                          "border-border hover:bg-secondary/40",
                          isDragging ? "opacity-60 scale-[0.99]" : "",
                          isOver ? "ring-2 ring-primary/40" : "",
                        ].join(" ")}
                        aria-label="Arrastar para reordenar categoria"
                        title="Arraste pela alça para mudar a ordem"
                      >
                        {/* Drag Handle */}
                        <div
                          draggable
                          onDragStart={onCatDragStartCategory(cat.id)}
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-lg border",
                            "border-border bg-card text-muted-foreground",
                            "cursor-grab active:cursor-grabbing",
                            "group-hover:bg-secondary",
                            "select-none",
                          ].join(" ")}
                          aria-label="Arrastar categoria"
                          title="Arraste para reordenar"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {editingCat === cat.id ? (
                            <input
                              value={catName}
                              onChange={(e) => setCatName(e.target.value)}
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveCat(cat.id);
                                if (e.key === "Escape") setEditingCat(null);
                              }}
                            />
                          ) : (
                            <p className="truncate text-sm font-medium text-foreground">{cat.name}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div
                          className="flex items-center gap-1"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {editingCat === cat.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveCat(cat.id)}
                                className="rounded-full p-2 text-primary hover:bg-secondary"
                                aria-label="Salvar categoria"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCat(null)}
                                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                                aria-label="Cancelar edição"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCat(cat.id);
                                  setCatName(cat.name);
                                }}
                                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                                aria-label="Editar categoria"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCat(cat.id)}
                                className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                                aria-label="Excluir categoria"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}


              </div>
            </div>
          </div>
        )}


        {/* Products */}
        {tab === "products" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {prods.length}/{MAX_PRODUCTS} produtos
              </p>
              <button
                onClick={addProduct}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Novo
              </button>
            </div>

            {/* Modal Produto */}
            {editingProd && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
                <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">
                      {prods.find((p) => p.id === editingProd.id) ? "Editar" : "Novo"} Produto
                    </h3>
                    <button
                      onClick={() => setEditingProd(null)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                      aria-label="Fechar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nome do produto *</label>
                    <input
                      value={editingProd.name}
                      onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                      placeholder="Ex: Smash Burger"
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                    <input
                      value={editingProd.description}
                      onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                      placeholder="Descrição curta"
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Preço */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProd.price || ""}
                      onChange={(e) =>
                        setEditingProd({
                          ...editingProd,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Ex: 32.90"
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Imagem */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Imagem (WebP/JPG/PNG • até 1080x1080 • máx 200KB)
                    </label>

                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      onChange={handleProductImageUpload}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground
                      file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80"
                    />

                    {editingProd.image ? (
                      <div className="overflow-hidden rounded-xl border border-border bg-secondary">
                        <img src={editingProd.image} alt="Prévia" className="h-40 w-full object-cover" />
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Dica: 800x800 em WebP é o melhor custo-benefício (qualidade + velocidade).
                      </p>
                    )}
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                    <select
                      value={editingProd.categoryId}
                      onChange={(e) => setEditingProd({ ...editingProd, categoryId: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={saveProd}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Salvar Produto
                  </button>
                </div>
              </div>
            )}

            {/* Lista */}
            {prods.length === 0 ? (
              <div className="rounded-2xl bg-card p-6 shadow-card text-center">
                <p className="text-sm font-medium text-foreground">Nenhum produto cadastrado</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clique em <span className="font-medium">Novo</span> para cadastrar o primeiro.
                </p>
              </div>
            ) : (
              prods.map((prod) => (
                <div key={prod.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card">
                  <div className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary ${!prod.active ? "opacity-40" : ""}`}>
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 text-xs">IMG</div>
                    )}
                  </div>

                  <div className={`flex-1 min-w-0 ${!prod.active ? "opacity-40" : ""}`}>
                    <p className="text-sm font-medium text-foreground truncate">{prod.name || "Sem nome"}</p>
                    <p className="text-xs text-primary font-semibold">R$ {prod.price.toFixed(2).replace(".", ",")}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleProdActive(prod.id)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                      aria-label={prod.active ? "Desativar" : "Ativar"}
                    >
                      {prod.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingProd({ ...prod })}
                      className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                      aria-label="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProd(prod.id)}
                      className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Botão extra no fim (mobile) */}
            <button
              onClick={addProduct}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" /> Novo Produto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
