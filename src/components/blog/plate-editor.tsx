'use client';

import React from 'react';
import { createPlatePlugin, Plate, PlateContent } from '@udecode/plate/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import { HeadingPlugin } from '@udecode/plate-heading';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { ListPlugin } from '@udecode/plate-list';
import { LinkPlugin } from '@udecode/plate-link';
import { ImagePlugin } from '@udecode/plate-image';
import { BlockQuotePlugin } from '@udecode/plate-block-quote';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { serializeHtml } from '@udecode/plate-serializer-html';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Minus,
  Code2,
  Upload,
} from 'lucide-react';

// Plugins
const plugins = [
  ParagraphPlugin,
  BasicMarksPlugin,
  HeadingPlugin,
  ListPlugin,
  LinkPlugin,
  ImagePlugin,
  BlockQuotePlugin,
  HorizontalRulePlugin,
  CodeBlockPlugin,
];

// Toolbar Component
function EditorToolbar({ onImageUpload }: { onImageUpload?: () => void }) {
  return (
    <div className="flex items-center gap-1 p-2 bg-muted/50 border-b flex-wrap">
      {/* Marks */}
      <MarkButton mark="bold" tooltip="Жирный (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </MarkButton>
      <MarkButton mark="italic" tooltip="Курсив (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </MarkButton>
      <MarkButton mark="underline" tooltip="Подчёркнутый (Ctrl+U)">
        <Underline className="h-4 w-4" />
      </MarkButton>
      <MarkButton mark="strikethrough" tooltip="Зачёркнутый">
        <Strikethrough className="h-4 w-4" />
      </MarkButton>
      <MarkButton mark="code" tooltip="Код">
        <Code className="h-4 w-4" />
      </MarkButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <BlockButton block="h1" tooltip="Заголовок 1">
        <Heading1 className="h-4 w-4" />
      </BlockButton>
      <BlockButton block="h2" tooltip="Заголовок 2">
        <Heading2 className="h-4 w-4" />
      </BlockButton>
      <BlockButton block="h3" tooltip="Заголовок 3">
        <Heading3 className="h-4 w-4" />
      </BlockButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <BlockButton block="ul" tooltip="Маркированный список">
        <ListIcon className="h-4 w-4" />
      </BlockButton>
      <BlockButton block="ol" tooltip="Нумерованный список">
        <ListOrdered className="h-4 w-4" />
      </BlockButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Other blocks */}
      <BlockButton block="blockquote" tooltip="Цитата">
        <Quote className="h-4 w-4" />
      </BlockButton>
      <BlockButton block="code_block" tooltip="Блок кода">
        <Code2 className="h-4 w-4" />
      </BlockButton>
      <BlockButton block="hr" tooltip="Разделитель">
        <Minus className="h-4 w-4" />
      </BlockButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Link & Image */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          const url = prompt('Введите URL:');
          if (url) {
            // Insert link logic
          }
        }}
        title="Ссылка"
      >
        <Link2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={onImageUpload}
        title="Загрузить изображение"
      >
        <ImageIcon className="h-4 w-4" />
        Изображение
      </Button>
    </div>
  );
}

// Mark Button
function MarkButton({ mark, tooltip, children }: { mark: string; tooltip: string; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      title={tooltip}
      onClick={() => {
        // Toggle mark logic would go here with Plate's API
      }}
    >
      {children}
    </Button>
  );
}

// Block Button
function BlockButton({ block, tooltip, children }: { block: string; tooltip: string; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      title={tooltip}
      onClick={() => {
        // Toggle block logic would go here with Plate's API
      }}
    >
      {children}
    </Button>
  );
}

// Main Editor Component
interface PlateEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PlateEditor({ value, onChange, placeholder, className }: PlateEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Parse HTML to Slate value
  const initialValue = React.useMemo(() => {
    if (!value) return [{ type: 'p', children: [{ text: '' }] }];
    
    // Simple HTML to Slate conversion
    // In production, use proper HTML deserializer
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, 'text/html');
      const nodes: any[] = [];
      
      doc.body.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            nodes.push({
              type: tagName,
              id: element.getAttribute('id') || undefined,
              children: [{ text: element.textContent || '' }],
            });
          } else if (tagName === 'p') {
            nodes.push({
              type: 'p',
              children: [{ text: element.textContent || '' }],
            });
          } else if (tagName === 'ul') {
            const items: any[] = [];
            element.querySelectorAll('li').forEach((li) => {
              items.push({ type: 'li', children: [{ text: li.textContent || '' }] });
            });
            nodes.push({ type: 'ul', children: items });
          } else if (tagName === 'ol') {
            const items: any[] = [];
            element.querySelectorAll('li').forEach((li) => {
              items.push({ type: 'li', children: [{ text: li.textContent || '' }] });
            });
            nodes.push({ type: 'ol', children: items });
          } else if (tagName === 'blockquote') {
            nodes.push({
              type: 'blockquote',
              children: [{ text: element.textContent || '' }],
            });
          } else if (tagName === 'hr') {
            nodes.push({ type: 'hr', children: [{ text: '' }] });
          } else {
            nodes.push({
              type: 'p',
              children: [{ text: element.textContent || '' }],
            });
          }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          nodes.push({
            type: 'p',
            children: [{ text: node.textContent }],
          });
        }
      });
      
      return nodes.length > 0 ? nodes : [{ type: 'p', children: [{ text: '' }] }];
    } catch {
      return [{ type: 'p', children: [{ text: value }] }];
    }
  }, [value]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        // Insert image into editor
        const imgHtml = `<img src="${data.url}" alt="${file.name}" style="max-width: 100%; border-radius: 8px;" />`;
        onChange(value + imgHtml);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Handle content change
  const handleChange = (newValue: any) => {
    // Convert Slate value back to HTML
    // For now, we'll use a simple approach
    try {
      const html = convertToHtml(newValue);
      onChange(html);
    } catch (error) {
      console.error('Error converting to HTML:', error);
    }
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <EditorToolbar onImageUpload={() => fileInputRef.current?.click()} />
      
      <div className="min-h-[500px] bg-white">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Напишите содержимое статьи...'}
          className="w-full min-h-[500px] p-4 font-mono text-sm focus:outline-none resize-y"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

// Convert Slate value to HTML
function convertToHtml(nodes: any[]): string {
  return nodes.map((node) => {
    if (node.type === 'h1') {
      return `<h1 id="${node.id || ''}">${getChildrenText(node.children)}</h1>`;
    }
    if (node.type === 'h2') {
      return `<h2 id="${node.id || ''}">${getChildrenText(node.children)}</h2>`;
    }
    if (node.type === 'h3') {
      return `<h3 id="${node.id || ''}">${getChildrenText(node.children)}</h3>`;
    }
    if (node.type === 'p') {
      return `<p>${getChildrenText(node.children)}</p>`;
    }
    if (node.type === 'ul') {
      const items = node.children.map((li: any) => `<li>${getChildrenText(li.children)}</li>`).join('\n');
      return `<ul>\n${items}\n</ul>`;
    }
    if (node.type === 'ol') {
      const items = node.children.map((li: any) => `<li>${getChildrenText(li.children)}</li>`).join('\n');
      return `<ol>\n${items}\n</ol>`;
    }
    if (node.type === 'blockquote') {
      return `<blockquote>${getChildrenText(node.children)}</blockquote>`;
    }
    if (node.type === 'hr') {
      return '<hr />';
    }
    if (node.type === 'code_block') {
      return `<pre><code>${getChildrenText(node.children)}</code></pre>`;
    }
    return '';
  }).join('\n');
}

function getChildrenText(children: any[]): string {
  return children.map((child) => {
    if (child.text !== undefined) {
      let text = child.text;
      if (child.bold) text = `<strong>${text}</strong>`;
      if (child.italic) text = `<em>${text}</em>`;
      if (child.underline) text = `<u>${text}</u>`;
      if (child.strikethrough) text = `<s>${text}</s>`;
      if (child.code) text = `<code>${text}</code>`;
      return text;
    }
    return '';
  }).join('');
}

export default PlateEditor;
