@description('Location for all resources')
param location string = resourceGroup().location

@description('Storage account name')
param storageAccountName string

@description('Storage account type')
param accountType string = 'Standard_LRS'

@description('Storage account kind')
param kind string = 'StorageV2'

@description('Minimum TLS version')
param minimumTlsVersion string = 'TLS1_2'

@description('Supports HTTPS traffic only')
param supportsHttpsTrafficOnly bool = true

@description('Allow blob public access')
param allowBlobPublicAccess bool = false

@description('Allow shared key access')
param allowSharedKeyAccess bool = true

@description('Default OAuth authentication')
param defaultOAuth bool = false

@description('Access tier')
param accessTier string = 'Hot'

@description('Public network access')
param publicNetworkAccess string = 'Enabled'

@description('Allow cross tenant replication')
param allowCrossTenantReplication bool = false

@description('Network ACLs bypass')
param networkAclsBypass string = 'AzureServices'

@description('Network ACLs default action')
param networkAclsDefaultAction string = 'Allow'

@description('Network ACLs IP rules')
param networkAclsIpRules array = []

@description('Network ACLs IPv6 rules')
param networkAclsIpv6Rules array = []

@description('Publish IPv6 endpoint')
param publishIpv6Endpoint bool = false

@description('DNS endpoint type')
param dnsEndpointType string = 'Standard'

@description('Large file shares state')
param largeFileSharesState string = 'Enabled'

@description('Key source for encryption')
param keySource string = 'Microsoft.Storage'

@description('Encryption enabled')
param encryptionEnabled bool = true

@description('Infrastructure encryption enabled')
param infrastructureEncryptionEnabled bool = false

@description('Blob soft delete enabled')
param isBlobSoftDeleteEnabled bool = true

@description('Blob soft delete retention days')
param blobSoftDeleteRetentionDays int = 7

@description('Container soft delete enabled')
param isContainerSoftDeleteEnabled bool = true

@description('Container soft delete retention days')
param containerSoftDeleteRetentionDays int = 7

@description('Share soft delete enabled')
param isShareSoftDeleteEnabled bool = true

@description('Share soft delete retention days')
param shareSoftDeleteRetentionDays int = 7

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2025-06-01' = {
  name: storageAccountName
  location: location
  kind: kind
  sku: {
    name: accountType
  }
  properties: {
    minimumTlsVersion: minimumTlsVersion
    supportsHttpsTrafficOnly: supportsHttpsTrafficOnly
    allowBlobPublicAccess: allowBlobPublicAccess
    allowSharedKeyAccess: allowSharedKeyAccess
    defaultToOAuthAuthentication: defaultOAuth
    accessTier: accessTier
    publicNetworkAccess: publicNetworkAccess
    allowCrossTenantReplication: allowCrossTenantReplication
    networkAcls: {
      bypass: networkAclsBypass
      defaultAction: networkAclsDefaultAction
      ipRules: networkAclsIpRules
      ipv6Rules: networkAclsIpv6Rules
    }
    dualStackEndpointPreference: {
      publishIpv6Endpoint: publishIpv6Endpoint
    }
    dnsEndpointType: dnsEndpointType
    largeFileSharesState: largeFileSharesState
    encryption: {
      keySource: keySource
      services: {
        blob: {
          enabled: encryptionEnabled
        }
        file: {
          enabled: encryptionEnabled
        }
        table: {
          enabled: encryptionEnabled
        }
        queue: {
          enabled: encryptionEnabled
        }
      }
      requireInfrastructureEncryption: infrastructureEncryptionEnabled
    }
  }
}

// Blob Service
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2025-06-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: isBlobSoftDeleteEnabled
      days: blobSoftDeleteRetentionDays
    }
    containerDeleteRetentionPolicy: {
      enabled: isContainerSoftDeleteEnabled
      days: containerSoftDeleteRetentionDays
    }
  }
}

// File Service
resource fileService 'Microsoft.Storage/storageAccounts/fileServices@2025-06-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    shareDeleteRetentionPolicy: {
      enabled: isShareSoftDeleteEnabled
      days: shareSoftDeleteRetentionDays
    }
  }
  dependsOn: [
    blobService
  ]
}

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output storageAccountKey string = storageAccount.listKeys().keys[0].value

