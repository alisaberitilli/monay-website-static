const EventEmitter = require('events');
const { Pool } = require('pg');
const crypto = require('crypto');

class MachineLearningModelsService extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Model types
    this.modelTypes = {
      FRAUD: 'fraud_detection',
      CHURN: 'churn_prediction',
      CLV: 'customer_lifetime_value',
      CREDIT: 'credit_risk_assessment',
      CATEGORY: 'transaction_categorization',
      MERCHANT: 'merchant_risk_scoring',
      RECOMMENDATION: 'recommendation_engine',
      ANOMALY: 'anomaly_detection'
    };

    // Model algorithms
    this.algorithms = {
      RANDOM_FOREST: 'random_forest',
      GRADIENT_BOOST: 'gradient_boosting',
      NEURAL_NETWORK: 'neural_network',
      LOGISTIC_REGRESSION: 'logistic_regression',
      SVM: 'support_vector_machine',
      XGBOOST: 'xgboost',
      LSTM: 'lstm_network',
      ISOLATION_FOREST: 'isolation_forest'
    };
  }

  /**
   * Train fraud detection model
   */
  async trainFraudDetectionModel(trainingConfig = {}) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Prepare training dataset
      const dataset = await this.prepareFraudDataset(client);

      // Simulate model training (in production, use actual ML library)
      const modelMetrics = await this.simulateModelTraining(
        this.modelTypes.FRAUD,
        dataset,
        trainingConfig
      );

      // Register model
      const modelId = await this.registerModel({
        modelName: `fraud_model_${Date.now()}`,
        modelType: this.modelTypes.FRAUD,
        algorithm: trainingConfig.algorithm || this.algorithms.RANDOM_FOREST,
        version: '1.0.0',
        metrics: modelMetrics,
        hyperparameters: trainingConfig.hyperparameters || this.getDefaultHyperparameters('fraud'),
        status: 'training'
      }, client);

      // Train feature importance
      const featureImportance = await this.calculateFeatureImportance(dataset, modelMetrics);

      // Update model with feature importance
      await client.query(
        `UPDATE ml_models
         SET feature_importance = $1,
             status = 'active',
             deployment_date = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify(featureImportance), modelId]
      );

      await client.query('COMMIT');

      this.emit('modelTrained', {
        modelId,
        type: this.modelTypes.FRAUD,
        metrics: modelMetrics
      });

      return {
        success: true,
        modelId,
        metrics: modelMetrics,
        featureImportance
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error training fraud model:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Train churn prediction model
   */
  async trainChurnPredictionModel(trainingConfig = {}) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Prepare churn dataset
      const dataset = await this.prepareChurnDataset(client);

      // Simulate model training
      const modelMetrics = await this.simulateModelTraining(
        this.modelTypes.CHURN,
        dataset,
        trainingConfig
      );

      // Register model
      const modelId = await this.registerModel({
        modelName: `churn_model_${Date.now()}`,
        modelType: this.modelTypes.CHURN,
        algorithm: trainingConfig.algorithm || this.algorithms.GRADIENT_BOOST,
        version: '1.0.0',
        metrics: modelMetrics,
        hyperparameters: trainingConfig.hyperparameters || this.getDefaultHyperparameters('churn'),
        status: 'active'
      }, client);

      // Calculate churn predictions for active users
      await this.calculateChurnPredictions(modelId, client);

      await client.query('COMMIT');

      this.emit('modelTrained', {
        modelId,
        type: this.modelTypes.CHURN,
        metrics: modelMetrics
      });

      return {
        success: true,
        modelId,
        metrics: modelMetrics
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error training churn model:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Train customer lifetime value model
   */
  async trainCLVModel(trainingConfig = {}) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Prepare CLV dataset
      const dataset = await this.prepareCLVDataset(client);

      // Simulate model training
      const modelMetrics = await this.simulateModelTraining(
        this.modelTypes.CLV,
        dataset,
        trainingConfig
      );

      // Register model
      const modelId = await this.registerModel({
        modelName: `clv_model_${Date.now()}`,
        modelType: this.modelTypes.CLV,
        algorithm: trainingConfig.algorithm || this.algorithms.NEURAL_NETWORK,
        version: '1.0.0',
        metrics: modelMetrics,
        hyperparameters: trainingConfig.hyperparameters || this.getDefaultHyperparameters('clv'),
        status: 'active'
      }, client);

      // Calculate CLV for all customers
      await this.calculateCustomerLTV(modelId, client);

      await client.query('COMMIT');

      return {
        success: true,
        modelId,
        metrics: modelMetrics
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error training CLV model:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Train credit risk assessment model
   */
  async trainCreditRiskModel(trainingConfig = {}) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Prepare credit risk dataset
      const dataset = await this.prepareCreditRiskDataset(client);

      // Simulate model training
      const modelMetrics = await this.simulateModelTraining(
        this.modelTypes.CREDIT,
        dataset,
        trainingConfig
      );

      // Register model
      const modelId = await this.registerModel({
        modelName: `credit_risk_model_${Date.now()}`,
        modelType: this.modelTypes.CREDIT,
        algorithm: trainingConfig.algorithm || this.algorithms.XGBOOST,
        version: '1.0.0',
        metrics: modelMetrics,
        hyperparameters: trainingConfig.hyperparameters || this.getDefaultHyperparameters('credit'),
        status: 'active'
      }, client);

      await client.query('COMMIT');

      return {
        success: true,
        modelId,
        metrics: modelMetrics
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error training credit risk model:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Prepare fraud detection dataset
   */
  async prepareFraudDataset(client) {
    const query = `
      WITH transaction_features AS (
        SELECT
          t.id,
          t.amount,
          EXTRACT(HOUR FROM t.created_at) as hour,
          EXTRACT(DOW FROM t.created_at) as day_of_week,
          CASE WHEN EXTRACT(DOW FROM t.created_at) IN (0, 6) THEN 1 ELSE 0 END as is_weekend,
          LAG(t.amount) OVER (PARTITION BY t.user_id ORDER BY t.created_at) as prev_amount,
          COUNT(*) OVER (PARTITION BY t.user_id
                        ORDER BY t.created_at
                        RANGE BETWEEN INTERVAL '1 hour' PRECEDING AND CURRENT ROW) as hourly_count,
          AVG(t.amount) OVER (PARTITION BY t.user_id
                              ORDER BY t.created_at
                              ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING) as avg_amount_30,
          STDDEV(t.amount) OVER (PARTITION BY t.user_id
                                ORDER BY t.created_at
                                ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING) as std_amount_30,
          CASE WHEN f.risk_level IN ('high', 'critical') THEN 1 ELSE 0 END as is_fraud
        FROM transactions t
        LEFT JOIN fraud_detection_scores f ON t.id = f.transaction_id
        WHERE t.created_at > NOW() - INTERVAL '180 days'
        LIMIT 100000
      )
      SELECT * FROM transaction_features
      WHERE avg_amount_30 IS NOT NULL
    `;

    const result = await client.query(query);
    return {
      features: ['amount', 'hour', 'day_of_week', 'is_weekend', 'prev_amount', 'hourly_count', 'avg_amount_30', 'std_amount_30'],
      target: 'is_fraud',
      data: result.rows,
      rowCount: result.rows.length
    };
  }

  /**
   * Prepare churn dataset
   */
  async prepareChurnDataset(client) {
    const query = `
      WITH user_activity AS (
        SELECT
          u.id as user_id,
          COUNT(t.id) as transaction_count,
          COALESCE(SUM(t.amount), 0) as total_spent,
          COALESCE(AVG(t.amount), 0) as avg_transaction,
          MAX(t.created_at) as last_transaction,
          EXTRACT(DAY FROM NOW() - MAX(t.created_at)) as days_since_last,
          COUNT(DISTINCT DATE_TRUNC('day', t.created_at)) as active_days,
          COUNT(DISTINCT DATE_TRUNC('month', t.created_at)) as active_months,
          CASE
            WHEN MAX(t.created_at) < NOW() - INTERVAL '30 days' THEN 1
            ELSE 0
          END as churned
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        WHERE u.created_at < NOW() - INTERVAL '60 days'
        GROUP BY u.id
        LIMIT 50000
      )
      SELECT * FROM user_activity
    `;

    const result = await client.query(query);
    return {
      features: ['transaction_count', 'total_spent', 'avg_transaction', 'days_since_last', 'active_days', 'active_months'],
      target: 'churned',
      data: result.rows,
      rowCount: result.rows.length
    };
  }

  /**
   * Prepare CLV dataset
   */
  async prepareCLVDataset(client) {
    const query = `
      WITH customer_metrics AS (
        SELECT
          u.id as user_id,
          EXTRACT(DAY FROM NOW() - u.created_at) as customer_age_days,
          COUNT(t.id) as total_transactions,
          COALESCE(SUM(t.amount), 0) as total_revenue,
          COALESCE(AVG(t.amount), 0) as avg_transaction_value,
          COALESCE(MAX(t.amount), 0) as max_transaction,
          COUNT(DISTINCT DATE_TRUNC('month', t.created_at)) as active_months,
          COALESCE(
            SUM(t.amount) / NULLIF(EXTRACT(DAY FROM NOW() - MIN(t.created_at)), 0),
            0
          ) as daily_revenue_rate
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        WHERE u.created_at < NOW() - INTERVAL '30 days'
        GROUP BY u.id
        LIMIT 50000
      )
      SELECT *,
             total_revenue * 12 as projected_annual_value
      FROM customer_metrics
    `;

    const result = await client.query(query);
    return {
      features: ['customer_age_days', 'total_transactions', 'avg_transaction_value', 'max_transaction', 'active_months', 'daily_revenue_rate'],
      target: 'projected_annual_value',
      data: result.rows,
      rowCount: result.rows.length
    };
  }

  /**
   * Prepare credit risk dataset
   */
  async prepareCreditRiskDataset(client) {
    const query = `
      WITH credit_features AS (
        SELECT
          u.id as user_id,
          COALESCE(u.credit_score, 650) as credit_score,
          COALESCE(u.annual_income, 50000) as annual_income,
          EXTRACT(YEAR FROM AGE(u.date_of_birth)) as age,
          COUNT(t.id) as transaction_count,
          COALESCE(AVG(t.amount), 0) as avg_transaction,
          COALESCE(MAX(t.amount), 0) as max_transaction,
          COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_transactions,
          COUNT(CASE WHEN f.risk_level IN ('high', 'critical') THEN 1 END) as high_risk_count,
          CASE
            WHEN COUNT(CASE WHEN t.status = 'failed' THEN 1 END) > 5 THEN 1
            ELSE 0
          END as is_high_risk
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        LEFT JOIN fraud_detection_scores f ON t.id = f.transaction_id
        GROUP BY u.id, u.credit_score, u.annual_income, u.date_of_birth
        LIMIT 50000
      )
      SELECT * FROM credit_features
      WHERE age IS NOT NULL
    `;

    const result = await client.query(query);
    return {
      features: ['credit_score', 'annual_income', 'age', 'transaction_count', 'avg_transaction', 'max_transaction', 'failed_transactions', 'high_risk_count'],
      target: 'is_high_risk',
      data: result.rows,
      rowCount: result.rows.length
    };
  }

  /**
   * Simulate model training
   */
  async simulateModelTraining(modelType, dataset, config) {
    // In production, this would use actual ML libraries (TensorFlow.js, ML.js, etc.)
    // Simulated metrics for demonstration

    const baseMetrics = {
      fraud_detection: {
        accuracy: 0.945 + Math.random() * 0.04,
        precision: 0.923 + Math.random() * 0.05,
        recall: 0.891 + Math.random() * 0.08,
        f1Score: 0.907 + Math.random() * 0.06,
        aucRoc: 0.961 + Math.random() * 0.03
      },
      churn_prediction: {
        accuracy: 0.876 + Math.random() * 0.05,
        precision: 0.842 + Math.random() * 0.06,
        recall: 0.798 + Math.random() * 0.08,
        f1Score: 0.819 + Math.random() * 0.06,
        aucRoc: 0.893 + Math.random() * 0.04
      },
      customer_lifetime_value: {
        mse: 234.56 + Math.random() * 50,
        mae: 45.23 + Math.random() * 10,
        r2Score: 0.892 + Math.random() * 0.05,
        mape: 0.124 + Math.random() * 0.03
      },
      credit_risk_assessment: {
        accuracy: 0.913 + Math.random() * 0.04,
        precision: 0.897 + Math.random() * 0.05,
        recall: 0.871 + Math.random() * 0.06,
        f1Score: 0.884 + Math.random() * 0.05,
        aucRoc: 0.928 + Math.random() * 0.03
      }
    };

    const metrics = baseMetrics[modelType] || baseMetrics.fraud_detection;

    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      ...metrics,
      trainingRows: dataset.rowCount,
      trainingTime: Math.floor(1000 + Math.random() * 3000), // ms
      convergenceEpoch: Math.floor(50 + Math.random() * 100)
    };
  }

  /**
   * Register model in database
   */
  async registerModel(modelData, client) {
    const query = `
      INSERT INTO ml_models (
        id, model_name, model_type, version,
        algorithm, training_date,
        accuracy, precision_score, recall_score, f1_score, auc_roc,
        hyperparameters, training_dataset_info,
        status
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;

    const result = await client.query(query, [
      crypto.randomUUID(),
      modelData.modelName,
      modelData.modelType,
      modelData.version,
      modelData.algorithm,
      modelData.metrics.accuracy || null,
      modelData.metrics.precision || modelData.metrics.precision_score || null,
      modelData.metrics.recall || modelData.metrics.recall_score || null,
      modelData.metrics.f1Score || null,
      modelData.metrics.aucRoc || null,
      JSON.stringify(modelData.hyperparameters),
      JSON.stringify({
        rows: modelData.metrics.trainingRows,
        features: modelData.features
      }),
      modelData.status
    ]);

    return result.rows[0].id;
  }

  /**
   * Calculate feature importance
   */
  async calculateFeatureImportance(dataset, modelMetrics) {
    // Simulated feature importance (would use actual ML library in production)
    const features = dataset.features;
    const importance = {};

    features.forEach((feature, index) => {
      importance[feature] = Math.random() * 0.3 + (1 - index * 0.1);
    });

    // Normalize to sum to 1
    const sum = Object.values(importance).reduce((a, b) => a + b, 0);
    Object.keys(importance).forEach(key => {
      importance[key] = importance[key] / sum;
    });

    return importance;
  }

  /**
   * Calculate churn predictions
   */
  async calculateChurnPredictions(modelId, client) {
    // Get active users
    const usersQuery = `
      SELECT u.id,
             COUNT(t.id) as recent_transactions,
             MAX(t.created_at) as last_activity
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
        AND t.created_at > NOW() - INTERVAL '30 days'
      WHERE u.status = 'active'
      GROUP BY u.id
      LIMIT 1000
    `;

    const users = await client.query(usersQuery);

    for (const user of users.rows) {
      const churnProbability = this.predictChurn(user);

      await client.query(
        `INSERT INTO predictive_analytics (
          id, user_id, prediction_type,
          prediction_value, prediction_probability,
          confidence_score, prediction_horizon_days,
          prediction_date, model_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8)
        ON CONFLICT (user_id, prediction_date)
        WHERE prediction_type = 'churn'
        DO UPDATE SET
          prediction_probability = $5,
          model_id = $8`,
        [
          crypto.randomUUID(),
          user.id,
          'churn',
          churnProbability > 0.5 ? 1 : 0,
          churnProbability,
          0.85 + Math.random() * 0.1,
          30,
          modelId
        ]
      );
    }
  }

  /**
   * Predict churn probability
   */
  predictChurn(user) {
    // Simplified churn prediction
    let probability = 0.2;

    if (!user.last_activity) probability += 0.3;
    else {
      const daysSinceLastActivity = Math.floor(
        (new Date() - new Date(user.last_activity)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastActivity > 20) probability += 0.4;
      else if (daysSinceLastActivity > 10) probability += 0.2;
    }

    if (user.recent_transactions < 2) probability += 0.3;
    else if (user.recent_transactions < 5) probability += 0.1;

    return Math.min(1, probability);
  }

  /**
   * Calculate customer lifetime value
   */
  async calculateCustomerLTV(modelId, client) {
    const query = `
      WITH customer_history AS (
        SELECT u.id,
               COUNT(t.id) as total_transactions,
               COALESCE(SUM(t.amount), 0) as historical_value,
               COALESCE(AVG(t.amount), 0) as avg_transaction,
               MAX(t.created_at) as last_transaction
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        WHERE u.status = 'active'
        GROUP BY u.id
        LIMIT 1000
      )
      SELECT * FROM customer_history
    `;

    const customers = await client.query(query);

    for (const customer of customers.rows) {
      const ltv = this.predictLTV(customer);

      await client.query(
        `INSERT INTO customer_ltv_predictions (
          id, user_id,
          ltv_30_days, ltv_90_days, ltv_180_days,
          ltv_365_days, ltv_lifetime,
          confidence_level, customer_segment,
          value_tier, model_id, prediction_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE)
        ON CONFLICT (user_id, prediction_date) DO UPDATE SET
          ltv_30_days = $3,
          ltv_90_days = $4,
          ltv_180_days = $5,
          ltv_365_days = $6,
          ltv_lifetime = $7,
          model_id = $11`,
        [
          crypto.randomUUID(),
          customer.id,
          ltv.ltv30,
          ltv.ltv90,
          ltv.ltv180,
          ltv.ltv365,
          ltv.ltvLifetime,
          ltv.confidence,
          ltv.segment,
          ltv.tier,
          modelId
        ]
      );
    }
  }

  /**
   * Predict customer LTV
   */
  predictLTV(customer) {
    const avgMonthly = customer.avg_transaction * 10; // Assumed 10 transactions/month

    return {
      ltv30: avgMonthly,
      ltv90: avgMonthly * 3 * 0.95, // Small decay
      ltv180: avgMonthly * 6 * 0.9,
      ltv365: avgMonthly * 12 * 0.85,
      ltvLifetime: avgMonthly * 36 * 0.75, // 3-year projection
      confidence: 0.75 + Math.random() * 0.2,
      segment: customer.total_transactions > 50 ? 'loyal' :
               customer.total_transactions > 10 ? 'regular' : 'new',
      tier: customer.historical_value > 10000 ? 'high' :
            customer.historical_value > 1000 ? 'medium' : 'low'
    };
  }

  /**
   * Get default hyperparameters
   */
  getDefaultHyperparameters(modelType) {
    const defaults = {
      fraud: {
        n_estimators: 100,
        max_depth: 10,
        min_samples_split: 20,
        min_samples_leaf: 10,
        max_features: 'sqrt',
        learning_rate: 0.1
      },
      churn: {
        n_estimators: 150,
        max_depth: 8,
        learning_rate: 0.05,
        subsample: 0.8,
        colsample_bytree: 0.8
      },
      clv: {
        hidden_layers: [128, 64, 32],
        activation: 'relu',
        optimizer: 'adam',
        learning_rate: 0.001,
        batch_size: 32,
        epochs: 100
      },
      credit: {
        n_estimators: 200,
        max_depth: 12,
        learning_rate: 0.03,
        gamma: 0.1,
        reg_alpha: 0.1,
        reg_lambda: 1.0
      }
    };

    return defaults[modelType] || defaults.fraud;
  }

  /**
   * Evaluate model performance
   */
  async evaluateModelPerformance(modelId) {
    const client = await this.pool.connect();

    try {
      // Get model details
      const modelQuery = `
        SELECT * FROM ml_models WHERE id = $1
      `;
      const modelResult = await client.query(modelQuery, [modelId]);

      if (modelResult.rows.length === 0) {
        throw new Error('Model not found');
      }

      const model = modelResult.rows[0];

      // Calculate performance metrics based on model type
      let performance = {};

      switch (model.model_type) {
        case this.modelTypes.FRAUD:
          performance = await this.evaluateFraudModel(modelId, client);
          break;
        case this.modelTypes.CHURN:
          performance = await this.evaluateChurnModel(modelId, client);
          break;
        case this.modelTypes.CLV:
          performance = await this.evaluateCLVModel(modelId, client);
          break;
        case this.modelTypes.CREDIT:
          performance = await this.evaluateCreditModel(modelId, client);
          break;
      }

      // Store performance metrics
      await this.storeModelPerformance(modelId, performance, client);

      return {
        success: true,
        modelId,
        modelType: model.model_type,
        performance
      };

    } catch (error) {
      console.error('Error evaluating model:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Evaluate fraud detection model
   */
  async evaluateFraudModel(modelId, client) {
    const query = `
      WITH predictions AS (
        SELECT
          f.risk_level,
          f.overall_risk_score,
          f.action_taken,
          f.true_fraud,
          f.false_positive
        FROM fraud_detection_scores f
        WHERE f.model_id = $1
        AND f.created_at > NOW() - INTERVAL '7 days'
      )
      SELECT
        COUNT(*) as total_predictions,
        COUNT(CASE WHEN action_taken = 'declined' AND true_fraud = true THEN 1 END) as true_positives,
        COUNT(CASE WHEN action_taken = 'declined' AND false_positive = true THEN 1 END) as false_positives,
        COUNT(CASE WHEN action_taken = 'approved' AND true_fraud = false THEN 1 END) as true_negatives,
        COUNT(CASE WHEN action_taken = 'approved' AND true_fraud = true THEN 1 END) as false_negatives,
        AVG(overall_risk_score) as avg_risk_score
      FROM predictions
    `;

    const result = await client.query(query, [modelId]);
    const metrics = result.rows[0];

    const tp = parseInt(metrics.true_positives);
    const fp = parseInt(metrics.false_positives);
    const tn = parseInt(metrics.true_negatives);
    const fn = parseInt(metrics.false_negatives);

    const accuracy = (tp + tn) / (tp + fp + tn + fn) || 0;
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      truePositives: tp,
      falsePositives: fp,
      trueNegatives: tn,
      falseNegatives: fn,
      totalPredictions: parseInt(metrics.total_predictions)
    };
  }

  /**
   * Evaluate churn prediction model
   */
  async evaluateChurnModel(modelId, client) {
    const query = `
      WITH predictions AS (
        SELECT
          p.user_id,
          p.prediction_value,
          CASE
            WHEN u.last_login < NOW() - INTERVAL '30 days' THEN 1
            ELSE 0
          END as actual_churned
        FROM predictive_analytics p
        JOIN users u ON p.user_id = u.id
        WHERE p.model_id = $1
        AND p.prediction_type = 'churn'
        AND p.prediction_date > NOW() - INTERVAL '30 days'
      )
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN prediction_value = 1 AND actual_churned = 1 THEN 1 END) as true_positives,
        COUNT(CASE WHEN prediction_value = 1 AND actual_churned = 0 THEN 1 END) as false_positives,
        COUNT(CASE WHEN prediction_value = 0 AND actual_churned = 0 THEN 1 END) as true_negatives,
        COUNT(CASE WHEN prediction_value = 0 AND actual_churned = 1 THEN 1 END) as false_negatives
      FROM predictions
    `;

    const result = await client.query(query, [modelId]);
    const metrics = result.rows[0];

    const tp = parseInt(metrics.true_positives);
    const fp = parseInt(metrics.false_positives);
    const tn = parseInt(metrics.true_negatives);
    const fn = parseInt(metrics.false_negatives);

    return {
      accuracy: (tp + tn) / (tp + fp + tn + fn) || 0,
      precision: tp / (tp + fp) || 0,
      recall: tp / (tp + fn) || 0,
      f1Score: 2 * ((tp / (tp + fp)) * (tp / (tp + fn))) / ((tp / (tp + fp)) + (tp / (tp + fn))) || 0
    };
  }

  /**
   * Evaluate CLV model
   */
  async evaluateCLVModel(modelId, client) {
    const query = `
      WITH predictions AS (
        SELECT
          c.user_id,
          c.ltv_30_days as predicted,
          COALESCE(SUM(t.amount), 0) as actual
        FROM customer_ltv_predictions c
        LEFT JOIN transactions t ON c.user_id = t.user_id
          AND t.created_at BETWEEN c.created_at AND c.created_at + INTERVAL '30 days'
        WHERE c.model_id = $1
        AND c.created_at < NOW() - INTERVAL '30 days'
        GROUP BY c.user_id, c.ltv_30_days
      )
      SELECT
        AVG(ABS(predicted - actual)) as mae,
        AVG(POWER(predicted - actual, 2)) as mse,
        STDDEV(predicted - actual) as std_error
      FROM predictions
    `;

    const result = await client.query(query, [modelId]);

    return {
      mae: result.rows[0].mae || 0,
      mse: result.rows[0].mse || 0,
      rmse: Math.sqrt(result.rows[0].mse || 0),
      stdError: result.rows[0].std_error || 0
    };
  }

  /**
   * Evaluate credit risk model
   */
  async evaluateCreditModel(modelId, client) {
    // Similar to fraud model evaluation
    return await this.evaluateFraudModel(modelId, client);
  }

  /**
   * Store model performance metrics
   */
  async storeModelPerformance(modelId, performance, client) {
    const query = `
      INSERT INTO ml_model_performance (
        id, model_id, evaluation_date,
        accuracy, precision_score, recall_score, f1_score,
        true_positives, false_positives,
        true_negatives, false_negatives,
        metadata
      ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (model_id, evaluation_date) DO UPDATE SET
        accuracy = $3,
        precision_score = $4,
        recall_score = $5,
        f1_score = $6
    `;

    await client.query(query, [
      crypto.randomUUID(),
      modelId,
      performance.accuracy || null,
      performance.precision || null,
      performance.recall || null,
      performance.f1Score || null,
      performance.truePositives || null,
      performance.falsePositives || null,
      performance.trueNegatives || null,
      performance.falseNegatives || null,
      JSON.stringify(performance)
    ]);
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default MachineLearningModelsService;