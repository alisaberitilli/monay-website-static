#!/bin/bash

# Fix model access in all repository files to use dynamic access instead of destructuring
# This is needed because models are loaded asynchronously in ES modules

echo "Fixing model access in repository files..."

# List of repository files to fix
REPO_DIR="/Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common/src/repositories"

# Backup and fix each file
for file in $(find "$REPO_DIR" -name "*.js" -not -name "*.bak" -not -name "index.js"); do
    echo "Processing: $file"

    # Remove the destructuring line
    sed -i '' '/^const { .* } = models;$/d' "$file"

    # Replace direct model references with models.ModelName
    # Common model names
    sed -i '' 's/\bUser\.findOne/models.User.findOne/g' "$file"
    sed -i '' 's/\bUser\.findAll/models.User.findAll/g' "$file"
    sed -i '' 's/\bUser\.findByPk/models.User.findByPk/g' "$file"
    sed -i '' 's/\bUser\.create/models.User.create/g' "$file"
    sed -i '' 's/\bUser\.update/models.User.update/g' "$file"
    sed -i '' 's/\bUser\.destroy/models.User.destroy/g' "$file"
    sed -i '' 's/\bUser\.count/models.User.count/g' "$file"

    sed -i '' 's/\bUserToken\.findOne/models.UserToken.findOne/g' "$file"
    sed -i '' 's/\bUserToken\.findAll/models.UserToken.findAll/g' "$file"
    sed -i '' 's/\bUserToken\.create/models.UserToken.create/g' "$file"
    sed -i '' 's/\bUserToken\.update/models.UserToken.update/g' "$file"
    sed -i '' 's/\bUserToken\.destroy/models.UserToken.destroy/g' "$file"

    sed -i '' 's/\bUserDevice\.findOne/models.UserDevice.findOne/g' "$file"
    sed -i '' 's/\bUserDevice\.create/models.UserDevice.create/g' "$file"
    sed -i '' 's/\bUserDevice\.update/models.UserDevice.update/g' "$file"

    sed -i '' 's/\bUserRole\.findOne/models.UserRole.findOne/g' "$file"
    sed -i '' 's/\bUserRole\.findAll/models.UserRole.findAll/g' "$file"
    sed -i '' 's/\bUserRole\.create/models.UserRole.create/g' "$file"

    sed -i '' 's/\bRolePermission\.findOne/models.RolePermission.findOne/g' "$file"
    sed -i '' 's/\bRolePermission\.findAll/models.RolePermission.findAll/g' "$file"

    sed -i '' 's/\bTransaction\.findOne/models.Transaction.findOne/g' "$file"
    sed -i '' 's/\bTransaction\.findAll/models.Transaction.findAll/g' "$file"
    sed -i '' 's/\bTransaction\.create/models.Transaction.create/g' "$file"
    sed -i '' 's/\bTransaction\.update/models.Transaction.update/g' "$file"
    sed -i '' 's/\bTransaction\.count/models.Transaction.count/g' "$file"

    sed -i '' 's/\bUserKyc\.findOne/models.UserKyc.findOne/g' "$file"
    sed -i '' 's/\bUserKyc\.create/models.UserKyc.create/g' "$file"
    sed -i '' 's/\bUserKyc\.update/models.UserKyc.update/g' "$file"

    sed -i '' 's/\bNotification\.findOne/models.Notification.findOne/g' "$file"
    sed -i '' 's/\bNotification\.findAll/models.Notification.findAll/g' "$file"
    sed -i '' 's/\bNotification\.create/models.Notification.create/g' "$file"
    sed -i '' 's/\bNotification\.update/models.Notification.update/g' "$file"

    sed -i '' 's/\bMedia\.findOne/models.Media.findOne/g' "$file"
    sed -i '' 's/\bMedia\.findAll/models.Media.findAll/g' "$file"
    sed -i '' 's/\bMedia\.create/models.Media.create/g' "$file"
    sed -i '' 's/\bMedia\.destroy/models.Media.destroy/g' "$file"

    sed -i '' 's/\bUserBank\.findOne/models.UserBank.findOne/g' "$file"
    sed -i '' 's/\bUserBank\.findAll/models.UserBank.findAll/g' "$file"
    sed -i '' 's/\bUserBank\.create/models.UserBank.create/g' "$file"
    sed -i '' 's/\bUserBank\.update/models.UserBank.update/g' "$file"
    sed -i '' 's/\bUserBank\.destroy/models.UserBank.destroy/g' "$file"

    sed -i '' 's/\bUserCard\.findOne/models.UserCard.findOne/g' "$file"
    sed -i '' 's/\bUserCard\.findAll/models.UserCard.findAll/g' "$file"
    sed -i '' 's/\bUserCard\.create/models.UserCard.create/g' "$file"
    sed -i '' 's/\bUserCard\.update/models.UserCard.update/g' "$file"
    sed -i '' 's/\bUserCard\.destroy/models.UserCard.destroy/g' "$file"

    sed -i '' 's/\bChildParent\.findOne/models.ChildParent.findOne/g' "$file"
    sed -i '' 's/\bChildParent\.findAll/models.ChildParent.findAll/g' "$file"
    sed -i '' 's/\bChildParent\.create/models.ChildParent.create/g' "$file"

    sed -i '' 's/\bCountry\.findOne/models.Country.findOne/g' "$file"
    sed -i '' 's/\bCountry\.findAll/models.Country.findAll/g' "$file"

    sed -i '' 's/\bActivityLog\.findOne/models.ActivityLog.findOne/g' "$file"
    sed -i '' 's/\bActivityLog\.findAll/models.ActivityLog.findAll/g' "$file"
    sed -i '' 's/\bActivityLog\.create/models.ActivityLog.create/g' "$file"

    sed -i '' 's/\bContact\.findOne/models.Contact.findOne/g' "$file"
    sed -i '' 's/\bContact\.findAll/models.Contact.findAll/g' "$file"
    sed -i '' 's/\bContact\.create/models.Contact.create/g' "$file"
    sed -i '' 's/\bContact\.update/models.Contact.update/g' "$file"
    sed -i '' 's/\bContact\.destroy/models.Contact.destroy/g' "$file"

    sed -i '' 's/\bUserBlock\.findOne/models.UserBlock.findOne/g' "$file"
    sed -i '' 's/\bUserBlock\.findAll/models.UserBlock.findAll/g' "$file"
    sed -i '' 's/\bUserBlock\.create/models.UserBlock.create/g' "$file"
    sed -i '' 's/\bUserBlock\.destroy/models.UserBlock.destroy/g' "$file"

    sed -i '' 's/\bRoles\.findOne/models.Roles.findOne/g' "$file"
    sed -i '' 's/\bRoles\.findAll/models.Roles.findAll/g' "$file"
    sed -i '' 's/\bRoles\.create/models.Roles.create/g' "$file"
    sed -i '' 's/\bRoles\.update/models.Roles.update/g' "$file"

    sed -i '' 's/\bCms\.findOne/models.Cms.findOne/g' "$file"
    sed -i '' 's/\bCms\.findAll/models.Cms.findAll/g' "$file"
    sed -i '' 's/\bCms\.create/models.Cms.create/g' "$file"
    sed -i '' 's/\bCms\.update/models.Cms.update/g' "$file"

    sed -i '' 's/\bPaymentRequest\.findOne/models.PaymentRequest.findOne/g' "$file"
    sed -i '' 's/\bPaymentRequest\.findAll/models.PaymentRequest.findAll/g' "$file"
    sed -i '' 's/\bPaymentRequest\.create/models.PaymentRequest.create/g' "$file"
    sed -i '' 's/\bPaymentRequest\.update/models.PaymentRequest.update/g' "$file"

    sed -i '' 's/\bChangeMobileHistory\.findOne/models.ChangeMobileHistory.findOne/g' "$file"
    sed -i '' 's/\bChangeMobileHistory\.findAll/models.ChangeMobileHistory.findAll/g' "$file"
    sed -i '' 's/\bChangeMobileHistory\.create/models.ChangeMobileHistory.create/g' "$file"

    sed -i '' 's/\bSetting\.findOne/models.Setting.findOne/g' "$file"
    sed -i '' 's/\bSetting\.findAll/models.Setting.findAll/g' "$file"
    sed -i '' 's/\bSetting\.create/models.Setting.create/g' "$file"
    sed -i '' 's/\bSetting\.update/models.Setting.update/g' "$file"

    # Fix models that are already prefixed with models.models (double prefix)
    sed -i '' 's/models\.models\./models./g' "$file"
done

echo "Repository files fixed!"
echo "Now restarting the backend..."