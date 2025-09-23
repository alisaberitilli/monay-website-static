'use client'

import CustomerCreateForm from '@/components/customers/CustomerCreateForm'

export default function CustomerCreatePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create Customer</h1>
      <CustomerCreateForm />
    </div>
  )
}
