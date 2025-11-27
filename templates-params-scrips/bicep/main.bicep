@description('Location for all resources')
param location string = 'westus2'

@description('Storage account name')
param storageAccountName string = 'bookrblobst'

// App Service Plan name (comentado - no se usa actualmente)
// param appServicePlanName string = 'bookr-app-service'

@description('SQL Server name')
param sqlServerName string = 'bookr-sql-server'

@description('SQL Database name')
param sqlDatabaseName string = 'bookr-sql-db'

@description('SQL Server administrator login')
param sqlAdministratorLogin string = 'bookradmin'

@description('SQL Server administrator password')
@secure()
param sqlAdministratorPassword string

@description('Static Web App name')
param staticWebAppName string = 'bookr-static-web-app'

@description('Static Web App repository URL')
param staticWebAppRepositoryUrl string = 'https://github.com/andrettiprz/bookr'

@description('Static Web App branch')
param staticWebAppBranch string = 'main'

@description('Static Web App repository token (optional)')
@secure()
param staticWebAppRepositoryToken string = ''

@description('Function App name')
param functionAppName string = 'bookr-api'

@description('JWT Secret for authentication')
@secure()
param jwtSecret string = ''

// Storage Account Module
module storageAccount 'modules/storage.bicep' = {
  name: 'storageDeployment'
  params: {
    location: location
    storageAccountName: storageAccountName
    accountType: 'Standard_LRS'
    kind: 'StorageV2'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    defaultOAuth: false
    accessTier: 'Hot'
    publicNetworkAccess: 'Enabled'
    allowCrossTenantReplication: false
    networkAclsBypass: 'AzureServices'
    networkAclsDefaultAction: 'Allow'
    networkAclsIpRules: []
    networkAclsIpv6Rules: []
    publishIpv6Endpoint: false
    dnsEndpointType: 'Standard'
    largeFileSharesState: 'Enabled'
    keySource: 'Microsoft.Storage'
    encryptionEnabled: true
    infrastructureEncryptionEnabled: false
    isBlobSoftDeleteEnabled: true
    blobSoftDeleteRetentionDays: 7
    isContainerSoftDeleteEnabled: true
    containerSoftDeleteRetentionDays: 7
    isShareSoftDeleteEnabled: true
    shareSoftDeleteRetentionDays: 7
  }
}

// App Service Plan Module
// COMENTADO TEMPORALMENTE: La suscripción no tiene cuota para recursos Free
// Descomenta esto si obtienes cuota adicional o cambias a un tier de pago
/*
module appServicePlan 'modules/appServicePlan.bicep' = {
  name: 'appServicePlanDeployment'
  params: {
    name: appServicePlanName
    location: location
    sku: 'Free'
    skuCode: 'F1'
  }
}
*/

// SQL Server Module
module sqlServer 'modules/sqlServer.bicep' = {
  name: 'sqlServerDeployment'
  params: {
    location: location
    serverName: sqlServerName
    databaseName: sqlDatabaseName
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorPassword
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    tier: 'GeneralPurpose'
    skuName: 'GP_S_Gen5_2'
    maxSizeBytes: 34359738368
    zoneRedundant: false
    licenseType: ''
    readScaleOut: 'Disabled'
    numberOfReplicas: 0
    minCapacity: 1
    autoPauseDelay: 60
    allowAzureIps: false
    enableADS: false
    enableVA: false
    useVAManagedIdentity: false
    enableSqlLedger: false
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Disabled'
    connectionType: 'Default'
    requestedBackupStorageRedundancy: 'Local'
    availabilityZone: 'NoPreference'
    useFreeLimit: true
    freeLimitExhaustionBehavior: 'AutoPause'
    maintenanceConfigurationId: '${subscription().id}/providers/Microsoft.Maintenance/publicMaintenanceConfigurations/SQL_Default'
    identity: {
      type: 'None'
    }
    primaryUserAssignedIdentityId: ''
    federatedClientId: ''
    databaseTags: {}
    serverTags: {}
  }
}

// Static Web App Module
module staticWebApp 'modules/staticWebApp.bicep' = {
  name: 'staticWebAppDeployment'
  params: {
    name: staticWebAppName
    location: location
    sku: 'Free'
    skuCode: 'Free'
    repositoryUrl: staticWebAppRepositoryUrl
    branch: staticWebAppBranch
    repositoryToken: staticWebAppRepositoryToken
    appLocation: './frontend'
    apiLocation: ''
    appArtifactLocation: 'dist'
    enterpriseGradeCdnStatus: 'disabled'
  }
}

// Function App Module (Consumption Plan - Serverless)
module functionApp 'modules/functionApp.bicep' = {
  name: 'functionAppDeployment'
  params: {
    functionAppName: functionAppName
    appServicePlanId: ''
    location: location
    sqlServerFqdn: sqlServer.outputs.sqlServerFqdn
    sqlDatabaseName: sqlDatabaseName
    sqlUser: sqlAdministratorLogin
    sqlPassword: sqlAdministratorPassword
    storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.outputs.storageAccountName};EndpointSuffix=core.windows.net'
    jwtSecret: jwtSecret != '' ? jwtSecret : 'bookr-jwt-secret-change-in-production-${uniqueString(resourceGroup().id)}'
  }
}

// Outputs
output storageAccountName string = storageAccount.outputs.storageAccountName
output storageAccountId string = storageAccount.outputs.storageAccountId
// output appServicePlanName string = appServicePlan.outputs.appServicePlanName
// output appServicePlanId string = appServicePlan.outputs.appServicePlanId
output sqlServerName string = sqlServer.outputs.sqlServerName
output sqlServerFqdn string = sqlServer.outputs.sqlServerFqdn
output databaseName string = sqlServer.outputs.databaseName
output staticWebAppName string = staticWebApp.outputs.staticWebAppName
output staticWebAppUrl string = staticWebApp.outputs.defaultHostname
output functionAppName string = functionApp.outputs.functionAppName
output functionAppUrl string = functionApp.outputs.functionAppUrl

