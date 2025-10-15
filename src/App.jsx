import React, { useState, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Info,
  History,
  List,
  Download,
  Trash2,
  ShoppingBag,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [productName, setProductName] = useState("");
  const [cost, setCost] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [plan, setPlan] = useState("entrega");
  const [paymentMethod, setPaymentMethod] = useState("app");
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedProducts = localStorage.getItem("ifood-products");
    const savedHistory = localStorage.getItem("ifood-history");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Salvar produtos no localStorage
  useEffect(() => {
    localStorage.setItem("ifood-products", JSON.stringify(products));
  }, [products]);

  // Salvar histórico no localStorage
  useEffect(() => {
    localStorage.setItem("ifood-history", JSON.stringify(history));
  }, [history]);

  const calculatePrices = (costValue) => {
    const commission = plan === "entrega" ? 0.23 : 0.12;
    const cardFee = paymentMethod === "app" ? 0.032 : 0;
    const totalFee = commission + cardFee;

    const sellingPrice = costValue / (1 - totalFee);
    const commissionValue = sellingPrice * commission;
    const cardFeeValue = sellingPrice * cardFee;
    const totalDiscount = commissionValue + cardFeeValue;
    const youReceive = sellingPrice - totalDiscount;

    return {
      sellingPrice: sellingPrice.toFixed(2),
      commissionValue: commissionValue.toFixed(2),
      cardFeeValue: cardFeeValue.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      youReceive: youReceive.toFixed(2),
      commission: (commission * 100).toFixed(1),
      cardFee: (cardFee * 100).toFixed(1),
      totalFeePercent: (totalFee * 100).toFixed(1),
    };
  };

  const result = cost ? calculatePrices(parseFloat(cost)) : null;

  const saveProduct = () => {
    if (!productName || !cost) {
      alert("Preencha o nome do produto e o valor!");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: productName,
      desiredValue: parseFloat(cost),
      minOrder: minOrder ? parseFloat(minOrder) : null,
      plan,
      paymentMethod,
      result: calculatePrices(parseFloat(cost)),
      date: new Date().toISOString(),
    };

    setProducts([...products, newProduct]);

    // Adicionar ao histórico
    const historyEntry = {
      id: Date.now(),
      action: "Produto adicionado",
      product: newProduct,
      date: new Date().toISOString(),
    };
    setHistory([historyEntry, ...history]);

    // Limpar formulário
    setProductName("");
    setCost("");
    setMinOrder("");

    alert("Produto salvo com sucesso!");
  };

  const deleteProduct = (id) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      const product = products.find((p) => p.id === id);
      setProducts(products.filter((p) => p.id !== id));

      const historyEntry = {
        id: Date.now(),
        action: "Produto excluído",
        product,
        date: new Date().toISOString(),
      };
      setHistory([historyEntry, ...history]);
    }
  };

  const exportData = () => {
    const data = {
      products,
      history,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ifood-calculadora-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (
      confirm(
        "Deseja realmente limpar TODOS os dados? Esta ação não pode ser desfeita!"
      )
    ) {
      setProducts([]);
      setHistory([]);
      localStorage.removeItem("ifood-products");
      localStorage.removeItem("ifood-history");
      alert("Todos os dados foram limpos!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="w-7 h-7 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Calculadora iFood
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === "calculator"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calcular
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === "products"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4" />
              Produtos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === "history"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <History className="w-4 h-4" />
              Histórico
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Tab: Calculadora */}
        {activeTab === "calculator" && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-4">
              <div className="space-y-4">
                {/* Nome do Produto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: X-Burger Completo"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition"
                  />
                </div>

                {/* Valor que quer receber */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quanto você QUER RECEBER? *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-400 font-semibold">
                      R$
                    </span>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0,00"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition text-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Pedido Mínimo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ShoppingBag className="w-4 h-4 inline mr-1" />
                    Pedido Mínimo (opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-400 font-semibold">
                      R$
                    </span>
                    <input
                      type="number"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      placeholder="20,00"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor mínimo que os clientes precisam gastar
                  </p>
                </div>

                {/* Plano */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qual seu plano? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPlan("entrega")}
                      className={`p-3 rounded-lg border-2 transition ${
                        plan === "entrega"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">Plano Entrega</div>
                      <div className="text-xs text-gray-600">Comissão 23%</div>
                    </button>
                    <button
                      onClick={() => setPlan("basico")}
                      className={`p-3 rounded-lg border-2 transition ${
                        plan === "basico"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">Plano Básico</div>
                      <div className="text-xs text-gray-600">Comissão 12%</div>
                    </button>
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Como o cliente vai pagar? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("app")}
                      className={`p-3 rounded-lg border-2 transition ${
                        paymentMethod === "app"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">Pelo App</div>
                      <div className="text-xs text-gray-600">+3,2% taxa</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-3 rounded-lg border-2 transition ${
                        paymentMethod === "cash"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">Dinheiro</div>
                      <div className="text-xs text-gray-600">
                        Sem taxa extra
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado */}
            {result && (
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-4">
                {productName && (
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    {productName}
                  </h2>
                )}

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-4 text-white">
                  <div className="text-xs font-semibold mb-1 opacity-90">
                    PREÇO NO CARDÁPIO:
                  </div>
                  <div className="text-4xl md:text-5xl font-bold">
                    R$ {result.sellingPrice}
                  </div>
                  {minOrder && (
                    <div className="text-xs mt-2 opacity-90 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      Pedido mínimo: R$ {parseFloat(minOrder).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Info className="w-4 h-4" />
                    <span className="font-semibold">Detalhamento:</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Preço no cardápio</span>
                      <span className="font-semibold">
                        R$ {result.sellingPrice}
                      </span>
                    </div>
                    <hr className="my-2 border-gray-300" />

                    <div className="flex justify-between items-center text-red-600 mb-1">
                      <span>− Comissão ({result.commission}%)</span>
                      <span className="font-semibold">
                        R$ {result.commissionValue}
                      </span>
                    </div>

                    {paymentMethod === "app" && (
                      <div className="flex justify-between items-center text-red-600 mb-2">
                        <span>− Taxa cartão ({result.cardFee}%)</span>
                        <span className="font-semibold">
                          R$ {result.cardFeeValue}
                        </span>
                      </div>
                    )}

                    <hr className="my-2 border-gray-300" />

                    <div className="flex justify-between items-center text-green-700 font-bold">
                      <span>💰 Você recebe:</span>
                      <span>R$ {result.youReceive}</span>
                    </div>
                  </div>

                  <button
                    onClick={saveProduct}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Salvar Produto
                  </button>
                </div>
              </div>
            )}

            {!result && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm">
                  💡 <strong>Dica:</strong> Preencha os campos e veja o cálculo!
                </p>
              </div>
            )}
          </>
        )}

        {/* Tab: Produtos */}
        {activeTab === "products" && (
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum produto salvo ainda</p>
                <button
                  onClick={() => setActiveTab("calculator")}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Adicionar Produto
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    Meus Produtos
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                    <button
                      onClick={clearAllData}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar
                    </button>
                  </div>
                </div>

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(product.date).toLocaleDateString("pt-BR")}{" "}
                          às{" "}
                          {new Date(product.date).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-3">
                      <div className="text-xs text-green-700 font-semibold mb-1">
                        PREÇO NO CARDÁPIO
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        R$ {product.result.sellingPrice}
                      </div>
                      {product.minOrder && (
                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Pedido mínimo: R$ {product.minOrder.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-600">Você recebe</div>
                        <div className="font-bold text-green-700">
                          R$ {product.result.youReceive}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-600">Total taxas</div>
                        <div className="font-bold text-red-600">
                          R$ {product.result.totalDiscount}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-600">Plano</div>
                        <div className="font-semibold">
                          {product.plan === "entrega" ? "Entrega" : "Básico"}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-600">Pagamento</div>
                        <div className="font-semibold">
                          {product.paymentMethod === "app"
                            ? "Pelo App"
                            : "Dinheiro"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Tab: Histórico */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade registrada</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    Histórico de Atividades
                  </h2>
                </div>

                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-xl shadow-md p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          entry.action.includes("excluído")
                            ? "bg-red-100"
                            : "bg-green-100"
                        }`}
                      >
                        {entry.action.includes("excluído") ? (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {entry.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry.product.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.date).toLocaleDateString("pt-BR")} às{" "}
                          {new Date(entry.date).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
