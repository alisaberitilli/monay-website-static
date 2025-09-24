#!/bin/bash

# Database Backup Script
# Runs daily at noon (12:00) and midnight (00:00)

# Configuration
BACKUP_DIR="/Users/alisaberi/Data/0ProductBuild/monay/backups"
DB_USER="alisaberi"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup_log_$(date +%Y%m%d).log"

# Use PostgreSQL 16 tools to match server version
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_message "Starting database backup process"

# Get list of all databases (excluding template databases)
DATABASES=$(psql -U $DB_USER -d postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres';" | grep -v '^$')

# Backup each database
for DB in $DATABASES; do
    DB_NAME=$(echo $DB | xargs)  # Trim whitespace
    BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

    log_message "Backing up database: $DB_NAME"

    # Perform backup and compress
    if pg_dump -U $DB_USER -d "$DB_NAME" | gzip > "$BACKUP_FILE" 2>/dev/null; then
        log_message "Successfully backed up $DB_NAME to $BACKUP_FILE"

        # Keep only last 7 days of backups for each database
        find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete
        log_message "Cleaned up old backups for $DB_NAME (kept last 7 days)"
    else
        log_message "ERROR: Failed to backup $DB_NAME"
    fi
done

# Also create a combined backup of all databases
ALL_BACKUP_FILE="$BACKUP_DIR/all_databases_${TIMESTAMP}.sql.gz"
log_message "Creating combined backup of all databases"

if pg_dumpall -U $DB_USER | gzip > "$ALL_BACKUP_FILE" 2>/dev/null; then
    log_message "Successfully created combined backup: $ALL_BACKUP_FILE"

    # Keep only last 7 days of combined backups
    find "$BACKUP_DIR" -name "all_databases_*.sql.gz" -mtime +7 -delete
    log_message "Cleaned up old combined backups (kept last 7 days)"
else
    log_message "ERROR: Failed to create combined backup"
fi

# Report backup sizes
log_message "Backup sizes:"
for BACKUP in "$BACKUP_DIR"/*_${TIMESTAMP}.sql.gz; do
    if [ -f "$BACKUP" ]; then
        SIZE=$(du -h "$BACKUP" | cut -f1)
        log_message "  $(basename $BACKUP): $SIZE"
    fi
done

# Calculate total backup directory size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log_message "Total backup directory size: $TOTAL_SIZE"

log_message "Database backup process completed"
echo "Backup completed at $(date). Check log at: $LOG_FILE"