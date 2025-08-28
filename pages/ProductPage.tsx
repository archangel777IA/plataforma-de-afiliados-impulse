// pages/ProductPage.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import Card from '../components/Card';
import { Product } from '../types';
import { dataService } from '../services/dataService';

interface ProductPageProps {
    onGoBack: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ onGoBack }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [couponValidity, setCouponValidity] = useState<string>('30');
    const [generatedCouponLink, setGeneratedCouponLink] = useState('');
    const [couponLinkCopied, setCouponLinkCopied] = useState(false);

    const [openSections, setOpenSections] = useState({
        productList: true,
        addProductForm: false,
        couponLinkGenerator: false,
    });

    const loadProducts = () => {
        setProducts(dataService.getProducts());
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleToggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleAddProduct = (e: FormEvent) => {
        e.preventDefault();
        if (!newProductName || !newProductPrice) {
            alert('Por favor, preencha pelo menos o nome e o preço do produto.');
            return;
        }
        const newProduct: Product = {
            id: Date.now(),
            name: newProductName,
            price: parseFloat(newProductPrice),
            description: newProductDescription,
        };
        dataService.addProduct(newProduct);
        loadProducts();
        setNewProductName(''); setNewProductPrice(''); setNewProductDescription('');
        setOpenSections(prev => ({ ...prev, productList: true, addProductForm: false }));
    };

    const handleDeleteProduct = (productId: number) => {
        if (window.confirm("Você tem certeza que deseja excluir este produto?")) {
            dataService.deleteProduct(productId);
            loadProducts();
        }
    };

    const handleGenerateCouponLink = () => {
        if (!selectedProductId) {
            alert('Por favor, selecione um produto.');
            return;
        }
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const link = `${baseUrl}?product_id=${selectedProductId}&coupon_validity=${couponValidity}`;
        setGeneratedCouponLink(link);
        setCouponLinkCopied(false);
    };

    const handleCopyCouponLink = () => {
        if (!generatedCouponLink) return;
        navigator.clipboard.writeText(generatedCouponLink).then(() => {
            setCouponLinkCopied(true);
            setTimeout(() => setCouponLinkCopied(false), 2500);
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-4">
                <button 
                    onClick={onGoBack}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:underline transition-colors flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Voltar para o Dashboard
                </button>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Gerenciamento de Produtos</h2>

            <Card 
                title="Produtos Cadastrados" 
                isOpen={openSections.productList} 
                onToggle={() => handleToggleSection('productList')}
            >
                <div className="space-y-4">
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <div key={product.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-black dark:text-white">
                                            <span className="text-primary-500 mr-2">#{index + 1}</span>
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">R$ {product.price.toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition flex-shrink-0 ml-4"
                                    >
                                        Excluir
                                    </button>
                                </div>
                                {product.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum produto cadastrado.</p>
                    )}
                </div>
            </Card>

            <Card 
                title="Gerar Link de Cupom para Afiliados" 
                isOpen={openSections.couponLinkGenerator} 
                onToggle={() => handleToggleSection('couponLinkGenerator')}
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="productSelect" className="block text-sm font-medium text-black dark:text-gray-200">Selecione o Produto</label>
                        <select
                            id="productSelect"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                            <option value="" disabled>-- Escolha um produto --</option>
                            {products.map((product, index) => (
                                <option key={product.id} value={product.id}>
                                    #{index + 1} - {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="couponValidity" className="block text-sm font-medium text-black dark:text-gray-200">Validade do Cupom (em dias)</label>
                        <input
                            type="number"
                            id="couponValidity"
                            value={couponValidity}
                            onChange={(e) => setCouponValidity(e.target.value)}
                            min="1"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <button onClick={handleGenerateCouponLink} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            Gerar Link
                        </button>
                    </div>

                    {generatedCouponLink && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-medium text-black dark:text-gray-200">Link Gerado:</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input type="text" readOnly value={generatedCouponLink} className="flex-grow w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white focus:outline-none sm:text-sm"/>
                                <button onClick={handleCopyCouponLink} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">{couponLinkCopied ? 'Copiado!' : 'Copiar'}</button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Card 
                title="Adicionar Novo Produto" 
                isOpen={openSections.addProductForm} 
                onToggle={() => handleToggleSection('addProductForm')}
            >
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-black dark:text-gray-200">Nome do Produto</label>
                        <input type="text" id="productName" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="productPrice" className="block text-sm font-medium text-black dark:text-gray-200">Preço (R$)</label>
                        <input type="number" id="productPrice" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required step="0.01" min="0" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="productDescription" className="block text-sm font-medium text-black dark:text-gray-200">Descrição (Opcional)</label>
                        <textarea id="productDescription" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            Adicionar Produto
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProductPage;