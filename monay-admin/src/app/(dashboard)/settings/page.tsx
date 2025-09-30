'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, Shield, Bell, Globe, Lock, Upload, Save, Settings as SettingsIcon, LogOut, Monitor, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@monay.com',
    phone: '+1 (555) 123-4567'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock sessions data
  const sessions = [
    { id: 1, device: 'Chrome on MacOS', location: 'San Francisco, CA', lastActive: '5 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
  ];

  // Handler functions
  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Your profile information has been saved successfully.');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Your password has been updated successfully.');
      setIsPasswordModalOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAEnable = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Please follow the instructions to complete 2FA setup.');
      // In a real app, would show QR code and verification steps
      setIs2FAModalOpen(true);
    } catch (error) {
      toast.error('Failed to enable 2FA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionTerminate = async (sessionId: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('The selected session has been terminated.');
    } catch (error) {
      toast.error('Failed to terminate session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Your data export has been initiated. You will receive an email when it\'s ready.');
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    // In a real app, would open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success('Your profile photo has been updated.');
        } catch (error) {
          toast.error('Failed to upload photo.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    input.click();
  };

  const handleNotificationPreferences = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Your notification preferences have been updated.');
    } catch (error) {
      toast.error('Failed to save preferences.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              variant={activeTab === 'security' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('security')}
            >
              <Shield className="w-4 h-4" />
              Security
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <Button
              variant={activeTab === 'preferences' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('preferences')}
            >
              <Globe className="w-4 h-4" />
              Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 flex items-center gap-2"
                        onClick={handlePhotoUpload}
                        disabled={isLoading}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button
                    className="flex items-center gap-2"
                    onClick={handleProfileSave}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
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
                    <Button
                      variant="outline"
                      onClick={handle2FAEnable}
                      disabled={isLoading}
                    >
                      Enable 2FA
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Update your account password
                    </p>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
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
                    <Button
                      variant="outline"
                      onClick={() => setIsSessionsModalOpen(true)}
                    >
                      View Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Text message alerts</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleNotificationPreferences} disabled={isLoading}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Language</h4>
                    <select className="w-full p-2 border rounded">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Timezone</h4>
                    <select className="w-full p-2 border rounded">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                    </select>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Currency Display</h4>
                    <select className="w-full p-2 border rounded">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Data & Privacy</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download a copy of your data
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleDataExport}
                      disabled={isLoading}
                    >
                      Download Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app to enable 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-100 p-8 rounded flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">QR Code would appear here</p>
              </div>
            </div>
            <div className="mt-4">
              <Label>Verification Code</Label>
              <Input placeholder="Enter 6-digit code" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIs2FAModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Two-factor authentication has been enabled for your account.');
              setIs2FAModalOpen(false);
            }}>
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions Modal */}
      <Dialog open={isSessionsModalOpen} onOpenChange={setIsSessionsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              These devices are currently logged into your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-3">
                  {session.device.includes('iPhone') ? (
                    <Smartphone className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Monitor className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.current && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSessionTerminate(session.id)}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}