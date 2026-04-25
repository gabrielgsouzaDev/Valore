/** Formato mínimo de dados de backup legado. */
export type LegacyBackupData = {
    _version?: number
    [key: string]: unknown
}

/**
 * Migra dados de backup de versões anteriores para a versão atual.
 */
export function migrateBackup(data: LegacyBackupData, fromVersion: number): LegacyBackupData {
    const migrated = { ...data }

    if (fromVersion < 2) {
        migrated["_version"] = 2
    }

    return migrated
}
