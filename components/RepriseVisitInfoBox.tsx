"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface MedicalCertificate {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  description: string;
  certificateType: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface RepriseVisitInfoBoxProps {
  visitRequest: {
    id: number;
    employeeName: string;
    employeeEmail: string;
    motif: string;
    dateSouhaitee: string;
    heureSouhaitee: string;
    status: string;
    visitType: string;
    repriseCategory: string;
    repriseDetails: string;
    hasMedicalCertificates: boolean;
    createdAt: string;
  };
  onClose?: () => void;
}

export default function RepriseVisitInfoBox({ visitRequest, onClose }: RepriseVisitInfoBoxProps) {
  const { accessToken } = useAuth();
  const { themeColors } = useTheme();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to get theme color
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade];
  };

  useEffect(() => {
    // Always try to fetch certificates, regardless of hasMedicalCertificates flag
    fetchCertificates();
  }, [visitRequest.id]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`/api/v1/medical-certificates/visit/${visitRequest.id}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch certificates:', response.status, errorText);
        toast.error(`Erreur lors du chargement des certificats`);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Erreur lors du chargement des certificats');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId: string, fileName: string) => {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`/api/v1/medical-certificates/${certificateId}/download`, { headers });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Téléchargement démarré');
      } else {
        toast.error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'CERTIFICAT_MEDICAL': 'Certificat médical',
      'ORDONNANCE': 'Ordonnance',
      'RAPPORT_MEDICAL': 'Rapport médical',
      'ARRET_TRAVAIL': 'Arrêt de travail',
      'AUTRE': 'Autre document'
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
      {/* Header Section - Modern Design */}
      <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-8 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(600)})` }}>
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Certificats médicaux
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {visitRequest.employeeName} • Visite de reprise créée le {new Date(visitRequest.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Medical Certificates - Modern Design */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})` }}>
              <FileText className="h-6 w-6" style={{ color: getThemeColor(700) }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Certificats médicaux</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {certificates.length} certificat{certificates.length !== 1 ? 's' : ''} trouvé{certificates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

        </div>



        {loading ? (
          <div className="flex items-center justify-center p-6 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: getThemeColor(500) }}></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Chargement des certificats...</span>
            </div>
          </div>
        ) : certificates.length > 0 ? (
          <div className="space-y-3">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="flex items-center justify-between p-6 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl shadow-md" style={{ background: `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})` }}>
                    <FileText className="h-6 w-6" style={{ color: getThemeColor(700) }} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-base text-slate-900 dark:text-slate-100">{certificate.originalFileName}</p>
                                         <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                       <div className="flex items-center gap-1">
                         <span className="font-medium">Taille:</span>
                         <span>{formatFileSize(certificate.fileSize)}</span>
                       </div>
                       <Badge className="px-3 py-1 text-xs font-medium rounded-full" style={{
                         background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(600)})`,
                         color: 'white',
                         boxShadow: `0 2px 8px -2px ${getThemeColor(500)}40`
                       }}>
                         {getCertificateTypeLabel(certificate.certificateType)}
                       </Badge>
                     </div>
                    {certificate.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg">
                        {certificate.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCertificate(certificate.id, certificate.originalFileName)}
                    className="px-4 py-2 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      borderColor: getThemeColor(400),
                      color: getThemeColor(700),
                      background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-2xl" style={{ borderColor: `${getThemeColor(300)}40` }}>
            <div className="text-center">
              <div className="p-4 rounded-2xl mx-auto mb-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})` }}>
                <FileText className="h-10 w-10" style={{ color: getThemeColor(700) }} />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {visitRequest.hasMedicalCertificates 
                  ? 'Aucun certificat médical disponible'
                  : 'Aucun certificat médical uploadé pour cette visite'
                }
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Les certificats médicaux apparaîtront ici une fois uploadés
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
