'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, uploadApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, X, Upload, Download, Upload as UploadIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductForm {
  name: string;
  nameEn: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  descriptionEn: string;
  material: string;
  dimensions: string;
  coverImage: string;
  featured: boolean;
  active: boolean;
}

const defaultForm: ProductForm = { name: '', nameEn: '', price: '', stock: '', category: '', description: '', descriptionEn: '', material: '', dimensions: '', coverImage: '', featured: false, active: true };

// 产品分类选项
const CATEGORIES = [
  { value: '', label: '请选择分类' },
  { value: 'deck', label: 'Deck' },
  { value: 'wheel', label: 'Wheel' },
  { value: 'truck', label: 'Truck' },
];

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productApi.getAll({ page: 0, size: 100 }),
  });

  const products = data?.data?.data?.content || [];

  const createMutation = useMutation({
    mutationFn: (data: unknown) => editId ? productApi.update(editId, data) : productApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); setForm(defaultForm); setEditId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setForm({ name: product.name, nameEn: product.nameEn || '', price: String(product.price), stock: String(product.stock), category: product.category || '', description: product.description || '', descriptionEn: product.descriptionEn || '', material: product.material || '', dimensions: product.dimensions || '', coverImage: product.coverImage || '', featured: product.featured, active: product.active });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      let imageUrl = res.data?.data || '';

      if (imageUrl.startsWith('/uploads/')) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        imageUrl = API_BASE_URL + imageUrl;
      }

      setForm(f => ({ ...f, coverImage: imageUrl }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || '上传失败';
      alert(message);

      if (err.response?.status === 403) {
        localStorage.removeItem('xoana-store');
        window.location.href = '/login';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    const exportData = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      nameEn: p.nameEn,
      price: p.price,
      stock: p.stock,
      category: p.category,
      description: p.description,
      descriptionEn: p.descriptionEn,
      material: p.material,
      dimensions: p.dimensions,
      coverImage: p.coverImage,
      featured: p.featured,
      active: p.active,
      createdAt: p.createdAt,
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xoana-products-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          alert('文件格式不正确：应为产品数组');
          return;
        }

        if (confirm(`确定要导入 ${imported.length} 个产品吗？这将批量创建新产品。`)) {
          let successCount = 0;
          let failCount = 0;

          for (const product of imported) {
            try {
              await productApi.create({
                name: product.name,
                nameEn: product.nameEn,
                price: product.price,
                stock: product.stock,
                category: product.category,
                description: product.description,
                descriptionEn: product.descriptionEn,
                material: product.material,
                dimensions: product.dimensions,
                coverImage: product.coverImage,
                featured: product.featured,
                active: product.active,
              });
              successCount++;
            } catch (err) {
              console.error('导入产品失败:', product.name, err);
              failCount++;
            }
          }

          alert(`导入完成！成功：${successCount}, 失败：${failCount}`);
          qc.invalidateQueries({ queryKey: ['admin-products'] });
        }
      } catch (err) {
        alert('导入失败：文件格式不正确');
        console.error('Import error:', err);
      }
    };
    input.click();
  };

  return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">产品管理</h1>
          <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Download className="h-4 w-4" />
              导出产品
            </button>
            <button
                onClick={handleImport}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <UploadIcon className="h-4 w-4" />
              导入产品
            </button>
            <button
                onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
            >
              <Plus className="h-4 w-4" /> 添加产品
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              {['产品名', '价格', '库存', '分类', '状态', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
            </thead>
            <tbody>
            {products.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-zinc-400">暂无产品，点击上方按钮添加</td></tr>
            ) : products.map((p: any) => (
                <tr key={p.id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3"><span className={p.stock > 0 ? 'text-green-600' : 'text-red-500'}>{p.stock}</span></td>
                  <td className="px-4 py-3 text-zinc-500">{p.category}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${p.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>{p.active ? '上架' : '下架'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm('确认删除？')) deleteMutation.mutate(p.id); }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {showForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-2xl overflow-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900" style={{ maxHeight: '90vh' }}>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editId ? '编辑产品' : '添加产品'}</h2>
                    <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-zinc-500" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'name', label: '产品名（中文）', required: true },
                      { key: 'nameEn', label: '产品名（英文）' },
                      { key: 'price', label: '价格（元）', type: 'number', required: true },
                      { key: 'stock', label: '库存', type: 'number', required: true },
                      { key: 'material', label: '材质' },
                      { key: 'dimensions', label: '尺寸' },
                    ].map(f => (
                        <div key={f.key} className={f.key === 'name' || f.key === 'nameEn' ? 'col-span-1' : 'col-span-1'}>
                          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{f.label}</label>
                          <input type={f.type || 'text'} required={f.required} value={form[f.key as keyof ProductForm] as string}
                                 onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                 className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                    ))}

                    {/* Category Dropdown */}
                    <div className="relative col-span-1">
                      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">分类</label>
                      <button
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      >
                        <span>
                          {CATEGORIES.find(c => c.value === form.category)?.label || '请选择分类'}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isCategoryDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                              {CATEGORIES.map((cat) => (
                                  <button
                                      key={cat.value}
                                      type="button"
                                      onClick={() => {
                                        setForm(prev => ({ ...prev, category: cat.value }));
                                        setIsCategoryDropdownOpen(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                                          form.category === cat.value
                                              ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                              : 'text-zinc-700 dark:text-zinc-300'
                                      }`}
                                  >
                                    {cat.label}
                                  </button>
                              ))}
                            </motion.div>
                        )}
                      </AnimatePresence>

                      {isCategoryDropdownOpen && (
                          <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsCategoryDropdownOpen(false)}
                          />
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">产品描述（中文）</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">产品描述（英文）</label>
                      <textarea value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))} rows={3}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">封面图</label>
                      <div className="flex gap-2">
                        <input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="图片 URL" className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                          <Upload className="h-4 w-4" /> {uploading ? '上传中...' : '上传'}
                          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        </label>
                      </div>
                      {form.coverImage && (
                          <img src={form.coverImage} alt="cover" className="mt-2 h-20 w-auto rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" />
                        <span className="text-zinc-700 dark:text-zinc-300">推荐产品</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
                        <span className="text-zinc-700 dark:text-zinc-300">上架</span>
                      </label>
                    </div>
                    <div className="col-span-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">取消</button>
                      <button type="submit" disabled={createMutation.isPending} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900">
                        {createMutation.isPending ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
