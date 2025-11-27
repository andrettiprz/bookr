@description('SQL Server administrator login')
param administratorLogin string = ''

@description('SQL Server administrator login password')
@secure()
param administratorLoginPassword string = ''

@description('Database collation')
param collation string = 'SQL_Latin1_General_CP1_CI_AS'

@description('Database name')
param databaseName string

@description('Database tier')
param tier string = 'GeneralPurpose'

@description('Database SKU name')
param skuName string = 'GP_S_Gen5_2'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Database max size in bytes')
param maxSizeBytes int = 34359738368

@description('Server name')
param serverName string

@description('Sample name')
param sampleName string = ''

@description('Zone redundant')
param zoneRedundant bool = false

@description('License type')
param licenseType string = ''

@description('Read scale out')
param readScaleOut string = 'Disabled'

@description('Number of replicas')
param numberOfReplicas int = 0

@description('Auto pause delay in minutes')
param autoPauseDelay int = 60

@description('Allow Azure IPs')
param allowAzureIps bool = false

@description('Database tags')
param databaseTags object = {}

@description('Server tags')
param serverTags object = {}

@description('Enable Advanced Data Security')
param enableADS bool = false

@description('Enable Vulnerability Assessment')
param enableVA bool = false

@description('Use VA managed identity')
param useVAManagedIdentity bool = false

@description('Enable SQL Ledger')
param enableSqlLedger bool = false

@description('Minimal TLS version')
param minimalTlsVersion string = '1.2'

@description('Public network access')
param publicNetworkAccess string = 'Disabled'

@description('Connection type')
param connectionType string = 'Default'

@description('Requested backup storage redundancy')
param requestedBackupStorageRedundancy string = 'Local'

@description('Availability zone')
param availabilityZone string = 'NoPreference'

@description('Use free limit')
param useFreeLimit bool = true

@description('Free limit exhaustion behavior')
param freeLimitExhaustionBehavior string = 'AutoPause'

@description('Maintenance configuration ID')
param maintenanceConfigurationId string = ''

@description('Identity')
param identity object = {}

@description('Primary user assigned identity ID')
param primaryUserAssignedIdentityId string = ''

@description('Federated client ID')
param federatedClientId string = ''

var uniqueStorage = uniqueString(subscription().subscriptionId, resourceGroup().name, location)
var storageName = toLower('sqlva${uniqueStorage}')

// Storage Account for VA (if enabled)
resource vaStorageAccount 'Microsoft.Storage/storageAccounts@2019-04-01' = if (enableVA && !useVAManagedIdentity) {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2021-05-01-preview' = {
  name: serverName
  location: location
  tags: serverTags
  properties: {
    version: '12.0'
    minimalTlsVersion: minimalTlsVersion
    publicNetworkAccess: publicNetworkAccess
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword != '' ? administratorLoginPassword : null
    primaryUserAssignedIdentityId: primaryUserAssignedIdentityId != '' ? primaryUserAssignedIdentityId : null
    federatedClientId: federatedClientId != '' ? federatedClientId : null
  }
  identity: identity
}

// Connection Policy
resource connectionPolicy 'Microsoft.Sql/servers/connectionPolicies@2021-08-01-preview' = {
  parent: sqlServer
  name: 'Default'
  properties: {
    connectionType: connectionType
  }
}

// Database
resource database 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: databaseTags
  properties: {
    collation: collation
    maxSizeBytes: maxSizeBytes
    sampleName: sampleName != '' ? sampleName : null
    zoneRedundant: zoneRedundant
    licenseType: licenseType != '' ? licenseType : null
    readScale: readScaleOut
    highAvailabilityReplicaCount: numberOfReplicas
    autoPauseDelay: autoPauseDelay
    requestedBackupStorageRedundancy: requestedBackupStorageRedundancy
    isLedgerOn: enableSqlLedger
    availabilityZone: availabilityZone
    useFreeLimit: useFreeLimit
    freeLimitExhaustionBehavior: freeLimitExhaustionBehavior != '' ? freeLimitExhaustionBehavior : null
    maintenanceConfigurationId: maintenanceConfigurationId != '' ? maintenanceConfigurationId : null
  }
  sku: {
    name: skuName
    tier: tier
  }
  dependsOn: [
    connectionPolicy
  ]
}

// Firewall Rule - Allow Azure IPs
resource allowAzureIpsRule 'Microsoft.Sql/servers/firewallRules@2021-11-01' = if (allowAzureIps) {
  parent: sqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Advanced Threat Protection
resource advancedThreatProtection 'Microsoft.Sql/servers/advancedThreatProtectionSettings@2021-11-01-preview' = if (enableADS) {
  parent: sqlServer
  name: 'Default'
  properties: {
    state: 'Enabled'
  }
  dependsOn: [
    database
  ]
}

// Vulnerability Assessment
resource vulnerabilityAssessment 'Microsoft.Sql/servers/vulnerabilityAssessments@2018-06-01-preview' = if (enableVA && !useVAManagedIdentity) {
  parent: sqlServer
  name: 'Default'
  properties: {
    storageContainerPath: '${vaStorageAccount.properties.primaryEndpoints.blob}vulnerability-assessment'
    storageAccountAccessKey: vaStorageAccount.listKeys().keys[0].value
    recurringScans: {
      isEnabled: true
      emailSubscriptionAdmins: false
      emails: []
    }
  }
  dependsOn: [
    advancedThreatProtection
  ]
}

output sqlServerName string = sqlServer.name
output sqlServerId string = sqlServer.id
output databaseName string = database.name
output databaseId string = database.id
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName

