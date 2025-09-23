'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const USER_ROLES = {
  PLATFORM_ADMIN: 'Platform Admin',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  TREASURY_MANAGER: 'Treasury Manager',
  ENTERPRISE_ADMIN: 'Enterprise Admin',
  ENTERPRISE_FINANCE: 'Enterprise Finance',
  ENTERPRISE_DEVELOPER: 'Enterprise Developer',
  PREMIUM_CONSUMER: 'Premium Consumer',
  VERIFIED_CONSUMER: 'Verified Consumer',
  BASIC_CONSUMER: 'Basic Consumer',
  MERCHANT: 'Merchant',
  PAYMENT_PROCESSOR: 'Payment Processor'
}

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ENTERPRISE_ADMIN'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate authentication
    setTimeout(() => {
      if (formData.email && formData.password) {
        localStorage.setItem('userRole', formData.role)
        localStorage.setItem('userEmail', formData.email)
        router.push('/')
      } else {
        setError('Please fill in all fields')
        setLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Monay Enterprise
          </h1>
          <p className="text-gray-600 mt-2">Enterprise Wallet & CaaS Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <optgroup label="System">
                  <option value="PLATFORM_ADMIN">Platform Admin (Unlimited)</option>
                  <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                  <option value="TREASURY_MANAGER">Treasury Manager</option>
                </optgroup>
                <optgroup label="Enterprise (CaaS)">
                  <option value="ENTERPRISE_ADMIN">Enterprise Admin</option>
                  <option value="ENTERPRISE_FINANCE">Enterprise Finance ($10M daily)</option>
                  <option value="ENTERPRISE_DEVELOPER">Enterprise Developer</option>
                </optgroup>
                <optgroup label="Consumer (WaaS)">
                  <option value="PREMIUM_CONSUMER">Premium Consumer ($250K daily)</option>
                  <option value="VERIFIED_CONSUMER">Verified Consumer ($50K daily)</option>
                  <option value="BASIC_CONSUMER">Basic Consumer ($1K daily)</option>
                </optgroup>
                <optgroup label="Business">
                  <option value="MERCHANT">Merchant</option>
                  <option value="PAYMENT_PROCESSOR">Payment Processor</option>
                </optgroup>
              </select>
            </div>

            {/* Role Info */}
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              {formData.role === 'PLATFORM_ADMIN' && 'Full system control, unlimited transactions'}
              {formData.role === 'COMPLIANCE_OFFICER' && 'KYC/AML management, transaction monitoring'}
              {formData.role === 'TREASURY_MANAGER' && 'Liquidity management, token minting/burning'}
              {formData.role === 'ENTERPRISE_ADMIN' && 'Company token deployment, employee wallet management'}
              {formData.role === 'ENTERPRISE_FINANCE' && 'Payroll processing, vendor payments ($10M daily limit)'}
              {formData.role === 'ENTERPRISE_DEVELOPER' && 'Smart contract deployment, API integration'}
              {formData.role === 'PREMIUM_CONSUMER' && '$250K daily limit, DeFi access, metal card'}
              {formData.role === 'VERIFIED_CONSUMER' && '$50K daily limit, full wallet features'}
              {formData.role === 'BASIC_CONSUMER' && '$1K daily limit, prepaid card access'}
              {formData.role === 'MERCHANT' && 'Payment acceptance, POS integration'}
              {formData.role === 'PAYMENT_PROCESSOR' && 'Gateway integration, bulk processing'}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a href="https://www.monay.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://www.monay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}