import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  getVehiclesByOwner,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/vehicleService'
import { Vehicle } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import ImageUpload from '../components/ui/ImageUpload'
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share2,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react'

// Componente de compartilhamento
interface VehicleShareFormProps {
  vehicle: Vehicle | null
  onClose: () => void
}

const VehicleShareForm: React.FC<VehicleShareFormProps> = ({
  vehicle,
  onClose,
}) => {
  const [shareUrl, setShareUrl] = useState('')

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copiado para a área de transferência!')
      } catch (err) {
        console.error('Erro ao copiar link:', err)
        alert('Erro ao copiar link. Tente novamente.')
      }
    }
  }

  React.useEffect(() => {
    if (!vehicle) {
      setShareUrl('')
      return
    }
    const baseUrl = window.location.origin
    const url = `${baseUrl}/public/vehicle/${vehicle.id}`
    setShareUrl(url)
  }, [vehicle])

  if (!vehicle) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Nenhum veículo selecionado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">
          Link de compartilhamento
        </h3>
        <div className="flex space-x-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
            placeholder="Gerando link..."
          />
          <Button onClick={copyToClipboard} disabled={!shareUrl}>
            Copiar
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Este link permite visualizar as informações do veículo publicamente
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  )
}

const Vehicles: React.FC = () => {
  const { user } = useAuthStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [sharingVehicle, setSharingVehicle] = useState<Vehicle | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setError(null)
      if (!user?.id) {
        // Se não há usuário, encerra o loading para evitar tela travada
        if (active) {
          setVehicles([])
          setLoading(false)
        }
        return
      }
      setLoading(true)
      try {
        const v = await getVehiclesByOwner(user.id)
        if (!active) return
        setVehicles(v)
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar veículos')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user?.id])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  const handleAddVehicle = async (
    vehicleData: Partial<Vehicle> & { photoFile?: File | null }
  ) => {
    if (!user?.id) {
      setError('Usuário não autenticado')
      return
    }
    try {
      const payload = {
        ownerId: user.id,
        plate: vehicleData.plate || '',
        model: vehicleData.model || '',
        year: vehicleData.year || new Date().getFullYear(),
        color: vehicleData.color || '',
        renavam: vehicleData.renavam || '',
        photo: vehicleData.photo || undefined,
      }
      const { vehicle, error } = await createVehicle(payload)
      if (error || !vehicle) {
        setError(error?.message || 'Falha ao criar veículo')
        return
      }
      setVehicles([vehicle, ...vehicles])
      setIsAddModalOpen(false)
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao criar veículo')
    }
  }

  const handleEditVehicle = async (
    vehicleData: Partial<Vehicle> & { photoFile?: File | null }
  ) => {
    if (!editingVehicle) return
    try {
      const changes = {
        plate: vehicleData.plate,
        model: vehicleData.model,
        year: vehicleData.year,
        color: vehicleData.color,
        renavam: vehicleData.renavam,
        photo: vehicleData.photo || undefined,
        isActive: editingVehicle.isActive,
      }
      const { vehicle, error } = await updateVehicle(editingVehicle.id, changes)
      if (error || !vehicle) {
        setError(error?.message || 'Falha ao atualizar veículo')
        return
      }
      const updatedVehicles = vehicles.map((v) =>
        v.id === editingVehicle.id ? vehicle : v
      )
      setVehicles(updatedVehicles)
      setIsEditModalOpen(false)
      setEditingVehicle(null)
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao atualizar veículo')
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) return
    try {
      const { error } = await deleteVehicle(vehicleId)
      if (error) {
        setError(error.message || 'Falha ao excluir veículo')
        return
      }
      setVehicles(vehicles.filter((v) => v.id !== vehicleId))
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao excluir veículo')
    }
  }

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsEditModalOpen(true)
  }

  const openShareModal = (vehicle: Vehicle) => {
    setSharingVehicle(vehicle)
    setIsShareModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Veículos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus veículos e acompanhe suas informações
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Veículo
        </Button>
      </div>

      {/* Lista de veículos */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Carregando...</p>
          </div>
        </Card>
      ) : vehicles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum veículo cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece adicionando seu primeiro veículo para começar a gerenciar
              suas despesas
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Veículo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error && (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            </div>
          )}
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              {/* Foto do veículo */}
              <div className="h-48 bg-gray-200 relative">
                {vehicle.photo ? (
                  <img
                    src={vehicle.photo}
                    alt={vehicle.model}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-900 shadow-sm">
                    {vehicle.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Informações do veículo */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {vehicle.model}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {vehicle.plate} • {vehicle.year} • {vehicle.color}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Cadastrado em {formatDate(vehicle.createdAt)}
                </p>

                {/* Ações */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link to={`/vehicles/${vehicle.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(vehicle)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openShareModal(vehicle)}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>

                {/* Links rápidos */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/vehicles/${vehicle.id}/expenses`}
                      className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <DollarSign className="w-4 h-4 mb-1" />
                      Despesas
                    </Link>
                    <Link
                      to={`/vehicles/${vehicle.id}/groups`}
                      className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4 mb-1" />
                      Grupos
                    </Link>
                    <Link
                      to={`/vehicles/${vehicle.id}/calendar`}
                      className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4 mb-1" />
                      Calendário
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de adicionar veículo */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Veículo"
        size="md"
      >
        <VehicleForm
          onSubmit={handleAddVehicle}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Modal de editar veículo */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingVehicle(null)
        }}
        title="Editar Veículo"
        size="md"
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={handleEditVehicle}
          onCancel={() => {
            setIsEditModalOpen(false)
            setEditingVehicle(null)
          }}
        />
      </Modal>

      {/* Modal de compartilhar veículo */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false)
          setSharingVehicle(null)
        }}
        title="Compartilhar Veículo"
        size="md"
      >
        <VehicleShareForm
          vehicle={sharingVehicle}
          onClose={() => {
            setIsShareModalOpen(false)
            setSharingVehicle(null)
          }}
        />
      </Modal>
    </div>
  )
}

// Componente do formulário de veículo
interface VehicleFormProps {
  vehicle?: Vehicle | null
  onSubmit: (data: Partial<Vehicle> & { photoFile?: File | null }) => void
  onCancel: () => void
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    plate: vehicle?.plate || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    color: vehicle?.color || '',
    renavam: vehicle?.renavam || '',
    photo: vehicle?.photo || '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...formData, photoFile })
  }

  const handlePhotoChange = (file: File | null, previewUrl?: string) => {
    setPhotoFile(file)
    if (previewUrl) {
      setFormData((prev) => ({ ...prev, photo: previewUrl }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'year' ? parseInt(value) || new Date().getFullYear() : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Placa"
          name="plate"
          value={formData.plate}
          onChange={handleChange}
          placeholder="ABC-1234"
          required
        />
        <Input
          label="Modelo"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Honda Civic"
          required
        />
        <Input
          label="Ano"
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          min="1900"
          max={new Date().getFullYear() + 1}
          required
        />
        <Input
          label="Cor"
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="Prata"
          required
        />
        <Input
          label="RENAVAM"
          name="renavam"
          value={formData.renavam}
          onChange={handleChange}
          placeholder="12345678901"
          required
        />
      </div>

      <ImageUpload
        label="Foto do Veículo"
        value={formData.photo}
        onChange={handlePhotoChange}
        accept="image/*"
        maxSize={5}
        helperText="Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {vehicle ? 'Salvar Alterações' : 'Adicionar Veículo'}
        </Button>
      </div>
    </form>
  )
}

export default Vehicles
