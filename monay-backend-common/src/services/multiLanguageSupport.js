import db from '../models/index.js';
const { pool } = db;
import redis from '../config/redis.js';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

class MultiLanguageSupport {
  constructor() {
    this.supportedLanguages = [
      'en', 'es', 'zh', 'ar', 'fr', 'ru', 'pt', 'hi', 'bn', 'ja',
      'vi', 'ko', 'de', 'it', 'tr', 'pl', 'uk', 'ro', 'nl', 'sv'
    ];
    this.translations = new Map();
    this.defaultLanguage = 'en';
    this.loadTranslations();
  }

  async loadTranslations() {
    try {
      const result = await pool.query(`
        SELECT language_code, translation_key, translation_value, context
        FROM translations
        WHERE is_active = true
      `);

      for (const row of result.rows) {
        const key = `${row.language_code}:${row.translation_key}`;
        this.translations.set(key, {
          value: row.translation_value,
          context: row.context
        });
      }

      await this.cacheTranslations();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  async cacheTranslations() {
    for (const lang of this.supportedLanguages) {
      const langTranslations = {};

      for (const [key, value] of this.translations) {
        if (key.startsWith(`${lang}:`)) {
          const translationKey = key.substring(lang.length + 1);
          langTranslations[translationKey] = value.value;
        }
      }

      await redis.setex(
        `translations:${lang}`,
        3600,
        JSON.stringify(langTranslations)
      );
    }
  }

  async translate(key, language = 'en', params = {}) {
    const cacheKey = `translations:${language}`;
    let translations = await redis.get(cacheKey);

    if (!translations) {
      await this.loadTranslations();
      translations = await redis.get(cacheKey);
    }

    if (translations) {
      translations = JSON.parse(translations);
      let translation = translations[key] || this.getFallbackTranslation(key, language);

      for (const [param, value] of Object.entries(params)) {
        translation = translation.replace(`{{${param}}}`, value);
      }

      return translation;
    }

    return this.getFallbackTranslation(key, language);
  }

  async getFallbackTranslation(key, requestedLanguage) {
    const fallbackLanguages = this.getFallbackChain(requestedLanguage);

    for (const lang of fallbackLanguages) {
      const translationKey = `${lang}:${key}`;
      const translation = this.translations.get(translationKey);

      if (translation) {
        return translation.value;
      }
    }

    return key;
  }

  getFallbackChain(language) {
    const chain = [language];

    const languageFamilies = {
      'es': ['pt', 'it', 'fr'],
      'pt': ['es', 'it', 'fr'],
      'zh': ['ja', 'ko'],
      'ar': ['fa', 'ur'],
      'hi': ['bn', 'ur'],
      'ru': ['uk', 'pl'],
      'de': ['nl', 'sv'],
      'fr': ['es', 'it', 'pt']
    };

    if (languageFamilies[language]) {
      chain.push(...languageFamilies[language]);
    }

    if (language !== this.defaultLanguage) {
      chain.push(this.defaultLanguage);
    }

    return chain;
  }

  async addTranslation(translationData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(`
        INSERT INTO translations (
          language_code, translation_key, translation_value,
          context, category, is_verified, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (language_code, translation_key)
        DO UPDATE SET
          translation_value = EXCLUDED.translation_value,
          context = EXCLUDED.context,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        translationData.language_code,
        translationData.translation_key,
        translationData.translation_value,
        translationData.context,
        translationData.category,
        translationData.is_verified || false,
        translationData.created_by
      ]);

      await this.logTranslationChange(client, {
        action: 'add',
        language_code: translationData.language_code,
        translation_key: translationData.translation_key,
        old_value: null,
        new_value: translationData.translation_value,
        changed_by: translationData.created_by
      });

      await client.query('COMMIT');

      const key = `${translationData.language_code}:${translationData.translation_key}`;
      this.translations.set(key, {
        value: translationData.translation_value,
        context: translationData.context
      });

      await this.cacheTranslations();

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async bulkImportTranslations(filePath, language) {
    const client = await pool.connect();

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const translations = JSON.parse(content);

      await client.query('BEGIN');

      for (const [key, value] of Object.entries(translations)) {
        await client.query(`
          INSERT INTO translations (
            language_code, translation_key, translation_value,
            category, is_verified
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (language_code, translation_key)
          DO UPDATE SET
            translation_value = EXCLUDED.translation_value,
            updated_at = CURRENT_TIMESTAMP
        `, [language, key, value, 'imported', true]);
      }

      await client.query('COMMIT');
      await this.loadTranslations();

      return {
        success: true,
        imported: Object.keys(translations).length,
        language: language
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async translateBenefitProgram(programType, language) {
    const programTranslations = {
      'SNAP': {
        'en': 'Supplemental Nutrition Assistance Program',
        'es': 'Programa de Asistencia Nutricional Suplementaria',
        'zh': '补充营养援助计划',
        'ar': 'برنامج المساعدة الغذائية التكميلية',
        'fr': "Programme d'aide nutritionnelle supplémentaire",
        'ru': 'Программа дополнительной продовольственной помощи',
        'pt': 'Programa de Assistência Nutricional Suplementar',
        'hi': 'पूरक पोषण सहायता कार्यक्रम',
        'bn': 'সম্পূরক পুষ্টি সহায়তা কর্মসূচি',
        'vi': 'Chương trình Hỗ trợ Dinh dưỡng Bổ sung'
      },
      'TANF': {
        'en': 'Temporary Assistance for Needy Families',
        'es': 'Asistencia Temporal para Familias Necesitadas',
        'zh': '贫困家庭临时援助',
        'ar': 'المساعدة المؤقتة للأسر المحتاجة',
        'fr': 'Aide temporaire aux familles nécessiteuses',
        'ru': 'Временная помощь нуждающимся семьям',
        'pt': 'Assistência Temporária para Famílias Necessitadas',
        'hi': 'जरूरतमंद परिवारों के लिए अस्थायी सहायता',
        'bn': 'অভাবী পরিবারের জন্য অস্থায়ী সহায়তা',
        'vi': 'Trợ giúp Tạm thời cho Gia đình Khó khăn'
      },
      'MEDICAID': {
        'en': 'Medicaid Health Coverage',
        'es': 'Cobertura de Salud de Medicaid',
        'zh': '医疗补助健康保险',
        'ar': 'التغطية الصحية لبرنامج Medicaid',
        'fr': 'Couverture santé Medicaid',
        'ru': 'Медицинское страхование Medicaid',
        'pt': 'Cobertura de Saúde Medicaid',
        'hi': 'मेडिकेड स्वास्थ्य कवरेज',
        'bn': 'মেডিকেড স্বাস্থ্য কভারেজ',
        'vi': 'Bảo hiểm Y tế Medicaid'
      },
      'WIC': {
        'en': 'Women, Infants, and Children',
        'es': 'Mujeres, Bebés y Niños',
        'zh': '妇女、婴儿和儿童计划',
        'ar': 'برنامج النساء والرضع والأطفال',
        'fr': 'Femmes, nourrissons et enfants',
        'ru': 'Женщины, младенцы и дети',
        'pt': 'Mulheres, Bebês e Crianças',
        'hi': 'महिलाएं, शिशु और बच्चे',
        'bn': 'মহিলা, শিশু এবং শিশু',
        'vi': 'Phụ nữ, Trẻ sơ sinh và Trẻ em'
      },
      'VETERANS': {
        'en': 'Veterans Benefits',
        'es': 'Beneficios para Veteranos',
        'zh': '退伍军人福利',
        'ar': 'مزايا المحاربين القدامى',
        'fr': 'Prestations aux anciens combattants',
        'ru': 'Льготы для ветеранов',
        'pt': 'Benefícios para Veteranos',
        'hi': 'वयोवृद्ध लाभ',
        'bn': 'ভেটেরান সুবিধা',
        'vi': 'Phúc lợi Cựu chiến binh'
      },
      'SECTION_8': {
        'en': 'Section 8 Housing Choice Voucher',
        'es': 'Vale de Elección de Vivienda Sección 8',
        'zh': '第8节住房选择券',
        'ar': 'قسيمة اختيار السكن القسم 8',
        'fr': 'Bon de choix de logement Section 8',
        'ru': 'Ваучер на выбор жилья Раздел 8',
        'pt': 'Vale de Escolha de Habitação Seção 8',
        'hi': 'धारा 8 आवास विकल्प वाउचर',
        'bn': 'সেকশন 8 হাউজিং চয়েস ভাউচার',
        'vi': 'Phiếu Lựa chọn Nhà ở Mục 8'
      },
      'LIHEAP': {
        'en': 'Low Income Home Energy Assistance Program',
        'es': 'Programa de Asistencia de Energía para Hogares de Bajos Ingresos',
        'zh': '低收入家庭能源援助计划',
        'ar': 'برنامج مساعدة الطاقة المنزلية لذوي الدخل المنخفض',
        'fr': "Programme d'aide énergétique pour les ménages à faible revenu",
        'ru': 'Программа помощи по энергетике для малообеспеченных',
        'pt': 'Programa de Assistência Energética para Lares de Baixa Renda',
        'hi': 'कम आय वाले घर ऊर्जा सहायता कार्यक्रम',
        'bn': 'নিম্ন আয়ের গৃহ শক্তি সহায়তা কর্মসূচি',
        'vi': 'Chương trình Hỗ trợ Năng lượng cho Hộ Thu nhập Thấp'
      },
      'UNEMPLOYMENT': {
        'en': 'Unemployment Insurance Benefits',
        'es': 'Beneficios del Seguro de Desempleo',
        'zh': '失业保险福利',
        'ar': 'إعانات التأمين ضد البطالة',
        'fr': "Prestations d'assurance-chômage",
        'ru': 'Пособие по безработице',
        'pt': 'Benefícios do Seguro-Desemprego',
        'hi': 'बेरोजगारी बीमा लाभ',
        'bn': 'বেকারত্ব বীমা সুবিধা',
        'vi': 'Trợ cấp Bảo hiểm Thất nghiệp'
      },
      'SCHOOL_CHOICE': {
        'en': 'Education Savings Account / School Choice',
        'es': 'Cuenta de Ahorros para la Educación / Elección de Escuela',
        'zh': '教育储蓄账户/学校选择',
        'ar': 'حساب التوفير التعليمي / اختيار المدرسة',
        'fr': "Compte d'épargne-études / Choix de l'école",
        'ru': 'Образовательный сберегательный счет / Выбор школы',
        'pt': 'Conta Poupança Educação / Escolha da Escola',
        'hi': 'शिक्षा बचत खाता / स्कूल विकल्प',
        'bn': 'শিক্ষা সঞ্চয় অ্যাকাউন্ট / স্কুল পছন্দ',
        'vi': 'Tài khoản Tiết kiệm Giáo dục / Lựa chọn Trường học'
      },
      'CHILD_CARE': {
        'en': 'Child Care Assistance Program',
        'es': 'Programa de Asistencia para el Cuidado Infantil',
        'zh': '儿童保育援助计划',
        'ar': 'برنامج مساعدة رعاية الطفل',
        'fr': "Programme d'aide à la garde d'enfants",
        'ru': 'Программа помощи по уходу за детьми',
        'pt': 'Programa de Assistência ao Cuidado Infantil',
        'hi': 'बाल देखभाल सहायता कार्यक्रम',
        'bn': 'শিশু যত্ন সহায়তা কর্মসূচি',
        'vi': 'Chương trình Hỗ trợ Chăm sóc Trẻ em'
      },
      'TRANSPORTATION': {
        'en': 'Transportation Benefits',
        'es': 'Beneficios de Transporte',
        'zh': '交通福利',
        'ar': 'مزايا النقل',
        'fr': 'Prestations de transport',
        'ru': 'Транспортные льготы',
        'pt': 'Benefícios de Transporte',
        'hi': 'परिवहन लाभ',
        'bn': 'পরিবহন সুবিধা',
        'vi': 'Phúc lợi Giao thông'
      },
      'EMERGENCY_RENTAL': {
        'en': 'Emergency Rental Assistance',
        'es': 'Asistencia de Emergencia para el Alquiler',
        'zh': '紧急租金援助',
        'ar': 'مساعدة الإيجار الطارئة',
        'fr': "Aide d'urgence au loyer",
        'ru': 'Экстренная помощь с арендой',
        'pt': 'Assistência Emergencial de Aluguel',
        'hi': 'आपातकालीन किराया सहायता',
        'bn': 'জরুরী ভাড়া সহায়তা',
        'vi': 'Hỗ trợ Thuê nhà Khẩn cấp'
      },
      'SCHOOL_MEALS': {
        'en': 'Free and Reduced School Meals',
        'es': 'Comidas Escolares Gratuitas y Reducidas',
        'zh': '免费和减价学校餐',
        'ar': 'الوجبات المدرسية المجانية والمخفضة',
        'fr': 'Repas scolaires gratuits et réduits',
        'ru': 'Бесплатные и льготные школьные обеды',
        'pt': 'Refeições Escolares Gratuitas e Reduzidas',
        'hi': 'मुफ्त और रियायती स्कूल भोजन',
        'bn': 'বিনামূল্যে এবং হ্রাসকৃত স্কুল খাবার',
        'vi': 'Bữa ăn Học đường Miễn phí và Giảm giá'
      },
      'EITC': {
        'en': 'Earned Income Tax Credit',
        'es': 'Crédito Tributario por Ingreso del Trabajo',
        'zh': '劳动所得税抵免',
        'ar': 'ائتمان ضريبة الدخل المكتسب',
        'fr': "Crédit d'impôt sur le revenu gagné",
        'ru': 'Налоговый кредит на заработанный доход',
        'pt': 'Crédito Tributário de Renda Conquistada',
        'hi': 'अर्जित आयकर क्रेडिट',
        'bn': 'অর্জিত আয়কর ক্রেডিট',
        'vi': 'Tín dụng Thuế Thu nhập Kiếm được'
      }
    };

    return programTranslations[programType]?.[language] || programTranslations[programType]?.['en'] || programType;
  }

  async getUITranslations(language, category = null) {
    const cacheKey = `ui_translations:${language}:${category || 'all'}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    let query = `
      SELECT translation_key, translation_value, category
      FROM translations
      WHERE language_code = $1 AND is_active = true
    `;
    const params = [language];

    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }

    const result = await pool.query(query, params);

    const translations = {};
    for (const row of result.rows) {
      if (!translations[row.category]) {
        translations[row.category] = {};
      }
      translations[row.category][row.translation_key] = row.translation_value;
    }

    await redis.setex(cacheKey, 3600, JSON.stringify(translations));

    return translations;
  }

  async detectLanguage(text) {
    const languagePatterns = {
      'ar': /[\u0600-\u06FF]/,
      'zh': /[\u4E00-\u9FFF]/,
      'ja': /[\u3040-\u309F\u30A0-\u30FF]/,
      'ko': /[\uAC00-\uD7AF]/,
      'hi': /[\u0900-\u097F]/,
      'bn': /[\u0980-\u09FF]/,
      'ru': /[\u0400-\u04FF]/,
      'el': /[\u0370-\u03FF]/,
      'he': /[\u0590-\u05FF]/
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    const commonWords = {
      'en': ['the', 'and', 'of', 'to', 'in', 'is', 'that'],
      'es': ['el', 'la', 'de', 'que', 'en', 'los', 'las'],
      'fr': ['le', 'de', 'la', 'et', 'les', 'des', 'que'],
      'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von'],
      'pt': ['o', 'a', 'de', 'para', 'em', 'que', 'com'],
      'it': ['il', 'di', 'la', 'che', 'e', 'le', 'un'],
      'nl': ['de', 'het', 'van', 'en', 'in', 'op', 'te']
    };

    const words = text.toLowerCase().split(/\s+/);
    const scores = {};

    for (const [lang, wordList] of Object.entries(commonWords)) {
      scores[lang] = words.filter(word => wordList.includes(word)).length;
    }

    const detected = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return detected[1] > 0 ? detected[0] : 'en';
  }

  async translateDocument(documentId, targetLanguage) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const document = await client.query(`
        SELECT * FROM documents
        WHERE id = $1
      `, [documentId]);

      if (document.rows.length === 0) {
        throw new Error('Document not found');
      }

      const doc = document.rows[0];
      const translatedContent = await this.translateContent(doc.content, targetLanguage);

      const result = await client.query(`
        INSERT INTO translated_documents (
          original_document_id, language_code, title,
          content, translated_by, translation_method
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        documentId,
        targetLanguage,
        await this.translate(doc.title, targetLanguage),
        translatedContent,
        'system',
        'automated'
      ]);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async translateContent(content, targetLanguage) {
    const sections = content.split('\n\n');
    const translatedSections = [];

    for (const section of sections) {
      const translationKey = this.generateTranslationKey(section);
      const cached = await redis.get(`content:${targetLanguage}:${translationKey}`);

      if (cached) {
        translatedSections.push(cached);
      } else {
        const translated = await this.performTranslation(section, targetLanguage);
        await redis.setex(
          `content:${targetLanguage}:${translationKey}`,
          86400,
          translated
        );
        translatedSections.push(translated);
      }
    }

    return translatedSections.join('\n\n');
  }

  generateTranslationKey(text) {
    // Use imported crypto
    return crypto.createHash('md5').update(text).digest('hex');
  }

  async performTranslation(text, targetLanguage) {
    const placeholders = [];
    let processedText = text;

    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    let match;
    let index = 0;

    while ((match = placeholderRegex.exec(text)) !== null) {
      const placeholder = `__PLACEHOLDER_${index}__`;
      placeholders.push({ original: match[0], replacement: placeholder });
      processedText = processedText.replace(match[0], placeholder);
      index++;
    }

    let translatedText = await this.getStoredTranslation(processedText, targetLanguage);

    if (!translatedText) {
      translatedText = processedText;
    }

    for (const { original, replacement } of placeholders) {
      translatedText = translatedText.replace(replacement, original);
    }

    return translatedText;
  }

  async getStoredTranslation(text, language) {
    const result = await pool.query(`
      SELECT translation_value
      FROM translations
      WHERE language_code = $1 AND translation_key = $2
    `, [language, text]);

    return result.rows.length > 0 ? result.rows[0].translation_value : null;
  }

  async createLanguagePack(language) {
    const translations = await pool.query(`
      SELECT category, translation_key, translation_value
      FROM translations
      WHERE language_code = $1 AND is_verified = true
      ORDER BY category, translation_key
    `, [language]);

    const pack = {
      language_code: language,
      language_name: this.getLanguageName(language),
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      translations: {}
    };

    for (const row of translations.rows) {
      if (!pack.translations[row.category]) {
        pack.translations[row.category] = {};
      }
      pack.translations[row.category][row.translation_key] = row.translation_value;
    }

    const filePath = path.join(__dirname, '../../language-packs', `${language}.json`);
    await fs.writeFile(filePath, JSON.stringify(pack, null, 2));

    return {
      language: language,
      entries: translations.rows.length,
      file: filePath
    };
  }

  getLanguageName(code) {
    const names = {
      'en': 'English',
      'es': 'Spanish',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'fr': 'French',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'ja': 'Japanese',
      'vi': 'Vietnamese',
      'ko': 'Korean',
      'de': 'German',
      'it': 'Italian',
      'tr': 'Turkish',
      'pl': 'Polish',
      'uk': 'Ukrainian',
      'ro': 'Romanian',
      'nl': 'Dutch',
      'sv': 'Swedish'
    };

    return names[code] || code;
  }

  async getLanguageStats() {
    const stats = await pool.query(`
      SELECT
        language_code,
        COUNT(*) as total_translations,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_translations,
        COUNT(DISTINCT category) as categories,
        MAX(updated_at) as last_updated
      FROM translations
      GROUP BY language_code
      ORDER BY total_translations DESC
    `);

    const coverage = await pool.query(`
      WITH required_keys AS (
        SELECT DISTINCT translation_key
        FROM translations
        WHERE language_code = 'en'
      ),
      language_coverage AS (
        SELECT
          t.language_code,
          COUNT(DISTINCT t.translation_key) as translated_keys,
          (SELECT COUNT(*) FROM required_keys) as total_keys
        FROM translations t
        WHERE EXISTS (
          SELECT 1 FROM required_keys rk
          WHERE rk.translation_key = t.translation_key
        )
        GROUP BY t.language_code
      )
      SELECT
        language_code,
        translated_keys,
        total_keys,
        ROUND(translated_keys::numeric / total_keys::numeric * 100, 2) as coverage_percentage
      FROM language_coverage
    `);

    return {
      languages: stats.rows,
      coverage: coverage.rows
    };
  }

  async validateTranslations(language) {
    const issues = [];

    const missingKeys = await pool.query(`
      SELECT translation_key
      FROM translations
      WHERE language_code = 'en'
        AND translation_key NOT IN (
          SELECT translation_key
          FROM translations
          WHERE language_code = $1
        )
    `, [language]);

    if (missingKeys.rows.length > 0) {
      issues.push({
        type: 'missing_translations',
        severity: 'high',
        count: missingKeys.rows.length,
        keys: missingKeys.rows.map(r => r.translation_key)
      });
    }

    const unverified = await pool.query(`
      SELECT COUNT(*) as count
      FROM translations
      WHERE language_code = $1 AND is_verified = false
    `, [language]);

    if (unverified.rows[0].count > 0) {
      issues.push({
        type: 'unverified_translations',
        severity: 'medium',
        count: parseInt(unverified.rows[0].count)
      });
    }

    const outdated = await pool.query(`
      SELECT t1.translation_key
      FROM translations t1
      JOIN translations t2 ON t1.translation_key = t2.translation_key
      WHERE t1.language_code = $1
        AND t2.language_code = 'en'
        AND t2.updated_at > t1.updated_at
    `, [language]);

    if (outdated.rows.length > 0) {
      issues.push({
        type: 'outdated_translations',
        severity: 'medium',
        count: outdated.rows.length,
        keys: outdated.rows.map(r => r.translation_key)
      });
    }

    return {
      language: language,
      is_valid: issues.length === 0,
      issues: issues
    };
  }

  async logTranslationChange(client, changeData) {
    await client.query(`
      INSERT INTO translation_audit_log (
        action, language_code, translation_key,
        old_value, new_value, changed_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      changeData.action,
      changeData.language_code,
      changeData.translation_key,
      changeData.old_value,
      changeData.new_value,
      changeData.changed_by
    ]);
  }

  async getUserPreferredLanguage(userId) {
    const result = await pool.query(`
      SELECT preferred_language
      FROM user_preferences
      WHERE user_id = $1
    `, [userId]);

    if (result.rows.length > 0 && result.rows[0].preferred_language) {
      return result.rows[0].preferred_language;
    }

    return this.defaultLanguage;
  }

  async setUserPreferredLanguage(userId, language) {
    await pool.query(`
      INSERT INTO user_preferences (user_id, preferred_language)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        preferred_language = EXCLUDED.preferred_language,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, language]);

    await redis.setex(`user_lang:${userId}`, 86400, language);

    return { success: true, language };
  }

  formatCurrency(amount, language, currency = 'USD') {
    const formatter = new Intl.NumberFormat(this.getLocale(language), {
      style: 'currency',
      currency: currency
    });

    return formatter.format(amount);
  }

  formatDate(date, language, format = 'full') {
    const options = {
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      short: { year: '2-digit', month: '2-digit', day: '2-digit' }
    };

    const formatter = new Intl.DateTimeFormat(this.getLocale(language), options[format]);
    return formatter.format(new Date(date));
  }

  formatNumber(number, language, decimals = 2) {
    const formatter = new Intl.NumberFormat(this.getLocale(language), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return formatter.format(number);
  }

  getLocale(language) {
    const localeMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'fr': 'fr-FR',
      'ru': 'ru-RU',
      'pt': 'pt-BR',
      'hi': 'hi-IN',
      'bn': 'bn-BD',
      'ja': 'ja-JP',
      'vi': 'vi-VN',
      'ko': 'ko-KR',
      'de': 'de-DE',
      'it': 'it-IT',
      'tr': 'tr-TR',
      'pl': 'pl-PL',
      'uk': 'uk-UA',
      'ro': 'ro-RO',
      'nl': 'nl-NL',
      'sv': 'sv-SE'
    };

    return localeMap[language] || 'en-US';
  }

  async exportTranslations(language, format = 'json') {
    const translations = await pool.query(`
      SELECT category, translation_key, translation_value
      FROM translations
      WHERE language_code = $1
      ORDER BY category, translation_key
    `, [language]);

    const data = {};
    for (const row of translations.rows) {
      if (!data[row.category]) {
        data[row.category] = {};
      }
      data[row.category][row.translation_key] = row.translation_value;
    }

    switch (format) {
      case 'csv':
        return this.exportAsCSV(data, language);
      case 'xml':
        return this.exportAsXML(data, language);
      case 'properties':
        return this.exportAsProperties(data, language);
      default:
        return data;
    }
  }

  exportAsCSV(data, language) {
    let csv = 'Category,Key,Value\n';

    for (const [category, translations] of Object.entries(data)) {
      for (const [key, value] of Object.entries(translations)) {
        csv += `"${category}","${key}","${value.replace(/"/g, '""')}"\n`;
      }
    }

    return csv;
  }

  exportAsProperties(data, language) {
    let properties = `# Language: ${this.getLanguageName(language)}\n`;
    properties += `# Generated: ${new Date().toISOString()}\n\n`;

    for (const [category, translations] of Object.entries(data)) {
      properties += `# Category: ${category}\n`;
      for (const [key, value] of Object.entries(translations)) {
        properties += `${category}.${key}=${value}\n`;
      }
      properties += '\n';
    }

    return properties;
  }
}

export default new MultiLanguageSupport();