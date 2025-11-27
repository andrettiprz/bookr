@description('Function App name')
param functionAppName string

@description('App Service Plan ID (leave empty for Consumption Plan)')
param appServicePlanId string = ''

@description('Location for the Function App')
param location string = resourceGroup().location

@description('SQL Server FQDN')
param sqlServerFqdn string

@description('SQL Database name')
param sqlDatabaseName string

@description('SQL User')
param sqlUser string

@description('SQL Password')
@secure()
param sqlPassword string

@description('Storage account connection string')
@secure()
param storageConnectionString string

@description('JWT Secret')
@secure()
param jwtSecret string

// Function App (Consumption Plan - Dynamic)
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: appServicePlanId != '' ? appServicePlanId : ''
    siteConfig: {
      use32BitWorkerProcess: false
      alwaysOn: appServicePlanId != '' ? true : false
      linuxFxVersion: 'NODE|18'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageConnectionString
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: storageConnectionString
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'SQL_SERVER'
          value: sqlServerFqdn
        }
        {
          name: 'SQL_DATABASE'
          value: sqlDatabaseName
        }
        {
          name: 'SQL_USER'
          value: sqlUser
        }
        {
          name: 'SQL_PASSWORD'
          value: sqlPassword
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: storageConnectionString
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
      ]
    }
    httpsOnly: true
  }
}

output functionAppName string = functionApp.name
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppId string = functionApp.id

