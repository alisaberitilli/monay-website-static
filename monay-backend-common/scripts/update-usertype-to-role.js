#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Mapping of old userType values to new role values
const userTypeToRoleMap = {
  'admin': 'platform_admin',
  'subadmin': ['compliance_officer', 'treasury_manager', 'support_agent'],
  'user': ['basic_consumer', 'verified_consumer', 'premium_consumer'],
  'merchant': 'merchant',
  'secondaryUser': ['enterprise_admin', 'enterprise_developer', 'enterprise_finance']
};

// Get all repository files
const reposDir = path.join(__dirname, '../src/repositories');
const repoFiles = fs.readdirSync(reposDir).filter(file => file.endsWith('.js'));

console.log(`Found ${repoFiles.length} repository files to update`);

repoFiles.forEach(file => {
  const filePath = path.join(reposDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace where.userType with where.role
  if (content.includes('where.userType')) {
    content = content.replace(/where\.userType/g, 'where.role');
    modified = true;
  }
  
  // Replace userType: 'admin' with role: 'platform_admin'
  if (content.includes("userType: 'admin'")) {
    content = content.replace(/userType:\s*'admin'/g, "role: 'platform_admin'");
    modified = true;
  }
  
  // Replace userType: 'subadmin' with role: { [Op.in]: ['compliance_officer', 'treasury_manager'] }
  if (content.includes("userType: 'subadmin'")) {
    content = content.replace(/userType:\s*'subadmin'/g, 
      "role: { [Op.in]: ['compliance_officer', 'treasury_manager', 'support_agent'] }");
    modified = true;
  }
  
  // Replace userType: { [Op.in]: ['user', 'merchant'] } with appropriate role values
  if (content.includes("userType: { [Op.in]: ['user', 'merchant']")) {
    content = content.replace(/userType:\s*{\s*\[Op\.in\]:\s*\['user',\s*'merchant'\]\s*}/g,
      "role: { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer', 'merchant'] }");
    modified = true;
  }
  
  // Replace userType: { [Op.in]: ['user', 'secondaryUser'] }
  if (content.includes("userType: { [Op.in]: ['user', 'secondaryUser']")) {
    content = content.replace(/userType:\s*{\s*\[Op\.in\]:\s*\['user',\s*'secondaryUser'\]\s*}/g,
      "role: { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer', 'enterprise_admin', 'enterprise_developer'] }");
    modified = true;
  }
  
  // Replace userType: { [Op.in]: ['user', 'merchant', 'secondaryUser'] }
  if (content.includes("userType: { [Op.in]: ['user', 'merchant', 'secondaryUser']")) {
    content = content.replace(/userType:\s*{\s*\[Op\.in\]:\s*\['user',\s*'merchant',\s*'secondaryUser'\]\s*}/g,
      "role: { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer', 'merchant', 'enterprise_admin', 'enterprise_developer'] }");
    modified = true;
  }
  
  // Replace userType: { [Op.ne]: 'admin' }
  if (content.includes("userType: { [Op.ne]: 'admin'")) {
    content = content.replace(/userType:\s*{\s*\[Op\.ne\]:\s*'admin'\s*}/g,
      "role: { [Op.ne]: 'platform_admin' }");
    modified = true;
  }
  
  // Replace userType: 'user'
  if (content.includes("userType: 'user'")) {
    content = content.replace(/userType:\s*'user'/g, 
      "role: { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer'] }");
    modified = true;
  }
  
  // Replace userType: 'merchant'
  if (content.includes("userType: 'merchant'")) {
    content = content.replace(/userType:\s*'merchant'/g, "role: 'merchant'");
    modified = true;
  }
  
  // Replace userType: queryData.userType  
  if (content.includes('userType: queryData.userType')) {
    content = content.replace(/userType:\s*queryData\.userType/g, 
      'role: this.mapUserTypeToRole(queryData.userType)');
    
    // Add helper function if not present
    if (!content.includes('mapUserTypeToRole')) {
      const helperFunction = `
  // Helper function to map old userType values to new role values
  mapUserTypeToRole(userType) {
    const mapping = {
      'admin': 'platform_admin',
      'subadmin': { [Op.in]: ['compliance_officer', 'treasury_manager', 'support_agent'] },
      'user': { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer'] },
      'merchant': 'merchant',
      'secondaryUser': { [Op.in]: ['enterprise_admin', 'enterprise_developer', 'enterprise_finance'] },
      'allUser': { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer', 'enterprise_admin', 'enterprise_developer'] }
    };
    return mapping[userType] || userType;
  },
`;
      // Insert before the last closing bracket
      const lastBracketIndex = content.lastIndexOf('};');
      if (lastBracketIndex !== -1) {
        content = content.slice(0, lastBracketIndex) + helperFunction + content.slice(lastBracketIndex);
      }
    }
    modified = true;
  }
  
  // Replace user.userType with user.role in conditions
  if (content.includes('user.userType')) {
    content = content.replace(/user\.userType\s*==\s*'admin'/g, "user.role === 'platform_admin'");
    content = content.replace(/user\.userType\s*==\s*'subadmin'/g, 
      "['compliance_officer', 'treasury_manager', 'support_agent'].includes(user.role)");
    content = content.replace(/user\.userType\s*==\s*'user'/g, 
      "['basic_consumer', 'verified_consumer', 'premium_consumer'].includes(user.role)");
    content = content.replace(/user\.userType\s*==\s*'merchant'/g, "user.role === 'merchant'");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`⏭️  No updates needed for ${file}`);
  }
});

console.log('\n✨ All repository files updated to use role instead of userType!');