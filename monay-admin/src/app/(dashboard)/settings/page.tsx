'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Bell, Globe, Lock, Upload, Save, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Shield className="w-4 h-4" />
              Security
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Globe className="w-4 h-4" />
              Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Update your profile photo</p>
                    <Button variant="outline" size="sm" className="mt-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <div className="mt-1 p-2 border rounded text-sm">Admin</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <div className="mt-1 p-2 border rounded text-sm">User</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="mt-1 p-2 border rounded text-sm">admin@monay.com</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <div className="mt-1 p-2 border rounded text-sm">+1 (555) 123-4567</div>
                  </div>
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enhance your account security with 2FA
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Update your account password
                  </p>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Login Sessions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage active sessions across devices
                  </p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for other settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Additional Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <SettingsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Settings Panel</h3>
                <p className="text-gray-500 mb-4">
                  This page is being migrated to Shadcn/UI components. Full functionality coming soon.
                </p>
                <Button variant="outline" className="flex items-center gap-2 mx-auto">
                  <SettingsIcon className="w-4 h-4" />
                  View Migration Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}