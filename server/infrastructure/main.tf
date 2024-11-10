terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }

  backend "s3" {
    bucket = "720505047185-terraform-state"
    key    = "portfolio-analyzer/terraform.tfstate"
    region = "eu-west-2"
  }
}

provider "aws" {
  region = "eu-west-2"
}

data "aws_caller_identity" "current" {}


variable "jwt_secret" {
  type        = string
  description = "JWT secret to sign the tokens"
  sensitive   = true
}

variable "google_auth_client_id" {
  type        = string
  description = "Google Auth Client ID"
  sensitive   = true
}

variable "google_auth_client_secret" {
  type        = string
  description = "Google Auth Client secret"
  sensitive   = true
}

variable "database_url" {
  type        = string
  description = "Database URL"
  sensitive   = true
}

locals {
  name_prefix = "portfolio-analyzer-server"
}


# IAM ##########################################

data "aws_iam_policy_document" "assume_role" {
  policy_id = "${local.name_prefix}-lambda"
  version   = "2012-10-17"
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.name_prefix}-lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}


data "aws_iam_policy_document" "logs" {
  policy_id = "${local.name_prefix}-lambda-logs"
  version   = "2012-10-17"
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:*:*:*"
    ]
  }
}

resource "aws_iam_policy" "logs" {
  name   = "${local.name_prefix}-lambda-logs"
  policy = data.aws_iam_policy_document.logs.json
}

resource "aws_iam_role_policy_attachment" "logs" {
  depends_on = [aws_iam_role.lambda, aws_iam_policy.logs]
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.logs.arn
}


# CLOUDWATCH ##########################################

resource "aws_cloudwatch_log_group" "log" {
  name              = "/aws/lambda/${local.name_prefix}"
  retention_in_days = 7
}

# LAMBDA FUNCTION #####################################

resource "aws_lambda_function" "handler" {
  function_name = "${local.name_prefix}-handler"
  package_type  = "Image"
  image_uri     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-west-2.amazonaws.com/portfolio-analyzer:latest"
  role          = aws_iam_role.lambda.arn
  memory_size   = 1024
  timeout       = 60

  depends_on = [
    aws_iam_role_policy_attachment.logs,
    aws_cloudwatch_log_group.log,
  ]

  environment {
    variables = {
      GOOGLE_AUTH_CLIENT_ID     = var.google_auth_client_id
      GOOGLE_AUTH_CLIENT_SECRET = var.google_auth_client_secret
      GOOGLE_AUTH_REDIRECT_URI  = "http://localhost:8080/auth/google/callback"
      JWT_SECRET                = var.jwt_secret
      ENVIRONMENT               = "prod"
      DATABASE_URL              = var.database_url
      TICKER_INFO_API           = "https://wcou3sszabchl2bemt7sxwbjey0cbkmx.lambda-url.eu-west-2.on.aws"
    }
  }
}

resource "aws_lambda_permission" "apigw" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handler.arn
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}


# API GW #####################################

resource "aws_apigatewayv2_api" "api" {
  name          = "${local.name_prefix}-api"
  protocol_type = "HTTP"
  description   = "Portfolio Analyzer Project API"
  target        = aws_lambda_function.handler.arn
}
