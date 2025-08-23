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
  const { accessToken, user } = useAuth();
  const { themeColors } = useTheme();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Helper function to get theme color
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade];
  };

  useEffect(() => {
    // Always try to fetch certificates, regardless of hasMedicalCertificates flag
    fetchCertificates(page, size);
  }, [visitRequest.id, page, size]);

  const fetchCertificates = async (pageParam: number, sizeParam: number) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/medical-certificates/visit/${visitRequest.id}/page?page=${pageParam}&size=${sizeParam}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Certificates API response:', data);
        // Spring Data Page format
        setCertificates(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
        console.log('Set certificates:', data.content ?? [], 'totalElements:', data.totalElements ?? 0);
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/medical-certificates/${certificateId}/download`, { headers });
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

  const isMedicalStaff = !!user && (user.roles?.includes('INFIRMIER_ST') || user.roles?.includes('MEDECIN_TRAVAIL'));
  const isRhUser = !!user && (user.roles?.includes('RESP_RH') || user.roles?.includes('RH'));
  const canViewRepriseDetails = isMedicalStaff || isRhUser;

  const getRepriseCategoryLabel = (cat?: string) => {
    switch ((cat || '').toUpperCase()) {
      case 'AT_MP':
        return "Accident du travail / Maladie professionnelle";
      case 'ACCIDENT_TRAVAIL':
        return "Accident du travail";
      case 'MALADIE_PROFESSIONNELLE':
        return "Maladie professionnelle";
      case 'ACCIDENT_MALADIE_HORS_AT_MP':
      case 'ACCIDENT_HORS_AT_MP':
      case 'ACCIDENT_HORS_ATMP':
        return "Accident hors AT/MP";
      case 'MALADIE_HORS_AT_MP':
      case 'MALADIE_HORS_ATMP':
        return "Maladie hors AT/MP";
      case 'ABSENCES_REPETEES':
        return "Absences répétées pour raison de santé";
      case 'ACCOUCHEMENT':
        return "Absence pour accouchement";
      case 'MALADIE_ORDINAIRE':
        return "Maladie ordinaire";
      case 'CONGES_MALADIE':
        return "Congé maladie";
      case 'ACCIDENT_VIE_PRIVEE':
        return "Accident de la vie privée";
      case 'MALADIE_LONGUE_DUREE':
        return "Maladie de longue durée";
      case 'REPRISE_APRES_ARRET':
        return "Reprise après arrêt de travail";
      case 'SURVEILLANCE_MEDICALE':
        return "Surveillance médicale";
      default:
        // If no match found, try to make it more readable
        if (cat) {
          return cat
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\b(AT|MP)\b/g, match => match === 'AT' ? 'AT' : 'MP');
        }
        return '—';
    }
  };

  const extractAccidentDateFromDetails = (details?: string): string | null => {
    if (!details) return null;
    // support key=value; pairs first
    const dateKey = /(?:^|;|\s)date=([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/i.exec(details);
    if (dateKey && dateKey[1]) return dateKey[1];
    const isoMatch = details.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (isoMatch) return isoMatch[0];
    const frMatch = details.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    if (frMatch) return frMatch[0];
    return null;
  };

  const extractIttFromDetails = (details?: string): string | null => {
    if (!details) return null;
    const ittKey = /(?:^|;|\s)itt=([0-9]+)/i.exec(details);
    if (ittKey && ittKey[1]) return `${ittKey[1]} jours`;
    return null;
  };

  const extractAbsenceFromDetails = (details?: string): string | null => {
    if (!details) return null;
    const absKey = /(?:^|;|\s)absence=([0-9]+)/i.exec(details);
    if (absKey && absKey[1]) return `${absKey[1]} jours`;
    return null;
  };

  const shouldHideCertificates = false; // Always show certificates for now

  const isAutoMotif = (motif?: string) => {
    if (!motif) return false;
    const m = motif.trim();
    return /^Reprise/i.test(m) || /^Visite de reprise/i.test(m);
  };
  const displayMotif = !visitRequest.motif || isAutoMotif(visitRequest.motif) ? '—' : visitRequest.motif;
  const certsAvailable = (visitRequest.hasMedicalCertificates ?? false) || certificates.length > 0;
  const shouldShowMotif = displayMotif !== '—';
  const hasAnyCertificates = (totalElements > 0) || (certificates.length > 0);
  const showCertificatesSection = hasAnyCertificates;
  
  // Debug logging
  console.log('Certificate display logic:', {
    totalElements,
    certificatesLength: certificates.length,
    hasAnyCertificates,
    showCertificatesSection,
    shouldHideCertificates
  });

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
                Détails de la visite
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {visitRequest.employeeName} • Visite de reprise créée le {new Date(visitRequest.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

        </div>
        {canViewRepriseDetails && visitRequest.visitType === 'REPRISE' && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="p-3 rounded-xl border bg-white/60 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">Type d'absence</div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{getRepriseCategoryLabel(visitRequest.repriseCategory)}</div>
            </div>
            {['AT_MP','ACCIDENT_TRAVAIL','MALADIE_PROFESSIONNELLE'].includes((visitRequest.repriseCategory || '').toUpperCase()) ? (
              <div className="p-3 rounded-xl border bg-white/60 dark:bg-slate-800/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Date de l'accident</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {extractAccidentDateFromDetails(visitRequest.repriseDetails) || '—'}
                </div>
              </div>
            ) : (
              certsAvailable ? (
                <div className="p-3 rounded-xl border bg-white/60 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Certificat</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Disponibles</div>
                </div>
              ) : null
            )}
            {['AT_MP','ACCIDENT_TRAVAIL','MALADIE_PROFESSIONNELLE'].includes((visitRequest.repriseCategory || '').toUpperCase()) ? (
              <div className="p-3 rounded-xl border bg-white/60 dark:bg-slate-800/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">ITT</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{extractIttFromDetails(visitRequest.repriseDetails) || '—'}</div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border bg-white/60 dark:bg-slate-800/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Durée d'absence</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{extractAbsenceFromDetails(visitRequest.repriseDetails) || '—'}</div>
              </div>
            )}
            {shouldShowMotif && (
              <div className="p-3 rounded-xl border bg-white/60 dark:bg-slate-800/60 md:col-span-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">Motif</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{displayMotif}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medical Certificates - Modern Design */}
      {showCertificatesSection && (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})` }}>
              <FileText className="h-6 w-6" style={{ color: getThemeColor(700) }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Certificats médicaux</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {totalElements} certificat{totalElements !== 1 ? 's' : ''} • Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
              </p>
            </div>
          </div>

        </div>



        {certificates.length > 0 ? (
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
            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Par page:</span>
                <select
                  className="bg-transparent border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1"
                  value={size}
                  onChange={(e) => { setPage(0); setSize(parseInt(e.target.value, 10)); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: getThemeColor(300),
                    color: getThemeColor(700),
                    background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                    boxShadow: `0 4px 12px -4px ${getThemeColor(500)}20`
                  }}
                >
                  Précédent
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={totalPages === 0 || page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: getThemeColor(300),
                    color: getThemeColor(700),
                    background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                    boxShadow: `0 4px 12px -4px ${getThemeColor(500)}20`
                  }}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      )}
    </div>
  );
}
