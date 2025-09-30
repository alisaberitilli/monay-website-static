import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import methodOverride from 'method-override';
import helmet from 'helmet';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import routes from './routes/index.js';
import models from './models/index.js';
import config from './config/index.js';
import loggers from './services/logger.js';
import appVersionMiddleware from './middleware-app/app-version-middleware.js';
import path from 'path';
import scheduleJob from './services/schedule-job.js';
import schedule from 'node-schedule';
import invoiceWalletSocket from './services/invoice-wallet-socket.js';
import enterpriseWalletSocket from './services/enterprise-wallet-socket.js';
import databaseSafety from './services/database-safety.js';
/**
 * Application startup class
 *
 * @export
 * @class Bootstrap
 */
export default class Bootstrap {
    /**
     * Creates an instance of Bootstrap.
     * @param {object} app
     *
     * @memberOf Bootstrap
     */
    constructor(app) {
        this.app = app;
        this.middleware();
        this.connectDb();
        this.routes();
        this.start();
    }

    /**
     * Load all middleware
     * @memberOf Bootstrap
     */
    middleware() {
        const { app } = this;
        const swaggerDefinition = {
            info: {
                title: 'REST API for Monay Application',
                version: '1.0.0',
                description: 'This is the REST API for Monay Application',
            },
            host: `${config.app.swaggerHost}`,
            basePath: '/api',
            securityDefinitions: {
                BearerAuth: {
                    type: 'apiKey',
                    description: 'JWT authorization of an API',
                    name: 'Authorization',
                    in: 'header',
                },
            },
        };

        const options = {
            swaggerDefinition,
            apis: ['./api-docs/*.yaml'],
        };

        const swaggerSpec = swaggerJSDoc(options);
        app.use(cors({
            origin: function (origin, callback) {
                // Allow requests from localhost for development
                const allowedOrigins = [
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:3002',
                    'http://localhost:3003',
                    'http://localhost:3007',
                    `https://${config.app.swaggerHost}`
                ];

                // Allow requests with no origin (like mobile apps or Postman)
                if (!origin) return callback(null, true);

                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-bypass']
        }));
        app.use(bodyParser.json({ limit: '500mb', extended: true }));
        app.use(compression());
        app.use(methodOverride());
        // Configure helmet with custom CSP
        app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        imgSrc: ["'self'", "data:", "http://localhost:*", "https:"],
                        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        fontSrc: ["'self'", "data:"],
                        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
                        frameSrc: ["'self'"],
                        objectSrc: ["'none'"]
                    },
                },
                referrerPolicy: { policy: "no-referrer" },
                frameguard: { action: 'SAMEORIGIN' }
            })
        );
        if (config.app.environment == 'development' || config.app.environment == 'staging') {
            app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        }
        app.use('/assets', express.static(`${__dirname}/uploads`));
        app.use('/images', express.static(`${__dirname}/images`));
        app.use('/public', express.static(`${__dirname}/public`));
        app.use('/Monay', express.static(`${__dirname}/../Monay_IOS`));
        app.use('/MonayAndroid', express.static(`${__dirname}/../Monay_Android`));
        app.use(express.static(path.join(`${__dirname}/../build`)));

        // Serve favicon
        app.use('/favicon.ico', express.static(`${__dirname}/public/favicon.ico`));
        app.use('/favicon.svg', express.static(`${__dirname}/public/favicon.svg`));

        app.use((req, res, next) => {
            if (req.connection.encrypted == undefined) {
                config.app.setBaseUrl(`https://${req.headers.host}/`);
            } else {
                config.app.setBaseUrl(`https://${req.headers.host}/`);
            }
            next();
        });
        app.use('/api/', appVersionMiddleware)
    }

    /**
     * Check database connection
     * @memberOf Bootstrap
     */
    async connectDb() {
        const {
            sequelize
        } = models;

        // Initialize models first
        const initializedModels = await models.initializeModels();

        // Copy initialized models back to the models object
        Object.assign(models, initializedModels);

        // Ensure UserToken is available
        if (!models.UserToken) {
            console.warn('UserToken model not loaded, creating placeholder');
            models.UserToken = {
                findOne: () => null,
                create: () => null,
                destroy: () => null,
                update: () => null
            };
        }

        // Apply database safety middleware
        databaseSafety.createSafetyMiddleware(sequelize);

        // Test database connection without using Bluebird's .return()
        try {
            // Simple query to test connection
            await sequelize.query('SELECT 1+1 AS result', { type: models.sequelize.QueryTypes.SELECT });
            loggers.infoLogger.info('Database connected successfully');

            // Check database health
            const health = await databaseSafety.checkDatabaseHealth(sequelize);

            if (health.warnings.length > 0) {
                loggers.errorLogger.error('Database health warnings:');
                health.warnings.forEach(warning => {
                    loggers.errorLogger.error(` - ${warning}`);
                });
            }

            loggers.infoLogger.info(`Database has ${health.tableCount} tables`);
            loggers.infoLogger.info(`Critical tables present: ${health.criticalTables.length}/${health.criticalTables.length + health.missingTables.length}`);

            // NEVER sync with force in production
            // Use safeDatabaseSync if sync is ever needed
            // await databaseSafety.safeDatabaseSync(sequelize, { alter: true });

            loggers.infoLogger.info('Database sync skipped - using existing schema');
        } catch (error) {
            loggers.errorLogger.error('Database connection error %s', error);
        }
    }

    /**
     * Load all routes
     * @memberOf Bootstrap
     */
    routes() {
        routes(this.app);
    }

    /**
     * Start express server
     * @memberOf Bootstrap
     */
    start() {
        const {
            app
        } = this;
        const port = app.get('port');
        const server = app.listen(port, () => {
            console.log('Server has started on port %d', port);

            // Initialize Socket.IO for Invoice Wallet real-time features
            invoiceWalletSocket.initialize(server);
            console.log('Invoice Wallet WebSocket service initialized');

            // Initialize Socket.IO for Enterprise Wallet real-time features
            enterpriseWalletSocket.initialize(server);
            console.log('Enterprise Wallet WebSocket service initialized');
        });
        // delete unused media from media temp
        this.scheduleJob();
    }

    /**
     * Execute schedule job
     * @memberOf Bootstrap
     */
    scheduleJob() {
        schedule.scheduleJob('0 */1 * * *', scheduleJob.deleteMedia);
    }
}