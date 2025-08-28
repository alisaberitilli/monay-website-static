#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File paths
const MODERN_SCHEMA = path.join(__dirname, 'schema.prisma');
const LEGACY_SCHEMA = '/Users/alisaberi/Library/Mobile Documents/com~apple~CloudDocs/Downloads/schema.prisma_TO_BE_MERGED_DELETE';
const OUTPUT_SCHEMA = path.join(__dirname, 'merged.schema.prisma');

// Read both schema files
const modernSchema = fs.readFileSync(MODERN_SCHEMA, 'utf8');
const legacySchema = fs.readFileSync(LEGACY_SCHEMA, 'utf8');

// Parse schemas into sections
function parseSchema(schemaContent) {
  const lines = schemaContent.split('\n');
  const result = {
    header: [],
    enums: {},
    models: {},
    currentSection: 'header'
  };
  
  let currentBlock = [];
  let blockType = '';
  let blockName = '';
  let inBlock = false;
  let braceCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for generator/datasource
    if (trimmedLine.startsWith('generator ') || trimmedLine.startsWith('datasource ')) {
      blockType = 'header';
      inBlock = true;
      currentBlock = [line];
      braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      continue;
    }
    
    // Check for enum start
    if (trimmedLine.startsWith('enum ')) {
      blockType = 'enum';
      blockName = trimmedLine.split(' ')[1];
      inBlock = true;
      currentBlock = [line];
      braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      continue;
    }
    
    // Check for model start
    if (trimmedLine.startsWith('model ')) {
      blockType = 'model';
      blockName = trimmedLine.split(' ')[1];
      inBlock = true;
      currentBlock = [line];
      braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      continue;
    }
    
    // If we're in a block, add the line
    if (inBlock) {
      currentBlock.push(line);
      braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      
      // Check if block is complete
      if (braceCount === 0) {
        const blockContent = currentBlock.join('\n');
        
        if (blockType === 'header') {
          result.header.push(blockContent);
        } else if (blockType === 'enum') {
          result.enums[blockName] = blockContent;
        } else if (blockType === 'model') {
          result.models[blockName] = blockContent;
        }
        
        inBlock = false;
        currentBlock = [];
        blockName = '';
      }
    } else if (trimmedLine && !trimmedLine.startsWith('//')) {
      // Comments and empty lines outside blocks
      if (result.currentSection === 'header') {
        result.header.push(line);
      }
    }
  }
  
  return result;
}

console.log('Parsing modern schema...');
const modern = parseSchema(modernSchema);

console.log('Parsing legacy schema...');
const legacy = parseSchema(legacySchema);

// Merge strategy
const merged = {
  header: modern.header,
  enums: {},
  models: {}
};

// Merge enums (modern takes precedence)
console.log('\nMerging enums...');
for (const [name, content] of Object.entries(modern.enums)) {
  merged.enums[name] = content;
  console.log(`  ✓ ${name} (from modern)`);
}

for (const [name, content] of Object.entries(legacy.enums)) {
  if (!merged.enums[name]) {
    merged.enums[name] = content;
    console.log(`  ✓ ${name} (from legacy)`);
  } else {
    console.log(`  ⚠ ${name} (skipped - already exists)`);
  }
}

// Model renaming strategy for conflicts
const modelRenames = {
  // Legacy models that conflict with modern ones
  'User': 'LegacyUser',
  'Account': 'LegacyAccount',
  'Invoice': 'LegacyInvoice',
  'Transaction': 'LegacyTransaction',
  'PaymentMethod': 'LegacyPaymentMethod',
  'Faq': 'LegacyFaq',
  'UserDevice': 'LegacyUserDevice',
  'ServiceType': 'ServiceTypeModel',  // ServiceType conflicts with enum
  'UserControl': 'LegacyUserControl',
  'UserRole': 'LegacyUserRole',
  'UserFlags': 'LegacyUserFlags',
  'UserPrefs': 'LegacyUserPrefs',
  'UserNudgePrefs': 'LegacyUserNudgePrefs',
  'UserContact': 'LegacyUserContact',
  'UserAssignment': 'LegacyUserAssignment',
  'UserReport': 'LegacyUserReport',
  'UserInvite': 'LegacyUserInvite',
  'AccountMeta': 'LegacyAccountMeta',
  'InvoiceItem': 'LegacyInvoiceItem',
  'InvoiceApproval': 'LegacyInvoiceApproval',
  'InvoiceComplaint': 'LegacyInvoiceComplaint'
};

// Rename references in model content
function renameReferences(content, renames) {
  let updated = content;
  
  for (const [oldName, newName] of Object.entries(renames)) {
    // Rename model declaration
    updated = updated.replace(new RegExp(`^model ${oldName}`, 'gm'), `model ${newName}`);
    
    // Rename in field types (but not in field names)
    updated = updated.replace(new RegExp(`\\s+${oldName}\\[`, 'g'), ` ${newName}[`);
    updated = updated.replace(new RegExp(`\\s+${oldName}\\?`, 'g'), ` ${newName}?`);
    updated = updated.replace(new RegExp(`\\s+${oldName}\\s+@relation`, 'g'), ` ${newName} @relation`);
    updated = updated.replace(new RegExp(`\\s+${oldName}\\s`, 'g'), ` ${newName} `);
  }
  
  return updated;
}

// Merge models
console.log('\nMerging models...');

// First, add all modern models
for (const [name, content] of Object.entries(modern.models)) {
  merged.models[name] = content;
  console.log(`  ✓ ${name} (from modern)`);
}

// Then add legacy models, with renaming where needed
for (const [name, content] of Object.entries(legacy.models)) {
  if (modelRenames[name]) {
    // Rename the model and its references
    const newName = modelRenames[name];
    const renamedContent = renameReferences(content, modelRenames);
    merged.models[newName] = renamedContent;
    console.log(`  ✓ ${name} → ${newName} (renamed from legacy)`);
  } else if (!merged.models[name]) {
    // No conflict, add as-is but still check for references that need renaming
    const updatedContent = renameReferences(content, modelRenames);
    merged.models[name] = updatedContent;
    console.log(`  ✓ ${name} (from legacy)`);
  } else {
    console.log(`  ⚠ ${name} (skipped - already exists)`);
  }
}

// Build the final schema
let finalSchema = [];

// Add header
finalSchema.push('// ==============================================================================');
finalSchema.push('// MERGED PRISMA SCHEMA - Combining Monay Platform with Legacy B2B Systems');
finalSchema.push('// ==============================================================================');
finalSchema.push('// Generated: ' + new Date().toISOString());
finalSchema.push('// Modern schema models: ' + Object.keys(modern.models).length);
finalSchema.push('// Legacy schema models: ' + Object.keys(legacy.models).length);
finalSchema.push('// Total merged models: ' + Object.keys(merged.models).length);
finalSchema.push('// ==============================================================================');
finalSchema.push('');
finalSchema.push(...merged.header);
finalSchema.push('');

// Add enums section
finalSchema.push('// ==============================================================================');
finalSchema.push('// ENUM DEFINITIONS');
finalSchema.push('// ==============================================================================');
finalSchema.push('');

const sortedEnums = Object.keys(merged.enums).sort();
for (const enumName of sortedEnums) {
  finalSchema.push(merged.enums[enumName]);
  finalSchema.push('');
}

// Add models section
finalSchema.push('// ==============================================================================');
finalSchema.push('// DATA MODELS');
finalSchema.push('// ==============================================================================');
finalSchema.push('');

const sortedModels = Object.keys(merged.models).sort();
for (const modelName of sortedModels) {
  finalSchema.push(merged.models[modelName]);
  finalSchema.push('');
}

// Write the merged schema
const finalContent = finalSchema.join('\n');
fs.writeFileSync(OUTPUT_SCHEMA, finalContent);

console.log('\n✅ Schema merge complete!');
console.log(`   Output: ${OUTPUT_SCHEMA}`);
console.log(`   Total lines: ${finalContent.split('\n').length}`);
console.log(`   Size: ${(Buffer.byteLength(finalContent) / 1024).toFixed(2)} KB`);

// Validation summary
console.log('\n📋 Merge Summary:');
console.log(`   Enums: ${Object.keys(merged.enums).length}`);
console.log(`   Models: ${Object.keys(merged.models).length}`);
console.log('\n⚠️  Renamed models to avoid conflicts:');
for (const [old, renamed] of Object.entries(modelRenames)) {
  if (legacy.models[old]) {
    console.log(`   ${old} → ${renamed}`);
  }
}

console.log('\n📝 Next steps:');
console.log('   1. Run: npx prisma validate --schema=merged.schema.prisma');
console.log('   2. Review the merged schema for any manual adjustments');
console.log('   3. Generate migrations when ready');