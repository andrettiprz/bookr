@description('App Service Plan name')
param name string

@description('Location for the App Service Plan')
param location string = resourceGroup().location

@description('SKU tier')
param sku string = 'Free'

@description('SKU code')
param skuCode string = 'F1'

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: name
  location: location
  kind: 'linux'
  properties: {
    reserved: true
    zoneRedundant: false
  }
  sku: {
    tier: sku
    name: skuCode
  }
}

output appServicePlanName string = appServicePlan.name
output appServicePlanId string = appServicePlan.id

