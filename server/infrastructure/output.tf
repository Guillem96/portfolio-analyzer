output "api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "api_lambda_arn" {
  value = aws_lambda_function.handler.arn
}

output "api_lambda_name" {
  value = aws_lambda_function.handler.function_name
}

output "task_exchange_rates_lambda_arn" {
  value = aws_lambda_function.tasks["exchange-rates-task"].arn
}

output "task_exchange_rates_lambda_name" {
  value = aws_lambda_function.tasks["exchange-rates-task"].function_name
}

output "task_compute_value_lambda_arn" {
  value = aws_lambda_function.tasks["compute-value-task"].arn
}

output "task_compute_value_lambda_name" {
  value = aws_lambda_function.tasks["compute-value-task"].function_name
}

output "task_cache_tickers_lambda_arn" {
  value = aws_lambda_function.tasks["cache-tickers-task"].arn
}

output "task_cache_tickers_lambda_name" {
  value = aws_lambda_function.tasks["cache-tickers-task"].function_name
}