'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { generateSlug, calculateReadingTime } from '@/lib/blog/utils';
import { TipTapEditor } from '@/components/blog/tiptap-editor';
import type { BlogCategory, BlogAuthor } from '@/types/blog';

function ContentPreview({ content }: { content: string }) {
  return <div className="prose prose-slate max-w-none p-6 bg-white rounded-lg border min-h-[500px]" dangerouslySetInnerHTML={{ __html: content }} />;
}

export default function AdminBlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const isNew = postId === 'new';
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [authors, setAuthors] = React.useState<BlogAuthor[]>([]);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    title: '', slug: '', excerpt: '', content: '', featuredImage: '',
    metaTitle: '', metaDescription: '', keywords: '',
    categoryId: '', authorId: '', linkedOfferIds: [] as string[],
    status: 'draft', isFeatured: false,
  });

  React.useEffect(() => {
    Promise.all([
      fetch('/api/blog/categories').then(r => r.json()),
      fetch('/api/blog/authors').then(r => r.json()),
      fetch('/api/offers').then(r => r.json()),
    ]).then(([cats, auths, offs]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setAuthors(Array.isArray(auths) ? auths : []);
      setOffers(Array.isArray(offs) ? offs : []);
    }).catch(console.error);
  }, []);

  React.useEffect(() => {
    if (isNew) { setLoading(false); return; }
    fetch('/api/blog/posts?status=all').then(r => r.json()).then((data: any[]) => {
      const post = data.find(p => p.id === postId);
      if (post) {
        setForm({
          title: post.title || '', slug: post.slug || '', excerpt: post.excerpt || '',
          content: post.content || '', featuredImage: post.featuredImage || '',
          metaTitle: post.metaTitle || '', metaDescription: post.metaDescription || '',
          keywords: post.keywords || '', categoryId: post.categoryId || '',
          authorId: post.authorId || '', linkedOfferIds: post.linkedOfferIds || [],
          status: post.status || 'draft', isFeatured: post.isFeatured || false,
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [postId, isNew]);

  const handleTitleChange = (title: string) => {
    const newSlug = generateSlug(title);
    setForm(prev => ({ ...prev, title, slug: newSlug, metaTitle: prev.metaTitle || title.slice(0, 60) }));
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setForm(prev => ({ ...prev, slug: cleanSlug }));
  };

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    const payload = { ...form, status: publish ? 'published' : form.status, linkedOfferIds: form.linkedOfferIds.length > 0 ? form.linkedOfferIds : null };
    try {
      const url = isNew ? '/api/blog/posts' : '/api/blog/posts/' + form.slug;
      const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { router.push('/admin/blog'); } else { const error = await res.json(); alert(error.error || 'Ошибка сохранения'); }
    } catch (error) { console.error('Error saving post:', error); alert('Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) { setForm(prev => ({ ...prev, featuredImage: data.url })); }
    } catch (error) { console.error('Error uploading image:', error); }
  };

  if (loading) {
    return (<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>);
  }

  const readingTime = calculateReadingTime(form.content);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/admin/blog"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'Новая статья' : 'Редактирование статьи'}</h1>
            <p className="text-sm text-muted-foreground">{readingTime} мин чтения</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Сохранить черновик
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}><Eye className="h-4 w-4 mr-2" />Опубликовать</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card><CardContent className="p-4"><Input placeholder="Заголовок статьи" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-xl font-semibold border-0 p-0 focus-visible:ring-0" /></CardContent></Card>
          <Card><CardContent className="p-4">
            <Tabs defaultValue="editor">
              <TabsList className="mb-4"><TabsTrigger value="editor">Редактор</TabsTrigger><TabsTrigger value="preview">Предпросмотр</TabsTrigger></TabsList>
              <TabsContent value="editor"><TipTapEditor value={form.content} onChange={(content) => setForm(prev => ({ ...prev, content }))} /></TabsContent>
              <TabsContent value="preview">{form.content ? <ContentPreview content={form.content} /> : <div className="text-center py-12 text-muted-foreground">Содержимое не добавлено</div>}</TabsContent>
            </Tabs>
          </CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Настройки</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL-адрес статьи</Label>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-2 rounded-l-md border border-r-0">/blog/</span>
                  <Input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="url-statyi" className="rounded-l-none" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Полный URL: <code className="bg-muted px-1 rounded">/blog/{form.slug || '...'}</code></p>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликована</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Избранная статья</Label>
                <Switch checked={form.isFeatured} onCheckedChange={(checked) => setForm(prev => ({ ...prev, isFeatured: checked }))} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Изображение</CardTitle></CardHeader>
            <CardContent>
              {form.featuredImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={form.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setForm(prev => ({ ...prev, featuredImage: '' }))}>Удалить</Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Загрузить изображение</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Категория и автор</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Категория</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm(prev => ({ ...prev, categoryId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Автор</Label>
                <Select value={form.authorId} onValueChange={(v) => setForm(prev => ({ ...prev, authorId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите автора" /></SelectTrigger>
                  <SelectContent>{authors.map(author => (<SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Краткое описание</CardTitle></CardHeader>
            <CardContent><Textarea placeholder="Краткое описание для карточки статьи..." value={form.excerpt} onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))} rows={3} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input value={form.metaTitle} onChange={(e) => setForm(prev => ({ ...prev, metaTitle: e.target.value }))} placeholder="SEO заголовок" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{form.metaTitle.length}/60 символов</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={form.metaDescription} onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))} placeholder="SEO описание" rows={2} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{form.metaDescription.length}/160 символов</p>
              </div>
              <div>
                <Label>Ключевые слова</Label>
                <Input value={form.keywords} onChange={(e) => setForm(prev => ({ ...prev, keywords: e.target.value }))} placeholder="ключевые, слова, через, запятую" className="mt-1" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Связанные офферы</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {offers.map(offer => (
                  <label key={offer.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                    <input type="checkbox" checked={form.linkedOfferIds.includes(offer.id)} onChange={(e) => { setForm(prev => ({ ...prev, linkedOfferIds: e.target.checked ? [...prev.linkedOfferIds, offer.id] : prev.linkedOfferIds.filter(id => id !== offer.id) })); }} className="rounded" />
                    <span className="text-sm">{offer.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}