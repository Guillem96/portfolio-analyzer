output "api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "api_lambda_arn" {
  value = aws_lambda_function.handler.arn
}

output "api_lambda_name" {
  value = aws_lambda_function.handler.function_name
}
