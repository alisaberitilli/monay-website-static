// Tenant middleware placeholder
export const extractTenantContext = async (req, res, next) => {
  // Placeholder tenant extraction
  req.tenant = { id: 'default', name: 'Default Tenant' };
  next();
};

export default { extractTenantContext };