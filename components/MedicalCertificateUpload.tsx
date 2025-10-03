"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface MedicalCertificateUploadProps {
  visitRequestId: number;
  employeeId: number;
  onUploadSuccess?: () => void;
}

interface UploadedFile {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  description: string;
  certificateType: string;
  uploadedAt: string;
}

export default function MedicalCertificateUpload({ 
  visitRequestId, 
  employeeId, 
  onUploadSuccess 
}: MedicalCertificateUploadProps) {
  const { accessToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [certificateType, setCertificateType] = useState('CERTIFICAT_MEDICAL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const certificateTypes = [
    { value: 'CERTIFICAT_MEDICAL', label: 'Certificat médical' },
    { value: 'ORDONNANCE', label: 'Ordonnance' },
    { value: 'RAPPORT_MEDICAL', label: 'Rapport médical' },
    { value: 'ARRET_TRAVAIL', label: 'Arrêt de travail' },
    { value: 'AUTRE', label: 'Autre document' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux. Taille maximum : 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non autorisé. Formats acceptés : PDF, JPEG, JPG, PNG, GIF');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('visitRequestId', visitRequestId.toString());
      formData.append('employeeId', employeeId.toString());
      formData.append('description', description);
      formData.append('certificateType', certificateType);

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/v1/medical-certificates/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        setUploadedFiles(prev => [...prev, uploadedFile]);
        setSelectedFile(null);
        setDescription('');
        setCertificateType('CERTIFICAT_MEDICAL');
        toast.success('Certificat médical uploadé avec succès');
        onUploadSuccess?.();
      } else {
        const error = await response.text();
        toast.error(`Erreur lors de l'upload : ${error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/v1/medical-certificates/${fileId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        toast.success('Fichier supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression du fichier');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression du fichier');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de certificats médicaux
        </CardTitle>
        <CardDescription>
          Ajoutez les certificats médicaux nécessaires pour la visite de reprise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Sélectionner un fichier</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Formats acceptés : PDF, JPEG, JPG, PNG, GIF (max 10MB)
            </p>
          </div>

          <div>
            <Label htmlFor="certificateType">Type de certificat</Label>
            <Select value={certificateType} onValueChange={setCertificateType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {certificateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du certificat..."
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Uploader le certificat
              </>
            )}
          </Button>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Certificats uploadés</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.contentType)}
                    <div>
                      <p className="font-medium text-sm">{file.originalFileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)} • {file.certificateType} • 
                        {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
                      </p>
                      {file.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/v1/medical-certificates/${file.id}/download`, '_blank')}
                    >
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadedFiles.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              {uploadedFiles.length} certificat(s) uploadé(s) avec succès
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
