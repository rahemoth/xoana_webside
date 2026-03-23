'use client';

import { useState } from 'react';
import { uploadApi } from '@/lib/api';
import { Save, Image as ImageIcon, Upload } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  brandDescription: string;
  brandImage: string;
  galleryImage1: string;
  galleryImage2: string;
  galleryImage3: string;
  galleryImage4: string;
  galleryImage5: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  wechatQR: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'XOANA',
  siteDescription: '独立手指滑板品牌',
  heroTitle: 'XOANA 指板',
  heroSubtitle: '极致工艺，专注品质',
  heroDescription: '每一块指板都是独立手工打造，融合传统技艺与现代设计',
  brandDescription: 'XOANA 是一个专注于独立手指滑板的品牌，我们致力于为每一位玩家带来最高品质的产品体验。',
  brandImage: '',
  galleryImage1: '',
  galleryImage2: '',
  galleryImage3: '',
  galleryImage4: '',
  galleryImage5: '',
  contactEmail: 'contact@xoana.com',
  contactPhone: '+86 138 0000 0000',
  contactAddress: '上海市浦东新区 · 中国',
  wechatQR: '',
};

type FieldDef = {
  key: keyof SiteSettings;
  label: string;
  textarea?: boolean;
  image?: boolean;
};

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  { title: '基本信息', fields: [
    { key: 'siteName', label: '网站名称' },
    { key: 'siteDescription', label: '网站描述' },
  ]},
  { title: '首页Hero区域', fields: [
    { key: 'heroTitle', label: 'Hero标题' },
    { key: 'heroSubtitle', label: 'Hero副标题' },
    { key: 'heroDescription', label: 'Hero描述', textarea: true },
  ]},
  { title: '品牌介绍 (About XOANA)', fields: [
    { key: 'brandDescription', label: '品牌描述', textarea: true },
    { key: 'brandImage', label: '品牌图片URL', image: true },
  ]},
  { title: '产品展示 (Gallery)', fields: [
    { key: 'galleryImage1', label: 'Gallery图片1 URL（大图，左上）', image: true },
    { key: 'galleryImage2', label: 'Gallery图片2 URL（右上）', image: true },
    { key: 'galleryImage3', label: 'Gallery图片3 URL（右中）', image: true },
    { key: 'galleryImage4', label: 'Gallery图片4 URL（右下）', image: true },
    { key: 'galleryImage5', label: 'Gallery图片5 URL（底部宽图）', image: true },
  ]},
  { title: '联系信息', fields: [
    { key: 'contactEmail', label: '联系邮箱' },
    { key: 'contactPhone', label: '联系电话' },
    { key: 'contactAddress', label: '地址' },
    { key: 'wechatQR', label: '微信二维码URL', image: true },
  ]},
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xoana_site_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    return defaultSettings;
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImageUpload = async (key: keyof SiteSettings, file: File) => {
    setUploading(key);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.data?.data;
      if (url) setSettings(s => ({ ...s, [key]: url }));
    } catch { alert('上传失败'); }
    setUploading(null);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xoana_site_settings', JSON.stringify(settings));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">内容设置</h1>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900">
          <Save className="h-4 w-4" />
          {saved ? '已保存！' : '保存设置'}
        </button>
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
                      value={settings[field.key]}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  ) : field.image ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings[field.key]}
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
                      value={settings[field.key]}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  )}
                  {/* Image preview */}
                  {field.image && settings[field.key] && (
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
