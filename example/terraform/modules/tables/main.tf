locals {
  gsi_attributes = var.gsi != null ? flatten([
    for index, gsi in var.gsi : [
      gsi.hash_key,
      gsi.range_key
    ]
  ]) : []
}

output "gsi_attributes" {
  value = local.gsi_attributes
}

resource "aws_dynamodb_table" "table" {
  name         = "${var.app_name}-${var.env}-${var.name}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.hash_key.name
  attribute {
    name = var.hash_key.name
    type = var.hash_key.type
  }

  range_key = var.range_key != null ? var.range_key.name : null
  dynamic "attribute" {
    for_each = var.range_key != null ? [1] : []
    content {
      name = var.range_key.name
      type = var.range_key.type
    }
  }

  dynamic "attribute" {
    for_each = local.gsi_attributes
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = var.gsi != null ? var.gsi : []
    content {
      name            = global_secondary_index.value.name
      hash_key        = global_secondary_index.value.hash_key.name
      range_key       = global_secondary_index.value.range_key != null ? global_secondary_index.value.range_key.name : null
      projection_type = "ALL"
    }
  }

  stream_enabled   = var.stream != null
  stream_view_type = var.stream != null ? "NEW_AND_OLD_IMAGES" : ""
}

data "aws_iam_policy_document" "this" {
  statement {
    effect  = "Allow"
    actions = ["dynamodb:*"]
    resources = [
      aws_dynamodb_table.table.arn,
      "${aws_dynamodb_table.table.arn}/index/*"
    ]
  }
}
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["appsync.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}
resource "aws_iam_role" "this" {
  name               = "${var.app_name}-${var.env}-${var.name}_iam_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy" "this" {
  name   = "${var.app_name}-${var.env}-${var.name}_iam_role_policy"
  role   = aws_iam_role.this.id
  policy = data.aws_iam_policy_document.this.json
}

module "stream" {
  count      = var.stream != null ? 1 : 0
  source     = "../stream"
  table_name = aws_dynamodb_table.table.name
  stream     = var.stream
  name       = var.name
  app_name   = var.app_name
  env        = var.env
}
