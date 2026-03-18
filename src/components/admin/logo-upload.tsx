"use client"

import * as React from "react"
import { Upload, X, Image, Loader2, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface LogoUploadProps {
  value?: string
  onChange: (url: string) => void
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // Validate
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Недопустимый формат", {
        description: "Разрешены: JPEG, PNG, WebP, GIF, SVG"
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой", {
        description: "Максимальный размер: 5MB"
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "logo")

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      onChange(data.url)
      
      toast.success("Логотип загружен", {
        description: data.url
      })
    } catch (error) {
      console.error("Logo upload error:", error)
      toast.error("Ошибка загрузки", {
        description: error instanceof Error ? error.message : "Не удалось загрузить"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleChange}
        className="hidden"
      />

      {value ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="aspect-[3/1] w-full bg-muted flex items-center justify-center overflow-hidden">
              <img 
                src={value} 
                alt="Логотип" 
                className="max-h-full max-w-full object-contain p-2"
                onError={(e) => {
                  // Fallback for SVG
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="hidden text-muted-foreground flex items-center gap-2">
                <Image className="h-8 w-8" />
                <span>SVG логотип</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.open(value, '_blank')}
              >
                <FileImage className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }
            ${isUploading ? "opacity-50 pointer-events-none" : ""}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Загрузка...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Загрузить логотип</p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, WebP, GIF или SVG до 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
