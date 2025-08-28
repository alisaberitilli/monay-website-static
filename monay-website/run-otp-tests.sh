#!/bin/bash

# OTP System Test Runner
# This script runs the OTP test suite and provides proper exit codes for CI/CD

set -e  # Exit on any error

echo "🚀 Starting OTP System Test Suite..."
echo "=================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the test script exists
if [ ! -f "test-otp-system.js" ]; then
    echo "❌ test-otp-system.js not found in current directory"
    exit 1
fi

# Check if PostgreSQL is accessible
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found - database tests will be skipped"
fi

# Run the test suite
echo "🔍 Running OTP tests..."
node test-otp-system.js

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed successfully!"
    echo "✅ OTP system is working correctly"
else
    echo ""
    echo "❌ Some tests failed"
    echo "🔍 Check the logs above for details"
fi

exit $EXIT_CODE
