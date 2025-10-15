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
  Package,
  ChevronDown,
  ChevronUp,
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
  const [quantities, setQuantities] = useState({});
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const savedProducts = window.localStorage.getItem("ifood-products");
    const savedHistory = window.localStorage.getItem("ifood-history");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ifood-products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem("ifood-history", JSON.stringify(history));
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

  const calculateSaleSimulation = (product, qty) => {
    const totalSale = parseFloat(product.result.sellingPrice) * qty;
    const totalReceive = parseFloat(product.result.youReceive) * qty;
    const totalFees = parseFloat(product.result.totalDiscount) * qty;

    return {
      totalSale: totalSale.toFixed(2),
      totalReceive: totalReceive.toFixed(2),
      totalFees: totalFees.toFixed(2),
      meetsMinimum: product.minOrder ? totalSale >= product.minOrder : true,
    };
  };

  const result = cost ? calculatePrices(parseFloat(cost)) : null;

  const saveProduct = () => {
    if (!productName || !cost) {
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
    const historyEntry = {
      id: Date.now(),
      action: "Produto adicionado",
      product: newProduct,
      date: new Date().toISOString(),
    };
    setHistory([historyEntry, ...history]);
    setProductName("");
    setCost("");
    setMinOrder("");

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const deleteProduct = (id) => {
    const product = products.find((p) => p.id === id);
    setProducts(products.filter((p) => p.id !== id));
    const historyEntry = {
      id: Date.now(),
      action: "Produto excluído",
      product,
      date: new Date().toISOString(),
    };
    setHistory([historyEntry, ...history]);
    setShowDeleteConfirm(null);
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
    setProducts([]);
    setHistory([]);
    window.localStorage.removeItem("ifood-products");
    window.localStorage.removeItem("ifood-history");
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-20">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✓ Produto salvo com sucesso!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-4">
              Deseja realmente excluir este produto?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteProduct(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Excluir
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Limpar todos os dados
            </h3>
            <p className="text-gray-600 mb-4">
              Esta ação não pode ser desfeita! Deseja continuar?
            </p>
            <div className="flex gap-2">
              <button
                onClick={clearAllData}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Limpar Tudo
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="w-7 h-7 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Calculadora iFood
            </h1>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === "calculator"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calcular</span>
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === "products"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Produtos</span>
              <span className="bg-white text-gray-800 px-2 py-0.5 rounded-full text-xs font-bold">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === "history"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {activeTab === "calculator" && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-4">
              <div className="space-y-4">
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
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Limpar</span>
                    </button>
                  </div>
                </div>

                {products.map((product) => {
                  const isExpanded = expandedProduct === product.id;
                  const qty = quantities[product.id] || "";
                  const simulation = qty
                    ? calculateSaleSimulation(product, parseInt(qty))
                    : null;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <div
                        onClick={() =>
                          setExpandedProduct(isExpanded ? null : product.id)
                        }
                        className="p-4 cursor-pointer hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg mb-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Preço: </span>
                                <span className="font-bold text-green-600">
                                  R$ {product.result.sellingPrice}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Recebe: </span>
                                <span className="font-bold text-blue-600">
                                  R$ {product.result.youReceive}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(product.id);
                              }}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100">
                          <div className="pt-4 space-y-3">
                            {product.minOrder && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs">
                                <ShoppingBag className="w-3 h-3 inline mr-1" />
                                Pedido mínimo: R$ {product.minOrder.toFixed(2)}
                              </div>
                            )}

                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-900">
                                  Simular Venda
                                </span>
                              </div>
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="number"
                                  placeholder="Quantidade"
                                  value={qty}
                                  onChange={(e) =>
                                    setQuantities({
                                      ...quantities,
                                      [product.id]: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                  min="1"
                                />
                                <div className="flex items-center px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-sm font-semibold text-gray-700">
                                  × R$ {product.result.sellingPrice}
                                </div>
                              </div>

                              {simulation && (
                                <div className="space-y-2">
                                  {product.minOrder &&
                                    !simulation.meetsMinimum && (
                                      <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-red-700">
                                        ⚠️ Não atinge o pedido mínimo de R${" "}
                                        {product.minOrder.toFixed(2)}
                                      </div>
                                    )}
                                  <div className="bg-white rounded p-2 text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Total da venda:
                                      </span>
                                      <span className="font-bold">
                                        R$ {simulation.totalSale}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>− Total em taxas:</span>
                                      <span className="font-semibold">
                                        R$ {simulation.totalFees}
                                      </span>
                                    </div>
                                    <hr className="my-1" />
                                    <div className="flex justify-between text-green-700 font-bold">
                                      <span>💰 Você recebe:</span>
                                      <span>R$ {simulation.totalReceive}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-gray-600">Plano</div>
                                <div className="font-semibold">
                                  {product.plan === "entrega"
                                    ? "Entrega (23%)"
                                    : "Básico (12%)"}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-gray-600">Pagamento</div>
                                <div className="font-semibold">
                                  {product.paymentMethod === "app"
                                    ? "Pelo App"
                                    : "Dinheiro"}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-gray-400">
                              Adicionado em{" "}
                              {new Date(product.date).toLocaleDateString(
                                "pt-BR"
                              )}{" "}
                              às{" "}
                              {new Date(product.date).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

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
                          {new Date(entry.date).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
