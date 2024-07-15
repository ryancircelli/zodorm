# main.tf

provider "aws" {
  region = var.aws_region
}

# reads generated schema from zodorm
module "table" {
  source    = "./modules/tables"
  for_each  = jsondecode(
    file("${path.module}/../zodorm/terraformSchema.json")
  )
  name      = each.key
  range_key = each.value.range_key
  hash_key  = each.value.hash_key
  gsi       = each.value.gsi
  stream    = each.value.stream
  app_name  = var.app_name
  env       = var.env
}

locals {
  table_names = {
    for table_name, table_config in module.table :
    table_name => table_config.name
  }
}
