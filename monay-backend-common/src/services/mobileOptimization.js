import db from '../models/index.js';
const { pool } = db;
import redis from '../config/redis';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

class MobileOptimization {
  constructor() {
    this.deviceProfiles = new Map();
    this.optimizationRules = new Map();
    this.cacheStrategy = new Map();
    this.initializeOptimizationProfiles();
  }

  initializeOptimizationProfiles() {
    this.deviceProfiles.set('ios', {
      push_provider: 'apns',
      biometric_types: ['face_id', 'touch_id'],
      wallet_integration: 'apple_wallet',
      payment_methods: ['apple_pay'],
      image_formats: ['heic', 'jpeg', 'png'],
      max_cache_size: 100 * 1024 * 1024,
      offline_storage: 'core_data',
      deep_link_prefix: 'monay://'
    });

    this.deviceProfiles.set('android', {
      push_provider: 'fcm',
      biometric_types: ['fingerprint', 'face_unlock'],
      wallet_integration: 'google_wallet',
      payment_methods: ['google_pay'],
      image_formats: ['webp', 'jpeg', 'png'],
      max_cache_size: 200 * 1024 * 1024,
      offline_storage: 'room',
      deep_link_prefix: 'monay://'
    });

    this.deviceProfiles.set('mobile_web', {
      push_provider: 'web_push',
      biometric_types: ['webauthn'],
      wallet_integration: 'pwa',
      payment_methods: ['web_payment_api'],
      image_formats: ['webp', 'jpeg', 'png'],
      max_cache_size: 50 * 1024 * 1024,
      offline_storage: 'indexeddb',
      deep_link_prefix: 'https://app.monay.com/'
    });
  }

  async registerDevice(deviceData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existingDevice = await client.query(`
        SELECT id FROM mobile_devices
        WHERE device_id = $1
      `, [deviceData.device_id]);

      let deviceRecord;

      if (existingDevice.rows.length > 0) {
        deviceRecord = await client.query(`
          UPDATE mobile_devices SET
            push_token = $1,
            platform = $2,
            os_version = $3,
            app_version = $4,
            device_model = $5,
            screen_resolution = $6,
            network_type = $7,
            carrier = $8,
            timezone = $9,
            language = $10,
            last_active = CURRENT_TIMESTAMP,
            capabilities = $11
          WHERE device_id = $12
          RETURNING *
        `, [
          deviceData.push_token,
          deviceData.platform,
          deviceData.os_version,
          deviceData.app_version,
          deviceData.device_model,
          deviceData.screen_resolution,
          deviceData.network_type,
          deviceData.carrier,
          deviceData.timezone,
          deviceData.language,
          JSON.stringify(deviceData.capabilities),
          deviceData.device_id
        ]);
      } else {
        deviceRecord = await client.query(`
          INSERT INTO mobile_devices (
            device_id, user_id, push_token, platform,
            os_version, app_version, device_model,
            screen_resolution, network_type, carrier,
            timezone, language, capabilities
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `, [
          deviceData.device_id,
          deviceData.user_id,
          deviceData.push_token,
          deviceData.platform,
          deviceData.os_version,
          deviceData.app_version,
          deviceData.device_model,
          deviceData.screen_resolution,
          deviceData.network_type,
          deviceData.carrier,
          deviceData.timezone,
          deviceData.language,
          JSON.stringify(deviceData.capabilities)
        ]);
      }

      await client.query(`
        INSERT INTO device_sessions (
          device_id, session_token, ip_address,
          user_agent, started_at, expires_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
      `, [
        deviceData.device_id,
        uuidv4(),
        deviceData.ip_address,
        deviceData.user_agent
      ]);

      await client.query('COMMIT');

      await redis.setex(
        `device:${deviceData.device_id}`,
        86400,
        JSON.stringify(deviceRecord.rows[0])
      );

      return deviceRecord.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async optimizeAPIResponse(data, deviceId) {
    const device = await this.getDeviceProfile(deviceId);

    if (!device) {
      return data;
    }

    const optimized = {
      ...data,
      _optimized: true,
      _device_id: deviceId
    };

    if (device.network_type === '2g' || device.network_type === '3g') {
      optimized.images = await this.compressImages(data.images, 'low');
      optimized.pagination_size = 10;
      optimized.prefetch_enabled = false;
    } else if (device.network_type === '4g') {
      optimized.images = await this.compressImages(data.images, 'medium');
      optimized.pagination_size = 20;
      optimized.prefetch_enabled = true;
    } else {
      optimized.images = await this.compressImages(data.images, 'high');
      optimized.pagination_size = 50;
      optimized.prefetch_enabled = true;
    }

    if (device.screen_resolution) {
      const [width, height] = device.screen_resolution.split('x').map(Number);
      optimized.layout = this.getOptimalLayout(width, height);
    }

    const cacheKey = `api_cache:${deviceId}:${this.generateCacheKey(data)}`;
    await redis.setex(cacheKey, 300, JSON.stringify(optimized));

    return optimized;
  }

  async compressImages(images, quality) {
    if (!images || images.length === 0) return images;

    const qualitySettings = {
      low: { width: 320, quality: 60 },
      medium: { width: 768, quality: 75 },
      high: { width: 1920, quality: 90 }
    };

    const settings = qualitySettings[quality];
    const compressed = [];

    for (const image of images) {
      if (typeof image === 'string' && image.startsWith('data:image')) {
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        const compressedBuffer = await sharp(buffer)
          .resize(settings.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: settings.quality })
          .toBuffer();

        compressed.push(`data:image/jpeg;base64,${compressedBuffer.toString('base64')}`);
      } else {
        compressed.push(image);
      }
    }

    return compressed;
  }

  getOptimalLayout(width, height) {
    const aspectRatio = width / height;
    const isTablet = width >= 768;
    const isPhone = width < 768;

    return {
      columns: isTablet ? 3 : 1,
      card_layout: isTablet ? 'grid' : 'stack',
      navigation: isTablet ? 'sidebar' : 'bottom_tabs',
      font_size: isPhone ? 'small' : 'medium',
      spacing: isPhone ? 'compact' : 'comfortable',
      show_images: width >= 320,
      aspect_ratio: aspectRatio
    };
  }

  async sendPushNotification(userId, notification) {
    const devices = await pool.query(`
      SELECT * FROM mobile_devices
      WHERE user_id = $1 AND push_enabled = true
    `, [userId]);

    const results = [];

    for (const device of devices.rows) {
      const profile = this.deviceProfiles.get(device.platform);

      if (!profile) continue;

      const payload = this.buildPushPayload(notification, device);

      try {
        let result;

        switch (profile.push_provider) {
          case 'apns':
            result = await this.sendAPNS(device.push_token, payload);
            break;
          case 'fcm':
            result = await this.sendFCM(device.push_token, payload);
            break;
          case 'web_push':
            result = await this.sendWebPush(device.push_token, payload);
            break;
        }

        results.push({
          device_id: device.device_id,
          status: 'sent',
          provider: profile.push_provider,
          result
        });

        await pool.query(`
          INSERT INTO push_notifications (
            user_id, device_id, title, body,
            data, status, sent_at
          ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        `, [
          userId,
          device.device_id,
          notification.title,
          notification.body,
          JSON.stringify(notification.data),
          'sent'
        ]);
      } catch (error) {
        results.push({
          device_id: device.device_id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }

  buildPushPayload(notification, device) {
    const basePayload = {
      title: notification.title,
      body: notification.body,
      badge: notification.badge || 1,
      sound: notification.sound || 'default',
      data: notification.data || {}
    };

    if (device.platform === 'ios') {
      return {
        aps: {
          alert: {
            title: basePayload.title,
            body: basePayload.body
          },
          badge: basePayload.badge,
          sound: basePayload.sound,
          'content-available': 1,
          'mutable-content': 1
        },
        data: basePayload.data
      };
    } else if (device.platform === 'android') {
      return {
        notification: {
          title: basePayload.title,
          body: basePayload.body,
          icon: 'ic_notification',
          color: '#4A90E2'
        },
        data: basePayload.data,
        priority: 'high',
        time_to_live: 86400
      };
    } else {
      return basePayload;
    }
  }

  async enableBiometricAuth(userId, deviceId, biometricData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const publicKey = await this.generateBiometricKey(biometricData);

      await client.query(`
        INSERT INTO biometric_credentials (
          user_id, device_id, public_key, biometric_type,
          enrollment_data, is_active
        ) VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (user_id, device_id)
        DO UPDATE SET
          public_key = EXCLUDED.public_key,
          biometric_type = EXCLUDED.biometric_type,
          enrollment_data = EXCLUDED.enrollment_data,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId,
        deviceId,
        publicKey,
        biometricData.type,
        JSON.stringify(biometricData.enrollment)
      ]);

      await client.query(`
        UPDATE mobile_devices
        SET biometric_enabled = true
        WHERE device_id = $1
      `, [deviceId]);

      await client.query('COMMIT');

      return {
        success: true,
        public_key: publicKey,
        biometric_type: biometricData.type
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async generateBiometricKey(biometricData) {
    // Use imported crypto
    const key = crypto.randomBytes(32).toString('base64');
    return key;
  }

  async verifyBiometric(userId, deviceId, signature) {
    const credential = await pool.query(`
      SELECT * FROM biometric_credentials
      WHERE user_id = $1 AND device_id = $2 AND is_active = true
    `, [userId, deviceId]);

    if (credential.rows.length === 0) {
      throw new Error('Biometric not enrolled');
    }

    const isValid = await this.verifyBiometricSignature(
      signature,
      credential.rows[0].public_key
    );

    if (isValid) {
      await pool.query(`
        INSERT INTO biometric_auth_logs (
          user_id, device_id, status, authenticated_at
        ) VALUES ($1, $2, 'success', CURRENT_TIMESTAMP)
      `, [userId, deviceId]);

      const sessionToken = uuidv4();
      await redis.setex(
        `biometric_session:${sessionToken}`,
        3600,
        JSON.stringify({ userId, deviceId })
      );

      return {
        authenticated: true,
        session_token: sessionToken
      };
    } else {
      await pool.query(`
        INSERT INTO biometric_auth_logs (
          user_id, device_id, status, authenticated_at
        ) VALUES ($1, $2, 'failed', CURRENT_TIMESTAMP)
      `, [userId, deviceId]);

      throw new Error('Biometric verification failed');
    }
  }

  async verifyBiometricSignature(signature, publicKey) {
    return signature && publicKey && signature.length > 0;
  }

  async syncOfflineData(deviceId, offlineData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const syncId = uuidv4();
      const conflicts = [];
      const synced = [];

      await client.query(`
        INSERT INTO offline_sync_logs (
          sync_id, device_id, started_at, data_count
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
      `, [syncId, deviceId, offlineData.length]);

      for (const item of offlineData) {
        try {
          const serverVersion = await this.getServerVersion(item.entity_type, item.entity_id);

          if (serverVersion && serverVersion.updated_at > item.client_updated_at) {
            conflicts.push({
              entity_id: item.entity_id,
              entity_type: item.entity_type,
              client_version: item.version,
              server_version: serverVersion.version,
              resolution_strategy: 'server_wins'
            });
          } else {
            await this.applyOfflineChange(client, item);
            synced.push({
              entity_id: item.entity_id,
              entity_type: item.entity_type,
              status: 'synced'
            });
          }
        } catch (error) {
          conflicts.push({
            entity_id: item.entity_id,
            entity_type: item.entity_type,
            error: error.message
          });
        }
      }

      await client.query(`
        UPDATE offline_sync_logs
        SET
          completed_at = CURRENT_TIMESTAMP,
          synced_count = $1,
          conflict_count = $2,
          status = 'completed'
        WHERE sync_id = $3
      `, [synced.length, conflicts.length, syncId]);

      await client.query('COMMIT');

      return {
        sync_id: syncId,
        synced: synced,
        conflicts: conflicts,
        timestamp: new Date()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getServerVersion(entityType, entityId) {
    const tables = {
      'wallet': 'wallets',
      'transaction': 'transactions',
      'benefit': 'government_benefits',
      'card': 'cards'
    };

    const table = tables[entityType];
    if (!table) return null;

    const result = await pool.query(`
      SELECT id, updated_at, version
      FROM ${table}
      WHERE id = $1
    `, [entityId]);

    return result.rows[0] || null;
  }

  async applyOfflineChange(client, change) {
    switch (change.operation) {
      case 'create':
        await this.createEntity(client, change);
        break;
      case 'update':
        await this.updateEntity(client, change);
        break;
      case 'delete':
        await this.deleteEntity(client, change);
        break;
    }
  }

  async optimizeBenefitInterface(benefitData, deviceProfile) {
    const optimized = {
      ...benefitData,
      ui_components: []
    };

    if (deviceProfile.platform === 'ios') {
      optimized.ui_components = [
        {
          type: 'card',
          style: 'ios_native',
          corner_radius: 12,
          shadow: { x: 0, y: 2, blur: 10, color: 'rgba(0,0,0,0.1)' }
        },
        {
          type: 'button',
          style: 'ios_system',
          haptic_feedback: true
        }
      ];
      optimized.animations = {
        transition: 'slide',
        duration: 0.3
      };
    } else if (deviceProfile.platform === 'android') {
      optimized.ui_components = [
        {
          type: 'card',
          style: 'material_design',
          elevation: 4,
          corner_radius: 8
        },
        {
          type: 'button',
          style: 'material',
          ripple_effect: true
        }
      ];
      optimized.animations = {
        transition: 'fade',
        duration: 0.25
      };
    }

    optimized.quick_actions = await this.getQuickActions(benefitData.program_type, deviceProfile);
    optimized.widgets = await this.generateWidgets(benefitData, deviceProfile);

    return optimized;
  }

  async getQuickActions(programType, deviceProfile) {
    const baseActions = [
      {
        id: 'check_balance',
        title: 'Check Balance',
        icon: 'wallet',
        shortcut_enabled: true
      },
      {
        id: 'recent_transactions',
        title: 'Recent Transactions',
        icon: 'list',
        shortcut_enabled: true
      },
      {
        id: 'find_locations',
        title: 'Find Locations',
        icon: 'map',
        shortcut_enabled: true
      }
    ];

    if (deviceProfile.platform === 'ios') {
      baseActions.forEach(action => {
        action.three_d_touch = true;
        action.siri_shortcut = `Check ${programType} ${action.title}`;
      });
    } else if (deviceProfile.platform === 'android') {
      baseActions.forEach(action => {
        action.app_shortcut = true;
        action.assistant_action = `${programType}_${action.id}`;
      });
    }

    return baseActions;
  }

  async generateWidgets(benefitData, deviceProfile) {
    const widgets = [];

    if (deviceProfile.platform === 'ios') {
      widgets.push({
        type: 'ios_widget',
        family: ['small', 'medium', 'large'],
        refresh_interval: 3600,
        data: {
          balance: benefitData.current_balance,
          program: benefitData.program_type,
          last_transaction: benefitData.last_transaction
        }
      });
    } else if (deviceProfile.platform === 'android') {
      widgets.push({
        type: 'android_widget',
        sizes: ['2x2', '4x2', '4x4'],
        update_period: 3600000,
        data: {
          balance: benefitData.current_balance,
          program: benefitData.program_type,
          last_transaction: benefitData.last_transaction
        }
      });
    }

    return widgets;
  }

  async enableDigitalWallet(userId, deviceId, walletType) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const cards = await client.query(`
        SELECT * FROM cards
        WHERE user_id = $1 AND card_status = 'active'
      `, [userId]);

      const provisionedCards = [];

      for (const card of cards.rows) {
        const provisioningData = await this.generateProvisioningData(card, walletType);

        const result = await client.query(`
          INSERT INTO digital_wallet_provisions (
            card_id, user_id, device_id, wallet_type,
            provisioning_data, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending')
          RETURNING *
        `, [
          card.id,
          userId,
          deviceId,
          walletType,
          JSON.stringify(provisioningData)
        ]);

        provisionedCards.push(result.rows[0]);
      }

      await client.query('COMMIT');

      return {
        success: true,
        provisioned_cards: provisionedCards,
        wallet_type: walletType
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async generateProvisioningData(card, walletType) {
    const baseData = {
      card_number_suffix: card.card_number.slice(-4),
      cardholder_name: card.cardholder_name,
      expiry_date: card.expiry_date,
      card_type: card.card_type
    };

    if (walletType === 'apple_wallet') {
      return {
        ...baseData,
        activation_data: this.generateAppleWalletActivation(card),
        pass_type_identifier: 'pass.com.monay.card',
        team_identifier: 'MONAY123'
      };
    } else if (walletType === 'google_wallet') {
      return {
        ...baseData,
        activation_data: this.generateGoogleWalletActivation(card),
        issuer_id: 'monay_issuer',
        class_id: 'monay_card_class'
      };
    }

    return baseData;
  }

  generateAppleWalletActivation(card) {
    return {
      activation_code: uuidv4(),
      otp_required: true,
      terms_accepted: false
    };
  }

  generateGoogleWalletActivation(card) {
    return {
      token_reference_id: uuidv4(),
      verification_required: true,
      terms_version: '1.0'
    };
  }

  async trackMobileAnalytics(eventData) {
    await pool.query(`
      INSERT INTO mobile_analytics (
        device_id, user_id, event_type, event_name,
        event_data, session_id, screen_name,
        duration_ms, network_type, battery_level,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
    `, [
      eventData.device_id,
      eventData.user_id,
      eventData.event_type,
      eventData.event_name,
      JSON.stringify(eventData.event_data),
      eventData.session_id,
      eventData.screen_name,
      eventData.duration_ms,
      eventData.network_type,
      eventData.battery_level
    ]);

    await this.processAnalyticsRealTime(eventData);
  }

  async processAnalyticsRealTime(eventData) {
    const metricsKey = `metrics:${eventData.user_id}:${new Date().toISOString().split('T')[0]}`;

    await redis.hincrby(metricsKey, 'total_events', 1);
    await redis.hincrby(metricsKey, `event_${eventData.event_name}`, 1);

    if (eventData.duration_ms) {
      await redis.hincrby(metricsKey, 'total_duration_ms', eventData.duration_ms);
    }

    await redis.expire(metricsKey, 86400 * 7);
  }

  async getDeviceProfile(deviceId) {
    const cached = await redis.get(`device:${deviceId}`);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await pool.query(`
      SELECT * FROM mobile_devices
      WHERE device_id = $1
    `, [deviceId]);

    if (result.rows.length > 0) {
      await redis.setex(
        `device:${deviceId}`,
        3600,
        JSON.stringify(result.rows[0])
      );
      return result.rows[0];
    }

    return null;
  }

  generateCacheKey(data) {
    // Use imported crypto
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  async performAppUpdate(deviceId, updateData) {
    const device = await this.getDeviceProfile(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    const updateInfo = {
      current_version: device.app_version,
      target_version: updateData.version,
      update_type: this.determineUpdateType(device.app_version, updateData.version),
      download_url: updateData.download_url,
      release_notes: updateData.release_notes,
      mandatory: updateData.mandatory || false
    };

    await pool.query(`
      INSERT INTO app_updates (
        device_id, current_version, target_version,
        update_type, status, created_at
      ) VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
    `, [
      deviceId,
      updateInfo.current_version,
      updateInfo.target_version,
      updateInfo.update_type
    ]);

    if (device.platform === 'ios' || device.platform === 'android') {
      await this.sendPushNotification(device.user_id, {
        title: 'App Update Available',
        body: `Version ${updateInfo.target_version} is now available`,
        data: updateInfo
      });
    }

    return updateInfo;
  }

  determineUpdateType(currentVersion, targetVersion) {
    const current = currentVersion.split('.').map(Number);
    const target = targetVersion.split('.').map(Number);

    if (target[0] > current[0]) return 'major';
    if (target[1] > current[1]) return 'minor';
    if (target[2] > current[2]) return 'patch';

    return 'none';
  }

  async sendAPNS(token, payload) {
    console.log('Sending APNS notification to:', token);
    return { success: true, message_id: uuidv4() };
  }

  async sendFCM(token, payload) {
    console.log('Sending FCM notification to:', token);
    return { success: true, message_id: uuidv4() };
  }

  async sendWebPush(subscription, payload) {
    console.log('Sending Web Push notification');
    return { success: true, message_id: uuidv4() };
  }

  async createEntity(client, change) {
    console.log('Creating entity:', change.entity_type);
  }

  async updateEntity(client, change) {
    console.log('Updating entity:', change.entity_type);
  }

  async deleteEntity(client, change) {
    console.log('Deleting entity:', change.entity_type);
  }
}

export default new MobileOptimization();