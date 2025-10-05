'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Plane,
  Car,
  Train,
  ShoppingCart,
  Heart,
  GraduationCap,
  Gamepad2,
  Building2,
  Hotel,
  MapPin,
  Bus,
  Receipt,
  Stethoscope,
  BookOpen,
  Music,
  Landmark
} from 'lucide-react'

interface ServiceCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
  comingSoon?: boolean
  subServices?: Array<{
    name: string
    path: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

export default function ServicesPage() {
  const router = useRouter()

  const serviceCategories: ServiceCategory[] = [
    {
      id: 'travel',
      title: 'Travel & Hospitality',
      description: 'Book flights, hotels, and car rentals',
      icon: Plane,
      path: '/services/travel',
      color: 'from-blue-500 to-cyan-500',
      subServices: [
        { name: 'Flights', path: '/services/travel/flights', icon: Plane },
        { name: 'Hotels', path: '/services/travel/hotels', icon: Hotel },
        { name: 'Car Rental', path: '/services/travel/car-rental', icon: Car }
      ]
    },
    {
      id: 'transport',
      title: 'Transportation',
      description: 'Rideshare, transit passes, and toll payments',
      icon: Car,
      path: '/services/transport',
      color: 'from-green-500 to-emerald-500',
      subServices: [
        { name: 'Rideshare', path: '/services/transport/rideshare', icon: Car },
        { name: 'Transit', path: '/services/transport/transit', icon: Train },
        { name: 'Tolls', path: '/services/transport/tolls', icon: MapPin }
      ]
    },
    {
      id: 'shopping',
      title: 'Shopping',
      description: 'Online and in-store shopping with cashback',
      icon: ShoppingCart,
      path: '/services/shopping',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      description: 'Medical bills, pharmacy, and HSA/FSA',
      icon: Heart,
      path: '/services/healthcare',
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Tuition, student loans, and scholarships',
      icon: GraduationCap,
      path: '/services/education',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Events, streaming, and gaming',
      icon: Gamepad2,
      path: '/services/entertainment',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'government',
      title: 'Government Services',
      description: 'Benefits, taxes, and public services',
      icon: Building2,
      path: '/services/government',
      color: 'from-gray-600 to-gray-800'
    }
  ]

  const handleServiceClick = (service: ServiceCategory) => {
    if (!service.comingSoon) {
      router.push(service.path as any)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Super App Services</h1>
        <p className="text-gray-600">
          All your daily needs in one app - travel, transport, shopping, and more
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((service) => {
          const Icon = service.icon
          return (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleServiceClick(service)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {service.comingSoon && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              {service.subServices && (
                <CardContent>
                  <div className="space-y-2">
                    {service.subServices.map((subService) => {
                      const SubIcon = subService.icon
                      return (
                        <Button
                          key={subService.path}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(subService.path as any)
                          }}
                        >
                          <SubIcon className="h-4 w-4 mr-2" />
                          {subService.name}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Featured Partners */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Featured Partners</CardTitle>
          <CardDescription>
            Get exclusive deals and cashback with our partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Plane className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">United Airlines</p>
              <p className="text-xs text-gray-500">5% cashback</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Hotel className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Marriott</p>
              <p className="text-xs text-gray-500">3% cashback</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Car className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium">Uber</p>
              <p className="text-xs text-gray-500">2% cashback</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">Amazon</p>
              <p className="text-xs text-gray-500">1.5% cashback</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}