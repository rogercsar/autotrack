import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserVehicles, mockExpenses } from '../data/mockData';
import { Vehicle, VehicleExportData, UserType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  FileText, 
  Download, 
  Share2, 
  Mail, 
  MessageCircle, 
  QrCode,
  Eye,
  Copy,
  CheckCircle,
  Car,
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const ExportShare: React.FC = () => {
  const { user } = useAuth();
  const [vehicles] = useState<Vehicle[]>(getUserVehicles(user?.id || ''));
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Verificar se o usuário pode exportar
  const canExport = user?.userType === UserType.ADVANCED || user?.userType === UserType.PRO;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getExpenseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      fuel: 'Abastecimento',
      maintenance: 'Manutenção',
      ticket: 'Multa',
      insurance: 'Seguro',
      ipva: 'IPVA',
      licensing: 'Licenciamento',
      other: 'Outros'
    };
    return types[type] || type;
  };

  const generateExportData = (vehicle: Vehicle): VehicleExportData => {
    const expenses = mockExpenses.filter(e => e.vehicleId === vehicle.id);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calcular média mensal dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentExpenses = expenses.filter(e => new Date(e.date) >= sixMonthsAgo);
    const averageMonthlyExpense = recentExpenses.length > 0 
      ? recentExpenses.reduce((sum, e) => sum + e.amount, 0) / 6 
      : 0;

    return {
      vehicle,
      expenses,
      totalExpenses,
      averageMonthlyExpense,
      exportDate: new Date()
    };
  };

  const generatePDF = async (vehicle: Vehicle) => {
    if (!canExport) {
      alert('Exportação PDF disponível apenas para usuários Avançado e Pro.');
      return;
    }

    const exportData = generateExportData(vehicle);
    const pdf = new jsPDF();
    
    // Configurações
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Função para adicionar texto
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      pdf.setFontSize(options.fontSize || 12);
      pdf.text(text, x, y);
    };

    // Função para adicionar linha
    const addLine = (x1: number, y1: number, x2: number, y2: number) => {
      pdf.line(x1, y1, x2, y2);
    };

    // Cabeçalho
    addText('AutoTrack - Relatório de Veículo', margin, yPosition, { fontSize: 18 });
    yPosition += 10;
    addText(`Gerado em: ${formatDate(exportData.exportDate)}`, margin, yPosition);
    yPosition += 20;

    // Informações do veículo
    addText('INFORMAÇÕES DO VEÍCULO', margin, yPosition, { fontSize: 14 });
    yPosition += 10;
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    addText(`Modelo: ${vehicle.model}`, margin, yPosition);
    yPosition += 8;
    addText(`Placa: ${vehicle.plate}`, margin, yPosition);
    yPosition += 8;
    addText(`Ano: ${vehicle.year}`, margin, yPosition);
    yPosition += 8;
    addText(`Cor: ${vehicle.color}`, margin, yPosition);
    yPosition += 8;
    addText(`RENAVAM: ${vehicle.renavam}`, margin, yPosition);
    yPosition += 20;

    // Resumo financeiro
    addText('RESUMO FINANCEIRO', margin, yPosition, { fontSize: 14 });
    yPosition += 10;
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    addText(`Total de Despesas: ${formatCurrency(exportData.totalExpenses)}`, margin, yPosition);
    yPosition += 8;
    addText(`Média Mensal (6 meses): ${formatCurrency(exportData.averageMonthlyExpense)}`, margin, yPosition);
    yPosition += 8;
    addText(`Total de Registros: ${exportData.expenses.length}`, margin, yPosition);
    yPosition += 20;

    // Despesas por categoria
    const expensesByType = exportData.expenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    addText('DESPESAS POR CATEGORIA', margin, yPosition, { fontSize: 14 });
    yPosition += 10;
    addLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    Object.entries(expensesByType).forEach(([type, amount]) => {
      addText(`${getExpenseTypeLabel(type)}: ${formatCurrency(amount)}`, margin, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Lista de despesas
    if (exportData.expenses.length > 0) {
      addText('HISTÓRICO DE DESPESAS', margin, yPosition, { fontSize: 14 });
      yPosition += 10;
      addLine(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Cabeçalho da tabela
      addText('Data', margin, yPosition, { fontSize: 10 });
      addText('Tipo', margin + 40, yPosition, { fontSize: 10 });
      addText('Descrição', margin + 80, yPosition, { fontSize: 10 });
      addText('Valor', pageWidth - margin - 30, yPosition, { fontSize: 10 });
      yPosition += 5;
      addLine(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Linhas da tabela
      exportData.expenses.slice(0, 20).forEach((expense) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }

        addText(formatDate(expense.date), margin, yPosition, { fontSize: 9 });
        addText(getExpenseTypeLabel(expense.type), margin + 40, yPosition, { fontSize: 9 });
        addText(expense.description.substring(0, 30), margin + 80, yPosition, { fontSize: 9 });
        addText(formatCurrency(expense.amount), pageWidth - margin - 30, yPosition, { fontSize: 9 });
        yPosition += 6;
      });

      if (exportData.expenses.length > 20) {
        yPosition += 10;
        addText(`... e mais ${exportData.expenses.length - 20} despesas`, margin, yPosition, { fontSize: 9 });
      }
    }

    // Rodapé
    const pageHeight = pdf.internal.pageSize.getHeight();
    addText('Relatório gerado pelo AutoTrack - Gestão Veicular', margin, pageHeight - 20, { fontSize: 8 });
    addText('www.autotrack.com.br', pageWidth - margin - 50, pageHeight - 20, { fontSize: 8 });

    // Download
    pdf.save(`relatorio-${vehicle.plate}-${formatDate(new Date())}.pdf`);
  };

  const generateShareUrl = (vehicle: Vehicle) => {
    const baseUrl = window.location.origin;
    const vehicleId = vehicle.id;
    const shareUrl = `${baseUrl}/public/vehicle/${vehicleId}`;
    setShareUrl(shareUrl);
    return shareUrl;
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url);
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const shareViaWhatsApp = (url: string) => {
    const message = `Confira as informações do meu veículo no AutoTrack: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = (url: string) => {
    const subject = 'Informações do meu veículo - AutoTrack';
    const body = `Olá,\n\nConfira as informações do meu veículo no AutoTrack:\n${url}\n\nAtenciosamente`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const openExportModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsExportModalOpen(true);
  };

  const openShareModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    const url = generateShareUrl(vehicle);
    generateQRCode(url);
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exportar e Compartilhar</h1>
          <p className="text-gray-600 mt-1">
            Exporte relatórios em PDF e compartilhe informações dos seus veículos
          </p>
        </div>
      </div>

      {/* Aviso sobre planos */}
      {!canExport && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex">
            <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Exportação PDF</h4>
              <p className="text-sm text-blue-700 mt-1">
                A exportação de relatórios em PDF está disponível apenas para usuários Avançado e Pro. 
                <a href="/register" className="underline ml-1">Faça upgrade do seu plano</a> para acessar esta funcionalidade.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de veículos */}
      <div className="space-y-4">
        {vehicles.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum veículo cadastrado
              </h3>
              <p className="text-gray-500">
                Cadastre um veículo para começar a exportar e compartilhar
              </p>
            </div>
          </Card>
        ) : (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Foto do veículo */}
                <div className="flex-shrink-0">
                  {vehicle.photo ? (
                    <img
                      src={vehicle.photo}
                      alt={vehicle.model}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Informações do veículo */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {vehicle.plate} • {vehicle.year} • {vehicle.color}
                  </p>

                  {/* Estatísticas rápidas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-600">Despesas</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {mockExpenses.filter(e => e.vehicleId === vehicle.id).length}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          mockExpenses
                            .filter(e => e.vehicleId === vehicle.id)
                            .reduce((sum, e) => sum + e.amount, 0)
                        )}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-1">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="text-xs text-gray-600">Cadastrado</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(vehicle.createdAt)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-gray-600">Status</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {vehicle.isActive ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openExportModal(vehicle)}
                      disabled={!canExport}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShareModal(vehicle)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/vehicles/${vehicle.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de exportação */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setSelectedVehicle(null);
        }}
        title="Exportar Relatório PDF"
        size="md"
      >
        {selectedVehicle && (
          <ExportOptions
            vehicle={selectedVehicle}
            onExport={() => {
              generatePDF(selectedVehicle);
              setIsExportModalOpen(false);
              setSelectedVehicle(null);
            }}
            onCancel={() => {
              setIsExportModalOpen(false);
              setSelectedVehicle(null);
            }}
          />
        )}
      </Modal>

      {/* Modal de compartilhamento */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedVehicle(null);
          setShareUrl('');
          setQrCodeUrl('');
        }}
        title="Compartilhar Veículo"
        size="lg"
      >
        {selectedVehicle && (
          <ShareOptions
            vehicle={selectedVehicle}
            shareUrl={shareUrl}
            qrCodeUrl={qrCodeUrl}
            onCopy={() => copyToClipboard(shareUrl)}
            onWhatsApp={() => shareViaWhatsApp(shareUrl)}
            onEmail={() => shareViaEmail(shareUrl)}
            copied={copied}
            onClose={() => {
              setIsShareModalOpen(false);
              setSelectedVehicle(null);
              setShareUrl('');
              setQrCodeUrl('');
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// Componente de opções de exportação
interface ExportOptionsProps {
  vehicle: Vehicle;
  onExport: () => void;
  onCancel: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ vehicle, onExport, onCancel }) => {
  const expenses = mockExpenses.filter(e => e.vehicleId === vehicle.id);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Informações do veículo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Veículo selecionado</h3>
        <div className="flex items-center space-x-3">
          {vehicle.photo ? (
            <img
              src={vehicle.photo}
              alt={vehicle.model}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{vehicle.model}</p>
            <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.year}</p>
          </div>
        </div>
      </div>

      {/* Resumo do relatório */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Resumo do relatório</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total de despesas</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Registros</p>
            <p className="text-lg font-semibold text-gray-900">
              {expenses.length}
            </p>
          </div>
        </div>
      </div>

      {/* O que será incluído */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">O relatório incluirá:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Informações completas do veículo
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Resumo financeiro e estatísticas
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Histórico de despesas por categoria
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Tabela detalhada de gastos
          </li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Gerar e Baixar PDF
        </Button>
      </div>
    </div>
  );
};

// Componente de opções de compartilhamento
interface ShareOptionsProps {
  vehicle: Vehicle;
  shareUrl: string;
  qrCodeUrl: string;
  onCopy: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
  copied: boolean;
  onClose: () => void;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({
  vehicle,
  shareUrl,
  qrCodeUrl,
  onCopy,
  onWhatsApp,
  onEmail,
  copied,
  onClose
}) => {
  return (
    <div className="space-y-6">
      {/* Informações do veículo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Veículo selecionado</h3>
        <div className="flex items-center space-x-3">
          {vehicle.photo ? (
            <img
              src={vehicle.photo}
              alt={vehicle.model}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{vehicle.model}</p>
            <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.year}</p>
          </div>
        </div>
      </div>

      {/* URL de compartilhamento */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Link de compartilhamento</h3>
        <div className="flex space-x-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={onCopy}
            className={copied ? 'bg-green-50 border-green-200' : ''}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Este link permite visualizar as informações do veículo publicamente
        </p>
      </div>

      {/* QR Code */}
      {qrCodeUrl && (
        <div className="text-center">
          <h3 className="font-medium text-gray-900 mb-3">QR Code</h3>
          <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
            <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Escaneie para acessar o link
          </p>
        </div>
      )}

      {/* Opções de compartilhamento */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Compartilhar via</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onWhatsApp}
            className="justify-start"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={onEmail}
            className="justify-start"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <QrCode className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Página Pública</h4>
            <p className="text-sm text-blue-700 mt-1">
              O link compartilhado leva a uma página pública onde qualquer pessoa pode visualizar 
              as informações do veículo. Use com cuidado e apenas com pessoas de confiança.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default ExportShare;
