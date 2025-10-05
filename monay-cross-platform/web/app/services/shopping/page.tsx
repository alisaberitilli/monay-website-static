'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShoppingBag,
  Search,
  Star,
  Heart,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  TrendingUp,
  Filter,
  Package,
  Gift,
  Zap
} from 'lucide-react';

export default function ShoppingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: ShoppingBag },
    { id: 'electronics', name: 'Electronics', icon: Zap },
    { id: 'fashion', name: 'Fashion', icon: Heart },
    { id: 'home', name: 'Home & Garden', icon: Package },
    { id: 'sports', name: 'Sports & Outdoors', icon: TrendingUp },
    { id: 'beauty', name: 'Beauty & Health', icon: Star },
    { id: 'books', name: 'Books & Media', icon: Package },
    { id: 'toys', name: 'Toys & Games', icon: Gift }
  ];

  const featuredDeals = [
    {
      id: 1,
      title: 'Wireless Headphones',
      brand: 'AudioTech',
      price: 99.99,
      originalPrice: 149.99,
      discount: 33,
      rating: 4.5,
      reviews: 1247,
      image: '🎧',
      category: 'Electronics',
      shipping: 'Free shipping',
      features: ['Noise cancelling', 'Wireless', '30-hour battery']
    },
    {
      id: 2,
      title: 'Smart Fitness Watch',
      brand: 'FitPro',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      rating: 4.7,
      reviews: 892,
      image: '⌚',
      category: 'Electronics',
      shipping: 'Free shipping',
      features: ['Heart rate monitor', 'GPS', 'Waterproof']
    },
    {
      id: 3,
      title: 'Organic Cotton T-Shirt',
      brand: 'EcoWear',
      price: 24.99,
      originalPrice: 39.99,
      discount: 38,
      rating: 4.3,
      reviews: 456,
      image: '👕',
      category: 'Fashion',
      shipping: '$5.99 shipping',
      features: ['Organic cotton', 'Fair trade', 'Multiple colors']
    },
    {
      id: 4,
      title: 'Kitchen Blender Pro',
      brand: 'ChefMaster',
      price: 89.99,
      originalPrice: 129.99,
      discount: 31,
      rating: 4.6,
      reviews: 634,
      image: '🥤',
      category: 'Home',
      shipping: 'Free shipping',
      features: ['1200W motor', 'Variable speed', 'Easy clean']
    }
  ];

  const popularBrands = [
    { name: 'Apple', logo: '🍎', category: 'Electronics' },
    { name: 'Nike', logo: '✔️', category: 'Sports' },
    { name: 'Samsung', logo: '📱', category: 'Electronics' },
    { name: 'Adidas', logo: '👟', category: 'Sports' },
    { name: 'Sony', logo: '🎮', category: 'Electronics' },
    { name: 'IKEA', logo: '🏠', category: 'Home' }
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      items: 'Wireless Mouse + Keyboard',
      amount: '$79.99',
      date: '2024-01-15',
      status: 'Delivered'
    },
    {
      id: 'ORD-002',
      items: 'Running Shoes',
      amount: '$129.99',
      date: '2024-01-12',
      status: 'In Transit'
    },
    {
      id: 'ORD-003',
      items: 'Coffee Maker',
      amount: '$89.99',
      date: '2024-01-10',
      status: 'Delivered'
    }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleAddToCart = (productId: number) => {
    console.log('Adding to cart:', productId);
  };

  const handleBuyNow = (productId: number) => {
    console.log('Buy now:', productId);
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <ShoppingBag className="h-8 w-8 text-pink-600" />
            Shopping Portal
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing deals and shop with instant payment
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Featured Deals
            </CardTitle>
            <CardDescription>Limited time offers and best sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDeals.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Product Image and Badge */}
                      <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-6xl">
                          {product.image}
                        </div>
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{product.discount}%
                        </Badge>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 uppercase">{product.brand}</p>
                        <h3 className="font-semibold text-sm leading-tight">{product.title}</h3>

                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-gray-600">({product.reviews})</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-pink-600">${product.price}</span>
                            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          </div>
                          <p className="text-xs text-green-600">{product.shipping}</p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {product.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleBuyNow(product.id)}
                          className="w-full"
                          size="sm"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Buy Now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAddToCart(product.id)}
                          className="w-full"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Brands</CardTitle>
            <CardDescription>Shop from top brands you trust</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {popularBrands.map((brand, index) => (
                <div key={index} className="text-center p-4 border rounded-lg hover:shadow-md cursor-pointer">
                  <div className="text-3xl mb-2">{brand.logo}</div>
                  <h3 className="font-semibold text-sm">{brand.name}</h3>
                  <p className="text-xs text-gray-600">{brand.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Track your recent purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-100">
                      <Package className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.items}</h3>
                      <p className="text-sm text-gray-600">Order #{order.id} • {order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shopping Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Shop with Monay?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold">Instant Checkout</h3>
                <p className="text-sm text-gray-600">
                  Pay instantly with your Monay wallet
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Buyer Protection</h3>
                <p className="text-sm text-gray-600">
                  100% secure purchases with buyer protection
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-gray-600">
                  Free shipping on orders over $50
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Rewards Program</h3>
                <p className="text-sm text-gray-600">
                  Earn points on every purchase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopping Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Shopping Summary</CardTitle>
            <CardDescription>This month's shopping activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">8</div>
                <p className="text-sm text-gray-600">Orders Placed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$347</div>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$52</div>
                <p className="text-sm text-gray-600">Saved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1,240</div>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}