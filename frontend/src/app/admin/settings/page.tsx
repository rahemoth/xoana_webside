'use client';

import { useState, useEffect } from 'react';
import { uploadApi, settingsApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Image as ImageIcon, Upload, Download, Upload as UploadIcon } from 'lucide-react';

interface SiteSettings {
  // 基本信息 - Basic Info
  siteName: string;
  siteNameEn: string;
  siteDescription: string;
  siteDescriptionEn: string;

  // Hero 区域
  heroTitle: string;
  heroTitleEn: string;
  heroSubtitle: string;
  heroSubtitleEn: string;
  heroDescription: string;
  heroDescriptionEn: string;

  // 品牌介绍
  brandDescription: string;
  brandDescriptionEn: string;
  brandImage: string;

  // Gallery
  galleryImage1: string;
  galleryImage2: string;
  galleryImage3: string;
  galleryImage4: string;
  galleryImage5: string;

  // 联系信息
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressEn: string;
  wechatQR: string;
}

const defaultSettings: SiteSettings = {
  // 基本信息
  siteName: 'XOANA',
  siteNameEn: 'XOANA',
  siteDescription: '独立手指滑板品牌',
  siteDescriptionEn: 'Independent Fingerboard Brand',

  // Hero 区域
  heroTitle: 'XOANA 指板',
  heroTitleEn: 'Fingerboard',
  heroSubtitle: '极致工艺，专注品质',
  heroSubtitleEn: 'Craftsmanship & Quality',
  heroDescription: '每一块指板都是独立手工打造，融合传统技艺与现代设计',
  heroDescriptionEn: 'Each fingerboard is handcrafted independently, blending traditional craftsmanship with modern design.',

  // 品牌介绍
  brandDescription: 'XOANA 是一个专注于独立手指滑板的品牌，我们致力于为每一位玩家带来最高品质的产品体验。',
  brandDescriptionEn: 'XOANA is an independent fingerboard brand dedicated to providing the highest quality products for every player.',
  brandImage: '',

  // Gallery
  galleryImage1: '',
  galleryImage2: '',
  galleryImage3: '',
  galleryImage4: '',
  galleryImage5: '',

  // 联系信息
  contactEmail: 'contact@xoana.com',
  contactPhone: '+86 138 0000 0000',
  contactAddress: '上海市浦东新区 · 中国',
  contactAddressEn: 'Pudong New Area, Shanghai · China',
  wechatQR: '',
};

type FieldDef = {
  key: keyof SiteSettings;
  label: string;
  textarea?: boolean;
  image?: boolean;
};

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  { title: '基本信息 (Basic Info)', fields: [
      { key: 'siteName', label: '网站名称（中文）' },
      { key: 'siteNameEn', label: 'Website Name (English)' },
      { key: 'siteDescription', label: '网站描述（中文）', textarea: true },
      { key: 'siteDescriptionEn', label: 'Website Description (English)', textarea: true },
    ]},
  { title: '首页 Hero 区域', fields: [
      { key: 'heroTitle', label: 'Hero 标题（中文）' },
      { key: 'heroTitleEn', label: 'Hero Title (English)' },
      { key: 'heroSubtitle', label: 'Hero 副标题（中文）' },
      { key: 'heroSubtitleEn', label: 'Hero Subtitle (English)' },
      { key: 'heroDescription', label: 'Hero 描述（中文）', textarea: true },
      { key: 'heroDescriptionEn', label: 'Hero Description (English)', textarea: true },
    ]},
  { title: '品牌介绍 (About XOANA)', fields: [
      { key: 'brandDescription', label: '品牌描述（中文）', textarea: true },
      { key: 'brandDescriptionEn', label: 'Brand Description (English)', textarea: true },
      { key: 'brandImage', label: '品牌图片 URL', image: true },
    ]},
  { title: '产品展示 (Gallery)', fields: [
      { key: 'galleryImage1', label: 'Gallery 图片 1 URL（大图，左上）', image: true },
      { key: 'galleryImage2', label: 'Gallery 图片 2 URL（右上）', image: true },
      { key: 'galleryImage3', label: 'Gallery 图片 3 URL（右中）', image: true },
      { key: 'galleryImage4', label: 'Gallery 图片 4 URL（右下）', image: true },
      { key: 'galleryImage5', label: 'Gallery 图片 5 URL（底部宽图）', image: true },
    ]},
  { title: '联系信息 (Contact)', fields: [
      { key: 'contactEmail', label: '联系邮箱' },
      { key: 'contactPhone', label: '联系电话' },
      { key: 'contactAddress', label: '地址（中文）' },
      { key: 'contactAddressEn', label: 'Address (English)' },
      { key: 'wechatQR', label: '微信二维码 URL', image: true },
    ]},
];


export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Load settings from API
  const { data: apiSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.get(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: SiteSettings) => settingsApi.update(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Only run on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply API settings when loaded
  useEffect(() => {
    if (apiSettings?.data?.data) {
      const remote = apiSettings.data.data;
      setSettings({ ...defaultSettings, ...remote });
      // Also update localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('xoana_site_settings', JSON.stringify({ ...defaultSettings, ...remote }));
      }
    }
  }, [apiSettings]);

  const handleImageUpload = async (key: keyof SiteSettings, file: File) => {
    setUploading(key);
    try {
      const res = await uploadApi.uploadImage(file);
      let url = res.data?.data;

      // 如果是相对路径，拼接后端 API 地址
      if (url && url.startsWith('/uploads/')) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        url = API_BASE_URL + url;
      }

      if (url) setSettings(s => ({ ...s, [key]: url }));
    } catch { alert('上传失败'); }
    setUploading(null);
  };

  const handleSave = () => {
    // Save to database via API
    saveMutation.mutate(settings);
    // Also update localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.setItem('xoana_site_settings', JSON.stringify(settings));
    }
  };

  // 导出设置为 JSON 文件
  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xoana-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入设置从 JSON 文件
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

        if (confirm('导入设置将覆盖当前所有配置，确定要继续吗？')) {
          setSettings({ ...defaultSettings, ...imported });
          // 自动保存到 localStorage
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('xoana_site_settings', JSON.stringify({ ...defaultSettings, ...imported }));
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }, 100);
          alert('设置导入成功！');
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">内容设置</h1>
          <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Download className="h-4 w-4" />
              导出设置
            </button>
            <button
                onClick={handleImport}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <UploadIcon className="h-4 w-4" />
              导入设置
            </button>
            <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
            >
              <Save className="h-4 w-4" />
              {saved ? '已保存！' : '保存设置'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {SECTIONS.map(section => (
              <div key={section.title} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">{section.title}</h2>
                <div className="space-y-4">
                  {section.fields.map(field => (
                      <div key={field.key}>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {field.image && <ImageIcon className="h-4 w-4 text-zinc-400" />}
                          {field.label}
                        </label>
                        {field.textarea ? (
                            <textarea
                                value={mounted ? settings[field.key] : ''}
                                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                                rows={3}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        ) : field.image ? (
                            <div className="flex gap-2">
                              <input
                                  type="text"
                                  value={mounted ? settings[field.key] : ''}
                                  onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                                  placeholder="https://... 或点击上传"
                                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                              />
                              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                <Upload className="h-4 w-4" />
                                {uploading === field.key ? '上传中...' : '上传图片'}
                                <input type="file" accept="image/*" className="hidden"
                                       onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(field.key, f); }} />
                              </label>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={mounted ? settings[field.key] : ''}
                                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        )}
                        {/* Image preview - only render on client */}
                        {mounted && field.image && settings[field.key] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={settings[field.key]}
                                alt="preview"
                                className="mt-2 h-24 w-auto rounded-lg object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        )}
                      </div>
                  ))}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}