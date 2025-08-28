import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api-response';
import { authenticateUser } from '@/lib/auth';

export async function withAuth(
  handler: (request: NextRequest, context: any) => Promise<Response>,
  options?: {
    roles?: string[];
  }
) {
  return async (request: NextRequest, context: any) => {
    try {
      const user = await authenticateUser(request);
      
      if (options?.roles && options.roles.length > 0) {
        const userRoles = user.userRoles.map(ur => ur.role.name);
        const hasRequiredRole = options.roles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          return ApiResponseBuilder.forbidden('You do not have permission to access this resource');
        }
      }
      
      (request as any).user = user;
      
      return handler(request, context);
    } catch (error) {
      return ApiResponseBuilder.unauthorized(error instanceof Error ? error.message : 'Authentication failed');
    }
  };
}