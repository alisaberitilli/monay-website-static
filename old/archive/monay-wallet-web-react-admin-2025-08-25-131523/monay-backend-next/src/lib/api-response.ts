import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string, total?: number): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'Success',
    };
    
    if (total !== undefined) {
      response.total = total;
    }
    
    return NextResponse.json(response, { status: 200 });
  }
  
  static created<T>(data: T, message?: string): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'Created successfully',
    };
    
    return NextResponse.json(response, { status: 201 });
  }
  
  static error(error: string | Error, status: number = 400): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : error,
    };
    
    return NextResponse.json(response, { status });
  }
  
  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return this.error(message, 401);
  }
  
  static forbidden(message: string = 'Forbidden'): NextResponse {
    return this.error(message, 403);
  }
  
  static notFound(message: string = 'Not found'): NextResponse {
    return this.error(message, 404);
  }
  
  static validationError(errors: any): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors,
    };
    
    return NextResponse.json(response, { status: 422 });
  }
  
  static serverError(error?: Error): NextResponse {
    console.error('Server error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error?.message || 'Internal server error',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}