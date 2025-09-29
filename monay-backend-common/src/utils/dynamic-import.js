// Helper for dynamic imports in ES modules
export async function dynamicImport(modulePath) {
    try {
        const module = await import(modulePath);
        return module.default || module;
    } catch (error) {
        console.error(`Failed to import ${modulePath}:`, error);
        throw error;
    }
}
