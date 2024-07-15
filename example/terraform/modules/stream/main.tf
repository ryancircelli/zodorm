
resource "aws_kinesis_stream" "kinesis_stream" {
  name             = "${var.app_name}-${var.env}-${var.name}_stream"
  shard_count      = 1
  retention_period = 24
}

data "aws_iam_policy_document" "firehose_policy" {
  statement {
    effect = "Allow"
    actions = [
      "kinesis:DescribeStream",
      "kinesis:GetShardIterator",
      "kinesis:GetRecords",
      "kinesis:ListShards",
    ]
    resources = [
      aws_kinesis_stream.kinesis_stream.arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:AbortMultipartUpload",
      "s3:GetBucketLocation",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:ListBucketMultipartUploads",
      "s3:PutObject"
    ]
    resources = [
      aws_s3_bucket.bucket.arn,
      "${aws_s3_bucket.bucket.arn}/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "logs:PutLogEvents",
      "logs:CreateLogStream",
      "logs:CreateLogGroup",
    ]
    resources = [
      "arn:aws:logs:*:*:*"
    ]
  }
}

resource "aws_iam_role_policy" "firehose_role_policy" {
  name   = "firehose_role_policy"
  role   = aws_iam_role.firehose_role.id
  policy = data.aws_iam_policy_document.firehose_policy.json
}

resource "aws_iam_role" "firehose_role" {
  name = "firehose_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "firehose.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_dynamodb_kinesis_streaming_destination" "dynamodb_streaming" {
  stream_arn = aws_kinesis_stream.kinesis_stream.arn
  table_name = var.table_name
}

resource "aws_kinesis_firehose_delivery_stream" "dynamodb_stream" {
  name        = "${var.app_name}-${var.env}-${var.name}_stream_to_kinesis"
  destination = "http_endpoint"

  kinesis_source_configuration {
    kinesis_stream_arn = aws_kinesis_stream.kinesis_stream.arn
    role_arn           = aws_iam_role.firehose_role.arn
  }

  http_endpoint_configuration {
    name               = "${var.app_name}-${var.env}-${var.name}_kinesis_to_endpoint"
    buffering_size     = var.stream.firehoseSize
    buffering_interval = var.stream.firehoseTime
    url                = var.stream.httpEndpoint

    access_key = "my-key"
    role_arn   = aws_iam_role.firehose_role.arn

    s3_backup_mode = "FailedDataOnly"

    s3_configuration {
      role_arn           = aws_iam_role.firehose_role.arn
      bucket_arn         = aws_s3_bucket.bucket.arn
      buffering_size     = 10
      buffering_interval = 400
      compression_format = "UNCOMPRESSED"
    }

    request_configuration {
      content_encoding = "NONE"

      common_attributes {
        name  = "ngrok-skip-browser-warning"
        value = "true"
      }
    }

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = aws_cloudwatch_log_group.firehose_log_group.name
      log_stream_name = aws_cloudwatch_log_stream.firehose_log_stream.name
    }
  }
}

resource "aws_s3_bucket" "bucket" {
  bucket = "${lower(var.app_name)}-${var.env}-${lower(var.name)}-kinesis-bucket"
}

resource "aws_cloudwatch_log_group" "firehose_log_group" {
  name = "${var.app_name}-${var.env}-${var.name}_kinesis_firehose_log_group"
}

resource "aws_cloudwatch_log_stream" "firehose_log_stream" {
  name           = "${var.app_name}-${var.env}-${var.name}_kinesis_firehose_log"
  log_group_name = aws_cloudwatch_log_group.firehose_log_group.name
}
